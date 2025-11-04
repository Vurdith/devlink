import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

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

    if (existingSave) {
      // Unsave the post
      await prisma.savedPost.delete({
        where: { userId_postId: { userId: user.id, postId } }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Save the post
      await prisma.savedPost.create({
        data: {
          userId: user.id,
          postId
        }
      });
      return NextResponse.json({ saved: true });
    }
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

    // Add view counts and transform poll data to posts
    const postsWithViewCounts = await Promise.all(
      savedPosts.map(async (savedPost) => {
        const viewCount = await prisma.postView.count({
          where: { postId: savedPost.post.id }
        });
        
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

    return NextResponse.json({ savedPosts: postsWithViewCounts });
  } catch (error) {
    console.error("Saved posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 });
  }
}
