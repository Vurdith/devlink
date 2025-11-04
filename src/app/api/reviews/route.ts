import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

// Create a new review
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;
  
  if (!currentUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetUserId, rating, text } = body;

    if (!targetUserId || !rating || rating < 1 || rating > 5) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    if (targetUserId === currentUserId) {
      return new NextResponse("Cannot review yourself", { status: 400 });
    }

    // Allow multiple reviews - no need to check for existing reviews

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewerId: currentUserId,
        reviewedId: targetUserId,
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

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Get reviews for a specific user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");
  const reviewerId = searchParams.get("reviewerId");

  if (!targetUserId && !reviewerId) {
    return new NextResponse("Missing targetUserId or reviewerId", { status: 400 });
  }

  try {
    let reviews;
    
    if (targetUserId) {
      // Get reviews received by a user
      reviews = await prisma.review.findMany({
        where: { reviewedId: targetUserId },
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
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Get reviews written by a user
      reviews = await prisma.review.findMany({
        where: { reviewerId: reviewerId! },
        include: {
          reviewed: {
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
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
