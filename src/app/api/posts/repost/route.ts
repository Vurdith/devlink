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
    } else {
      // Create repost
      await prisma.postRepost.create({
        data: {
          postId,
          userId,
        },
      });
      reposted = true;
    }

    // Invalidate feed cache to reflect the new repost state
    responseCache.invalidatePattern(/^feed:/);
    // Also invalidate current user's engagement caches
    responseCache.invalidatePattern(new RegExp(`^users:${userId}:`));
    responseCache.invalidatePattern(new RegExp(`^saved-posts:${userId}:`));
    
    // Explicitly delete engagement-related cache keys to ensure fresh data
    const repostsCacheKey = `users:${userId}:reposts`;
    const likedPostsCacheKey = `users:${userId}:liked-posts`;
    responseCache.delete(repostsCacheKey);
    responseCache.delete(likedPostsCacheKey);
    
    // Also delete the old cache key format if it exists
    const oldRepostsCacheKey = `users:${userId}:reposted-posts`;
    responseCache.delete(oldRepostsCacheKey);
    
    // Also delete all saved posts cache keys (they're paginated)
    for (let page = 1; page <= 10; page++) {
      for (let limit of [20, 50, 100]) {
        const savedPostsCacheKey = `saved-posts:${userId}:page-${page}:limit-${limit}`;
        responseCache.delete(savedPostsCacheKey);
      }
    }

    return NextResponse.json({ reposted });
  } catch (error) {
    console.error("Error toggling repost:", error);
    return NextResponse.json({ error: "Failed to toggle repost" }, { status: 500 });
  }
}
