import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await request.json();

    // Check if the post exists and belongs to the current user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, replyToId: true }
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only pin your own posts" }, { status: 403 });
    }

    // Can't pin replies
    if (existingPost.replyToId) {
      return NextResponse.json({ error: "Cannot pin replies" }, { status: 400 });
    }

    if (pin) {
      // Check if user already has 3 pinned posts
      const pinnedCount = await prisma.post.count({
        where: {
          userId: session.user.id,
          isPinned: true,
          replyToId: null // Only count original posts, not replies
        }
      });

      if (pinnedCount >= 3) {
        return NextResponse.json({ error: "You can only pin up to 3 posts" }, { status: 400 });
      }
    }

    // Update the post pin status
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { isPinned: pin }
    });

    return NextResponse.json({ success: true, isPinned: updatedPost.isPinned });
  } catch (error) {
    console.error("Error pinning post:", error);
    return NextResponse.json(
      { error: "Failed to pin post" },
      { status: 500 }
    );
  }
}
