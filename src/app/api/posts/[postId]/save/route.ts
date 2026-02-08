import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getAuthSession();
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

    // Invalidate ALL relevant caches - MUST await
    await Promise.all([
      responseCache.invalidatePattern(/^feed:/),
      responseCache.invalidatePattern(new RegExp(`^user:${userId}:`)),
      responseCache.invalidatePattern(/^hashtag:/),
      responseCache.invalidatePattern(new RegExp(`^post:${postId}`)),
      responseCache.invalidatePattern(new RegExp(`^saved-posts:${userId}:`))
    ]);

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Error saving/unsaving post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
