import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { responseCache } from "@/lib/cache";
import { createNotification } from "@/server/notifications";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await req.json();
    const userId = (session.user as any).id;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Check if user already liked the post (also verifies post exists via FK)
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let liked: boolean;
    try {
      if (existingLike) {
        // Unlike the post
        await prisma.postLike.delete({
          where: { id: existingLike.id },
        });
        liked = false;
      } else {
        // Like the post - will fail with FK error if post doesn't exist
        await prisma.postLike.create({
          data: {
            postId,
            userId,
          },
        });
        liked = true;

        // Create notification for the post owner (deduped per actor+post)
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { userId: true },
        });
        if (post?.userId) {
          // Non-blocking: don't fail likes if notification creation fails.
          void createNotification({
            recipientId: post.userId,
            actorId: userId,
            type: "LIKE",
            postId,
            dedupeKey: `n:${post.userId}:like:${postId}:${userId}`,
          });
        }
      }
    } catch (dbError: any) {
      // Handle case where post doesn't exist (FK constraint)
      if (dbError.code === 'P2003' || dbError.code === 'P2025') {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      throw dbError;
    }

    // Invalidate ALL relevant caches - MUST await
    // This ensures counts are fresh everywhere
    await Promise.all([
      responseCache.invalidatePattern(new RegExp(`^user:${userId}:`)),
      responseCache.invalidatePattern(new RegExp(`^hashtag:`)),
      responseCache.invalidatePattern(new RegExp(`^feed:`)), // Invalidate feed cache
      responseCache.invalidatePattern(new RegExp(`^post:${postId}`)) // Invalidate specific post cache
    ]);

    // Get the updated like count to return to client
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { likes: true } } }
    });

    return NextResponse.json({ 
      liked,
      likeCount: updatedPost?._count.likes || 0
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
