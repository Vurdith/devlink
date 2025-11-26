import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId: user.id, postId } }
    });

    let saved: boolean;
    if (existingSave) {
      // Unsave the post
      await prisma.savedPost.delete({
        where: { userId_postId: { userId: user.id, postId } }
      });
      saved = false;
    } else {
      // Save the post
      await prisma.savedPost.create({
        data: {
          userId: user.id,
          postId
        }
      });
      saved = true;
    }

    // Invalidate feed cache to reflect the new save state
    responseCache.invalidatePattern(/^feed:/);
    // Also invalidate current user's engagement caches
    responseCache.invalidatePattern(new RegExp(`^users:${user.id}:`));
    responseCache.invalidatePattern(new RegExp(`^saved-posts:${user.id}:`));
    
    // Explicitly delete all saved posts cache keys (they're paginated)
    // Delete common pagination patterns
    for (let page = 1; page <= 10; page++) {
      for (let limit of [20, 50, 100]) {
        const savedPostsCacheKey = `saved-posts:${user.id}:page-${page}:limit-${limit}`;
        responseCache.delete(savedPostsCacheKey);
      }
    }
    // Also delete the generic key pattern
    const genericSavedCacheKey = `saved-posts:${user.id}:posts`;
    responseCache.delete(genericSavedCacheKey);

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Save/unsave post error:", error);
    return NextResponse.json({ error: "Failed to save/unsave post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // IMPORTANT: Do NOT cache saves endpoint
    // Caching causes stale data to be served after unsave actions
    // The profile page needs fresh data immediately for instant updates

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    avatarUrl: true,
                    bannerUrl: true,
                    profileType: true,
                    verified: true,
                    bio: true,
                    website: true,
                    location: true
                  }
                },
                _count: {
                  select: {
                    followers: true,
                    following: true
                  }
                }
              }
            },
            likes: true,
            reposts: true,
            savedBy: true,
            replies: true,
            media: {
              orderBy: { order: 'asc' }
            },
            poll: {
              include: {
                options: {
                  include: {
                    votes: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    // OPTIMIZATION: Batch fetch all views instead of N+1 queries
    const postIds = savedPosts.map(sp => sp.post.id);
    const allViews = await prisma.postView.findMany({
      where: { postId: { in: postIds } },
      select: { postId: true, userId: true }
    });
    
    // Group views by postId and calculate unique counts
    const viewsMap = new Map<string, Set<string>>();
    allViews.forEach(view => {
      if (!viewsMap.has(view.postId)) {
        viewsMap.set(view.postId, new Set<string>());
      }
      if (view.userId) {
        viewsMap.get(view.postId)!.add(view.userId);
      }
    });

    // Add unique account view counts and transform poll data to posts
    const postsWithViewCounts = await Promise.all(
      savedPosts.map(async (savedPost) => {
        const viewCount = viewsMap.get(savedPost.post.id)?.size || 0;
        
        // Transform poll data if it exists
        let transformedPost = { ...savedPost.post, views: viewCount };
        
        if (savedPost.post.poll && session?.user?.id) {
          const totalVotes = savedPost.post.poll.options.reduce((sum: number, option: any) => sum + (option.votes?.length || 0), 0);
          
          // Check if current user has voted on this poll
          const userVotes = await prisma.pollVote.findMany({
            where: {
              pollId: savedPost.post.poll.id,
              userId: session.user.id
            },
            select: { optionId: true }
          });
          const userVotedOptions = userVotes.map(vote => vote.optionId);
          
          transformedPost.poll = {
            id: savedPost.post.poll.id,
            question: savedPost.post.poll.question,
            options: savedPost.post.poll.options.map((option: any) => ({
              id: option.id,
              text: option.text,
              votes: option.votes?.length || 0,
              isSelected: userVotedOptions.includes(option.id),
              createdAt: option.createdAt,
              pollId: option.pollId
            })),
            isMultiple: savedPost.post.poll.isMultiple,
            expiresAt: savedPost.post.poll.expiresAt,
            totalVotes
          } as any;
        } else if (savedPost.post.poll) {
          // Transform poll data without user vote status
          const totalVotes = savedPost.post.poll.options.reduce((sum: number, option: any) => sum + (option.votes?.length || 0), 0);
          
          transformedPost.poll = {
            id: savedPost.post.poll.id,
            question: savedPost.post.poll.question,
            options: savedPost.post.poll.options.map((option: any) => ({
              id: option.id,
              text: option.text,
              votes: option.votes?.length || 0,
              isSelected: false,
              createdAt: option.createdAt,
              pollId: option.pollId
            })),
            isMultiple: savedPost.post.poll.isMultiple,
            expiresAt: savedPost.post.poll.expiresAt,
            totalVotes
          } as any;
        } else {
          transformedPost.poll = undefined as any;
        }
        
        return { ...savedPost, post: transformedPost };
      })
    );

    // Return fresh data without caching - profile tab updates need to be instant
    return NextResponse.json({ savedPosts: postsWithViewCounts }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Saved posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 });
  }
}
