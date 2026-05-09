import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { responseCache } from "@/server/cache";
import { NextResponse } from "next/server";

const reviewUserSelect = {
  select: {
    id: true,
    username: true,
    name: true,
    profile: {
      select: {
        avatarUrl: true,
        bannerUrl: true,
        profileType: true,
        verified: true,
        bio: true,
        website: true,
        location: true,
      },
    },
    _count: { select: { followers: true, following: true } },
  },
} as const;

async function clearReviewedProfileCache(username?: string | null) {
  if (!username) return;

  await responseCache.delete(`profile:page:${username.toLowerCase()}`);
}

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

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        reviewerId: true,
        reviewed: { select: { username: true } },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.reviewerId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        text: text || null,
      },
      select: {
        id: true,
        reviewerId: true,
        reviewedId: true,
        rating: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        reviewer: reviewUserSelect,
      },
    });

    await clearReviewedProfileCache(existingReview.reviewed.username);

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

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        reviewerId: true,
        reviewed: { select: { username: true } },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.reviewerId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await clearReviewedProfileCache(existingReview.reviewed.username);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
