import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/server/cache";
import { removeActorFromStackedNotification, upsertStackedNotification } from "@/server/notifications";
import { publishEvent } from "@/server/events/bus";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await req.json();
    const userId = session.user.id;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existingLike) {
        await tx.postLike.delete({
          where: { id: existingLike.id },
        });
        return { liked: false };
      } else {
        await tx.postLike.create({
          data: {
            postId,
            userId,
          },
        });
        return { liked: true };
      }
    });

    if (result.liked) {
      void upsertStackedNotification({
        recipientId: post.userId,
        actorId: userId,
        type: "LIKE",
        postId,
      });
      void publishEvent("post.liked", {
        postId,
        actorId: userId,
        recipientId: post.userId,
        createdAt: new Date().toISOString(),
      });
    } else {
      void removeActorFromStackedNotification({
        recipientId: post.userId,
        actorId: userId,
        type: "LIKE",
        postId,
      });
    }

    void Promise.all([
      responseCache.invalidatePattern(new RegExp(`^user:${userId}:`)),
      responseCache.invalidatePattern(new RegExp(`^hashtag:`)),
      responseCache.invalidatePattern(new RegExp(`^feed:`)),
      responseCache.invalidatePattern(new RegExp(`^post:${postId}`))
    ]).catch(() => {});

    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { likes: true } } }
    });

    return NextResponse.json({ 
      liked: result.liked,
      likeCount: updatedPost?._count.likes || 0
    });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2003' || prismaError.code === 'P2025') {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: "Already processed" }, { status: 409 });
    }
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
