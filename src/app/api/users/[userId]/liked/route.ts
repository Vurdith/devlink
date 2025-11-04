import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { responseCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    
    // Use cache key that can be invalidated when likes change
    const cacheKey = `users:${userId}:liked-posts`;
    
    // Try to get from cache first
    let postsWithViews = responseCache.get(cacheKey);
    if (postsWithViews) {
      return NextResponse.json(postsWithViews);
    }
    
    // Get posts that this user has liked
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId: userId
          }
        }
      },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Add view counts and transform poll data to posts
    const transformedPostsWithViews = await Promise.all(
      likedPosts.map(async (post) => {
        const viewCount = await prisma.postView.count({
          where: { postId: post.id }
        });
        
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
    
    // Cache the response
    responseCache.set(cacheKey, transformedPostsWithViews);
    return NextResponse.json(transformedPostsWithViews);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked posts" },
      { status: 500 }
    );
  }
}
