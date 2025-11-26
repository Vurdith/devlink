import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getUniqueViewCounts } from "@/lib/view-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Get posts that this user has replied to
    const repliedPosts = await prisma.post.findMany({
      where: {
        replyTo: {
          isNot: null
        },
        userId: userId
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

    // OPTIMIZATION: Batch fetch all view counts in a single query instead of N+1
    const postIds = repliedPosts.map(p => p.id);
    const viewCountMap = await getUniqueViewCounts(postIds);

    // Add view counts to posts
    const postsWithViews = repliedPosts.map(post => ({
      ...post,
      views: viewCountMap.get(post.id) || 0
    }));
    
    return NextResponse.json(postsWithViews);
  } catch (error) {
    console.error("Error fetching replied posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch replied posts" },
      { status: 500 }
    );
  }
}
