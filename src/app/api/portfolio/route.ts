import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { validatePortfolioTitle, validatePortfolioDescription } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, mediaUrls, links, category, tags, isPublic } = body;

    // Validate title
    const titleValidation = validatePortfolioTitle(title);
    if (!titleValidation.isValid) {
      return NextResponse.json({ error: titleValidation.errors[0] }, { status: 400 });
    }

    // Validate description if provided
    if (description) {
      const descValidation = validatePortfolioDescription(description);
      if (!descValidation.isValid) {
        return NextResponse.json({ error: descValidation.errors[0] }, { status: 400 });
      }
    }

    // Validate category if provided (max 50 characters)
    if (category && (typeof category !== 'string' || category.length > 50)) {
      return NextResponse.json({ error: "Category must be a string with max 50 characters" }, { status: 400 });
    }

    // Validate mediaUrls if provided (accepts comma-separated string)
    if (mediaUrls && typeof mediaUrls === 'string' && mediaUrls.trim().length > 0) {
      const urlArray = mediaUrls.split(',').map((url: string) => url.trim()).filter(Boolean);
      if (urlArray.length > 10) {
        return NextResponse.json({ error: "Maximum 10 media URLs allowed" }, { status: 400 });
      }
    }

    // Validate links if provided (accepts comma-separated string)
    if (links && typeof links === 'string' && links.trim().length > 0) {
      const linkArray = links.split(',').map((url: string) => url.trim()).filter(Boolean);
      if (linkArray.length > 10) {
        return NextResponse.json({ error: "Maximum 10 links allowed" }, { status: 400 });
      }
    }

    // Validate tags if provided (accepts comma-separated string)
    if (tags && typeof tags === 'string' && tags.trim().length > 0) {
      const tagArray = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      if (tagArray.length > 10) {
        return NextResponse.json({ error: "Maximum 10 tags allowed" }, { status: 400 });
      }
      for (const tag of tagArray) {
        if (tag.length > 50) {
          return NextResponse.json({ error: `Tag "${tag}" is too long (max 50 characters)` }, { status: 400 });
        }
      }
    }

    // Validate isPublic if provided
    if (typeof isPublic !== 'undefined' && typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        mediaUrls,
        links,
        category,
        tags,
        isPublic: isPublic ?? true,
        userId: user.id
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                avatarUrl: true,
                profileType: true,
                verified: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ portfolioItem });
  } catch (error) {
    console.error("Portfolio item creation error:", error);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}

import { responseCache } from "@/lib/cache";

const PORTFOLIO_CACHE_TTL = 120; // 2 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const cacheKey = `portfolio:${userId}:${page}:${limit}`;
    
    // Try cache first
    const cached = await responseCache.get<any>(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      response.headers.set("X-Cache", "HIT");
      response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return response;
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId,
        isPublic: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        mediaUrls: true,
        links: true,
        category: true,
        tags: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true,
                profileType: true,
                verified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    const result = { portfolioItems };
    
    // Cache the result
    await responseCache.set(cacheKey, result, PORTFOLIO_CACHE_TTL);

    const response = NextResponse.json(result);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Portfolio items fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
  }
}
