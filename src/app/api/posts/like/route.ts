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
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      liked = true;
    }

    // Invalidate feed cache to reflect the new like state
    responseCache.invalidatePattern(/^feed:/);
    // Also invalidate user engagement caches (liked posts, reposted posts, saved posts)
    responseCache.invalidatePattern(/^users:/);
    responseCache.invalidatePattern(/^saved-posts:/);

    return NextResponse.json({ liked });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
