import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, mediaUrls, links, category, tags, isPublic } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId,
        isPublic: true
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
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    return NextResponse.json({ portfolioItems });
  } catch (error) {
    console.error("Portfolio items fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
  }
}
