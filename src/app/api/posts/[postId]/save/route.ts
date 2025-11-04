import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const userId = session.user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post is already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let saved: boolean;

    if (existingSave) {
      // Remove from saved posts
      await prisma.savedPost.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      saved = false;
    } else {
      // Add to saved posts
      await prisma.savedPost.create({
        data: {
          userId,
          postId,
        },
      });
      saved = true;
    }

    // Invalidate feed cache to reflect the new save state
    responseCache.invalidatePattern(/^feed:/);
    // Also invalidate user engagement caches (liked posts, reposted posts, saved posts)
    responseCache.invalidatePattern(/^users:/);
    responseCache.invalidatePattern(/^saved-posts:/);

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Error saving/unsaving post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
