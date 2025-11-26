import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getUniqueViewCounts } from "@/lib/view-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hashtag: string }> }
) {
  try {
    const { hashtag } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Find the hashtag
    const hashtagRecord = await prisma.hashtag.findUnique({
      where: { name: hashtag.toLowerCase() }
    });

    if (!hashtagRecord) {
      return NextResponse.json({ posts: [], hashtag: null });
    }

    // Count posts matching this hashtag for pagination metadata
    const totalPosts = await prisma.post.count({
      where: {
        replyToId: null,
        hashtags: {
          some: { hashtagId: hashtagRecord.id },
        },
      },
    });

    // Fetch posts for this hashtag with pagination applied
    const posts = await prisma.post.findMany({
      where: {
        replyToId: null, // Only main posts, no replies
        hashtags: {
          some: {
            hashtagId: hashtagRecord.id
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
                location: true,
                createdAt: true
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
        hashtags: {
          include: { hashtag: { select: { name: true } } }
        },
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
        replies: {
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
        },
        views: {
          select: { postId: true, userId: true, viewedAt: true }
        }
      }
    });

    const postIds = posts.map((post) => post.id);
    const viewCountMap = await getUniqueViewCounts(postIds);

    const finalPosts = posts.map((post) => {
      const poll = post.poll
        ? {
            ...post.poll,
            options: post.poll.options.map((option) => ({
              ...option,
              voteCount: option.votes.length,
            })),
            totalVotes: post.poll.options.reduce((sum, option) => sum + option.votes.length, 0),
          }
        : null;

      return {
        ...post,
        views: viewCountMap.get(post.id) || 0,
        poll,
      };
    });

    return NextResponse.json({
      posts: finalPosts,
      hashtag: {
        name: hashtagRecord.name,
        postCount: totalPosts,
        createdAt: hashtagRecord.createdAt
      },
      pagination: {
        page,
        limit,
        total: totalPosts,
        hasMore: skip + finalPosts.length < totalPosts
      }
    });

  } catch (error) {
    console.error("Hashtag posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch hashtag posts" }, { status: 500 });
  }
}



