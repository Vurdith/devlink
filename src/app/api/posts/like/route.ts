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
      }
    } catch (dbError: any) {
      // Handle case where post doesn't exist (FK constraint)
      if (dbError.code === 'P2003' || dbError.code === 'P2025') {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      throw dbError;
    }

    // Invalidate only the specific caches needed (more targeted)
    responseCache.delete(`users:${userId}:liked-posts`);

    return NextResponse.json({ liked });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
