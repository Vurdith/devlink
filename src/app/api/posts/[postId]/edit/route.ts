import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, mediaUrls } = await request.json();

    // Check if the post exists and belongs to the current user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, replyToId: true }
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 });
    }

    // Sanitize content - simple removal of script tags and dangerous handlers
    const sanitizedContent = content.trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/ on\w+=/gi, '');

    // Update the post content
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: sanitizedContent,
        updatedAt: new Date()
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        likes: true,
        reposts: true,
        replies: true,
        media: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Update media if provided
    if (mediaUrls && Array.isArray(mediaUrls)) {
      // Delete existing media
      await prisma.postMedia.deleteMany({
        where: { postId }
      });

      // Create new media entries
      if (mediaUrls.length > 0) {
        await prisma.postMedia.createMany({
          data: mediaUrls.map((url: string, index: number) => ({
            postId,
            mediaUrl: url,
            mediaType: url.match(/\.(gif|webp)$/i) ? 'gif' : 
                      url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
            order: index
          }))
        });
      }
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Error editing post:", error);
    return NextResponse.json(
      { error: "Failed to edit post" },
      { status: 500 }
    );
  }
}
