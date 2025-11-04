
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if portfolio item exists and belongs to user
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!portfolioItem || portfolioItem.userId !== user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, mediaUrls, links, category, tags, isPublic } =
      body;

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        title: title ?? portfolioItem.title,
        description,
        mediaUrls,
        links,
        category,
        tags,
        isPublic: isPublic ?? portfolioItem.isPublic,
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                avatarUrl: true,
                profileType: true,
                verified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ portfolioItem: updated });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if portfolio item exists and belongs to user
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!portfolioItem || portfolioItem.userId !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.portfolioItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
