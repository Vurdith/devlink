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
    responseCache.invalidatePattern(new RegExp(`^users:${userId}:|^saved-posts:${userId}:`));

    return NextResponse.json({ reposted });
  } catch (error) {
    console.error("Error toggling repost:", error);
    return NextResponse.json({ error: "Failed to toggle repost" }, { status: 500 });
  }
}
