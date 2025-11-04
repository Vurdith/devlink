import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

// Recursive function to delete a post and all its replies
async function deletePostAndReplies(postId: string) {
  // First, find all replies to this post
  const replies = await prisma.post.findMany({
    where: { replyToId: postId },
    select: { id: true }
  });

  // Recursively delete all replies first
  for (const reply of replies) {
    await deletePostAndReplies(reply.id);
  }

  // Now delete the post itself (this will cascade to likes, reposts, and views)
  await prisma.post.delete({
    where: { id: postId }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists and belongs to the current user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 });
    }

    // Delete the post and all its replies recursively
    await deletePostAndReplies(postId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
