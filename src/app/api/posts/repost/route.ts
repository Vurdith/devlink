import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";
import { removeActorFromStackedNotification, upsertStackedNotification } from "@/server/notifications";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await req.json();
    const userId = (session.user as any).id;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Verify post exists
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true }
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already reposted
    const existingRepost = await prisma.postRepost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let reposted: boolean;
    if (existingRepost) {
      // Remove repost
      await prisma.postRepost.delete({
        where: { id: existingRepost.id },
      });
      reposted = false;

      void removeActorFromStackedNotification({
        recipientId: postExists.userId,
        actorId: userId,
        type: "REPOST",
        postId,
      });
    } else {
      // Create repost
      await prisma.postRepost.create({
        data: {
          postId,
          userId,
        },
      });
      reposted = true;

      if (postExists.userId) {
        void upsertStackedNotification({
          recipientId: postExists.userId,
          actorId: userId,
          type: "REPOST",
          postId,
        });
      }
    }

    // Invalidate ALL relevant caches - MUST await
    await Promise.all([
      responseCache.invalidatePattern(/^feed:/),
      responseCache.invalidatePattern(new RegExp(`^user:${userId}:`)),
      responseCache.invalidatePattern(/^hashtag:/),
      responseCache.invalidatePattern(new RegExp(`^post:${postId}`))
    ]);

    // Get updated repost count
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { reposts: true } } }
    });

    return NextResponse.json({ 
      reposted,
      repostCount: updatedPost?._count.reposts || 0
    });
  } catch (error) {
    console.error("Error toggling repost:", error);
    return NextResponse.json({ error: "Failed to toggle repost" }, { status: 500 });
  }
}
