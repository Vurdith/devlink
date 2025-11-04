import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { SmartDiscoveryEngine } from "@/lib/smart-discovery-engine";

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

    // Get posts with this hashtag - fetch all for algorithm processing
    const allPosts = await prisma.post.findMany({
      where: {
        replyToId: null, // Only main posts, no replies
        hashtags: {
          some: {
            hashtagId: hashtagRecord.id
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
            }
          }
        }
      }
    });

    // Add view counts to all posts BEFORE applying algorithm
    const postsWithViewCounts = await Promise.all(
      allPosts.map(async (post: any) => {
        // Get actual view data for the algorithm
        const viewData = await prisma.postView.findMany({
          where: { postId: post.id },
          select: { userId: true }
        });
        
        // For algorithm, provide actual view objects
        return {
          ...post,
          views: viewData // Algorithm needs actual view objects with userId
        };
      })
    );

    // Apply DevLink's Smart Discovery Algorithm
    let rankedPosts;
    try {
      const smartDiscoveryEngine = new SmartDiscoveryEngine();
      rankedPosts = smartDiscoveryEngine.rankPosts(
        postsWithViewCounts,
        "anonymous", // currentUserId - anonymous user for hashtag discovery
        undefined,   // userEngagements
        [],          // followingIds
        []           // mutualFollows
      );
    } catch (error) {
      console.error("Algorithm error, falling back to chronological order:", error);
      // Fallback to chronological order if algorithm fails
      rankedPosts = postsWithViewCounts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Apply pagination to ranked results
    const posts = rankedPosts.slice(skip, skip + limit);

    // Transform final posts for frontend (convert views back to number)
    const finalPosts = posts.map((post: any) => ({
      ...post,
      views: post.views.length // Convert back to number for frontend
    }));

    // Get hashtag stats
    const postCount = await prisma.postHashtag.count({
      where: { hashtagId: hashtagRecord.id }
    });

    return NextResponse.json({
      posts: finalPosts,
      hashtag: {
        name: hashtagRecord.name,
        postCount,
        createdAt: hashtagRecord.createdAt
      },
      pagination: {
        page,
        limit,
        total: postCount,
        hasMore: skip + posts.length < postCount
      }
    });

  } catch (error) {
    console.error("Hashtag posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch hashtag posts" }, { status: 500 });
  }
}



