import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";
import { getUniqueViewCounts } from "@/lib/view-utils";

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

    // Invalidate all caches that contain user engagement state - MUST await
    await Promise.all([
      responseCache.invalidatePattern(/^feed:/),
      responseCache.invalidatePattern(new RegExp(`^user:${user.id}:`)),
      responseCache.invalidatePattern(new RegExp(`^hashtag:.*:${user.id}$`))
    ]);

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

    // OPTIMIZED: Use select with _count instead of include with full arrays
    // This reduces payload size by ~95% for posts with many engagements
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            isPinned: true,
            isSlideshow: true,
            location: true,
            embedUrls: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                name: true,
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
            // Use _count instead of fetching all records
            _count: {
              select: {
                likes: true,
                reposts: true,
                savedBy: true,
                replies: true
              }
            },
            media: {
              select: { id: true, mediaUrl: true, mediaType: true, order: true },
              orderBy: { order: 'asc' }
            },
            poll: {
              select: {
                id: true,
                question: true,
                expiresAt: true,
                isMultiple: true,
                options: {
                  select: {
                    id: true,
                    text: true,
                    _count: { select: { votes: true } }
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

    // OPTIMIZATION: Batch fetch all data in parallel (no N+1 queries)
    const postIds = savedPosts.map(sp => sp.post.id);
    const pollIds = savedPosts
      .filter(sp => sp.post.poll)
      .map(sp => sp.post.poll!.id);
    
    const currentUserId = (session.user as { id?: string })?.id;
    
    // Batch fetch: views + user's poll votes (if logged in)
    const [viewsMap, userPollVotes] = await Promise.all([
      // Use optimized batch view count function
      getUniqueViewCounts(postIds),
      // Batch fetch all poll votes for current user (instead of N+1)
      currentUserId && pollIds.length > 0
        ? prisma.pollVote.findMany({
            where: {
              pollId: { in: pollIds },
              userId: currentUserId
            },
            select: { optionId: true }
          })
        : Promise.resolve([])
    ]);
    
    const userVotedOptions = new Set(userPollVotes.map(v => v.optionId));

    // Batch fetch user's likes and reposts for these posts
    const [userLikes, userReposts] = await Promise.all([
      currentUserId ? prisma.postLike.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      currentUserId ? prisma.postRepost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([])
    ]);
    
    const likedPostIds = new Set(userLikes.map(l => l.postId));
    const repostedPostIds = new Set(userReposts.map(r => r.postId));

    // Transform posts (no async needed now - all data is pre-fetched)
    const postsWithViewCounts = savedPosts.map((savedPost) => {
      const viewCount = viewsMap.get(savedPost.post.id) || 0;
      const post = savedPost.post as any;
      
      // Transform to expected format with proper engagement flags
      const transformedPost = {
        ...post,
        views: viewCount,
        // Set boolean flags for current user's engagement
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
        isSaved: true, // Always true since these are saved posts
        // Keep counts for display
        likes: [],
        reposts: [],
        savedBy: [],
        replies: Array(post._count?.replies || 0).fill(null),
        poll: post.poll ? {
          id: post.poll.id,
          question: post.poll.question,
          isMultiple: post.poll.isMultiple,
          expiresAt: post.poll.expiresAt,
          totalVotes: post.poll.options.reduce((sum: number, opt: any) => sum + (opt._count?.votes || 0), 0),
          options: post.poll.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            votes: opt._count?.votes || 0,
            isSelected: userVotedOptions.has(opt.id)
          }))
        } : undefined
      };
      
      return { ...savedPost, post: transformedPost };
    });

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
