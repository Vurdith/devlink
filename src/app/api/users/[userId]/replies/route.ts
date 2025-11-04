import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

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

    // Add view counts to posts
    const postsWithViews = await Promise.all(
      repliedPosts.map(async (post) => {
        const viewCount = await prisma.postView.count({
          where: { postId: post.id }
        });
        return { ...post, views: viewCount };
      })
    );
    
    return NextResponse.json(postsWithViews);
  } catch (error) {
    console.error("Error fetching replied posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch replied posts" },
      { status: 500 }
    );
  }
}
