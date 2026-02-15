import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

// Update a review
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reviewId } = await params;
    const body = await req.json();
    const { rating, text } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Check if the review exists and belongs to the current user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.reviewerId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        text: text || null,
      },
      include: {
        reviewer: {
          include: {
            profile: true,
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a review
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reviewId } = await params;

    // Check if the review exists and belongs to the current user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.reviewerId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
