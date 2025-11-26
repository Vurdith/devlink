import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;
    
    // IMPORTANT: Do NOT cache reposts endpoint
    // Caching causes stale data to be served after unrepost/unlike/save actions
    // The profile page needs fresh data immediately for proper UX
    
    // Get posts that this user has reposted
    const repostedPosts = await prisma.post.findMany({
      where: {
        reposts: {
          some: {
            userId: userId
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
        },
        replyTo: {
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
            }
          }
        }
      }
    });

    // OPTIMIZATION: Batch fetch all views instead of N+1 queries
    const postIds = repostedPosts.map(p => p.id);
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
    const transformedPostsWithViews = await Promise.all(
      repostedPosts.map(async (post) => {
        const viewCount = viewsMap.get(post.id)?.size || 0;
        
        // Transform poll data if it exists
        let transformedPost = { ...post, views: viewCount };
        
        if (post.poll && session?.user?.id) {
          const totalVotes = post.poll.options.reduce((sum: number, option: any) => sum + (option.votes?.length || 0), 0);
          
          // Check if current user has voted on this poll
          const userVotes = await prisma.pollVote.findMany({
            where: {
              pollId: post.poll.id,
              userId: session.user.id
            },
            select: { optionId: true }
          });
          const userVotedOptions = userVotes.map(vote => vote.optionId);
          
          transformedPost.poll = {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map((option: any) => ({
              id: option.id,
              text: option.text,
              votes: option.votes?.length || 0,
              isSelected: userVotedOptions.includes(option.id),
              createdAt: option.createdAt,
              pollId: option.pollId
            })),
            isMultiple: post.poll.isMultiple,
            expiresAt: post.poll.expiresAt,
            totalVotes
          } as any;
        } else if (post.poll) {
          // Transform poll data without user vote status
          const totalVotes = post.poll.options.reduce((sum: number, option: any) => sum + (option.votes?.length || 0), 0);
          
          transformedPost.poll = {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map((option: any) => ({
              id: option.id,
              text: option.text,
              votes: option.votes?.length || 0,
              isSelected: false,
              createdAt: option.createdAt,
              pollId: option.pollId
            })),
            isMultiple: post.poll.isMultiple,
            expiresAt: post.poll.expiresAt,
            totalVotes
          } as any;
        } else {
          transformedPost.poll = undefined as any;
        }
        
        return transformedPost as any;
      })
    );
    
    // Return fresh data without caching - profile tab updates need to be instant
    return NextResponse.json(transformedPostsWithViews, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching reposted posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch reposted posts" },
      { status: 500 }
    );
  }
}
