import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { responseCache } from "@/lib/cache";

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

    // Verify post exists
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already liked the post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let liked: boolean;
    if (existingLike) {
      // Unlike the post
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
      console.log(`User ${userId} unliked post ${postId}`);
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      liked = true;
      console.log(`User ${userId} liked post ${postId}`);
    }

    // Verify the operation completed
    const verifyLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (liked !== !!verifyLike) {
      console.error(`Like state mismatch: expected ${liked}, found ${!!verifyLike}`);
      return NextResponse.json({ error: "Failed to update like state" }, { status: 500 });
    }

    // Invalidate feed cache to reflect the new like state
    responseCache.invalidatePattern(/^feed:/);
    // Also invalidate current user's engagement caches
    responseCache.invalidatePattern(new RegExp(`^users:${userId}:`));
    responseCache.invalidatePattern(new RegExp(`^saved-posts:${userId}:`));
    
    // Explicitly delete engagement-related cache keys to ensure fresh data
    const likedPostsCacheKey = `users:${userId}:liked-posts`;
    responseCache.delete(likedPostsCacheKey);
    
    // Also delete all saved posts cache keys (they're paginated)
    for (let page = 1; page <= 10; page++) {
      for (let limit of [20, 50, 100]) {
        const savedPostsCacheKey = `saved-posts:${userId}:page-${page}:limit-${limit}`;
        responseCache.delete(savedPostsCacheKey);
      }
    }

    return NextResponse.json({ liked });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
