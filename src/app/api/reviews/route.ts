import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import { NextResponse } from "next/server";
import { validateId, validateRating } from "@/lib/validation";

const DEFAULT_REVIEWS_LIMIT = 20;
const MAX_REVIEWS_LIMIT = 50;

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

function parseReviewsPagination(searchParams: URLSearchParams) {
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_REVIEWS_LIMIT), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_REVIEWS_LIMIT)
      : DEFAULT_REVIEWS_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
}

async function clearReviewedProfileCache(username?: string | null) {
  if (!username) return;

  await responseCache.delete(`profile:page:${username.toLowerCase()}`);
}

// Create a new review
export async function POST(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetUserId, rating, text } = body;

    // Validate required fields
    if (!targetUserId || rating === null || rating === undefined) {
      return NextResponse.json({ error: "Missing required fields: targetUserId and rating" }, { status: 400 });
    }

    // Validate targetUserId format
    const idValidation = validateId(targetUserId);
    if (!idValidation.isValid) {
      return NextResponse.json({ error: `Invalid targetUserId: ${idValidation.errors[0]}` }, { status: 400 });
    }

    // Validate rating
    const ratingValidation = validateRating(rating);
    if (!ratingValidation.isValid) {
      return NextResponse.json({ error: ratingValidation.errors[0] }, { status: 400 });
    }

    // Validate text if provided
    if (text) {
      if (typeof text !== 'string') {
        return NextResponse.json({ error: "Review text must be a string" }, { status: 400 });
      }
      if (text.length > 1000) {
        return NextResponse.json({ error: "Review text must be less than 1000 characters" }, { status: 400 });
      }
      if (text.length < 1) {
        return NextResponse.json({ error: "Review text cannot be empty" }, { status: 400 });
      }
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
    }

    // Allow multiple reviews - no need to check for existing reviews

    const review = await prisma.review.create({
      data: {
        reviewerId: currentUserId,
        reviewedId: targetUserId,
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
        reviewed: { select: { username: true } },
      },
    });

    await clearReviewedProfileCache(review.reviewed.username);

    return NextResponse.json({
      id: review.id,
      reviewerId: review.reviewerId,
      reviewedId: review.reviewedId,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: review.reviewer,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get reviews for a specific user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");
  const reviewerId = searchParams.get("reviewerId");
  const sentiment = searchParams.get("sentiment");
  const { page, limit, skip } = parseReviewsPagination(searchParams);

  if (!targetUserId && !reviewerId) {
    return NextResponse.json({ error: "Missing targetUserId or reviewerId" }, { status: 400 });
  }

  try {
    let ratingFilter: { gte?: number; equals?: number; lte?: number } | null = null;
    if (sentiment === "positive") {
      ratingFilter = { gte: 4 };
    } else if (sentiment === "neutral") {
      ratingFilter = { equals: 3 };
    } else if (sentiment === "negative") {
      ratingFilter = { lte: 2 };
    }

    const baseSelect = {
      id: true,
      rating: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    };

    let reviews;
    let total;

    if (targetUserId) {
      const where = {
        reviewedId: targetUserId,
        ...(ratingFilter ? { rating: ratingFilter } : {}),
      };

      [reviews, total] = await Promise.all([
        prismaRead.review.findMany({
          where,
          select: {
            ...baseSelect,
            reviewer: reviewUserSelect,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prismaRead.review.count({ where }),
      ]);
    } else {
      const where = {
        reviewerId: reviewerId!,
        ...(ratingFilter ? { rating: ratingFilter } : {}),
      };

      [reviews, total] = await Promise.all([
        prismaRead.review.findMany({
          where,
          select: {
            ...baseSelect,
            reviewed: reviewUserSelect,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prismaRead.review.count({ where }),
      ]);
    }

    return NextResponse.json(
      {
        reviews,
        pagination: { page, limit, total, hasMore: skip + reviews.length < total }
      },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
