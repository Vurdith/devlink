import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ hashtags: [] });
    }

    // Remove # if present
    const searchTerm = q.startsWith("#") ? q.slice(1) : q;
    
    // Search for hashtags that contain the search term
    const hashtags = await prisma.hashtag.findMany({
      where: {
        name: {
          contains: searchTerm.toLowerCase()
        }
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });

    // Get project counts for each hashtag
    const hashtagResults = await Promise.all(
      hashtags.map(async (hashtag) => {
        // For now, set project count to 0 since portfolio items might not be implemented yet
        const projectCount = 0;

        return {
          tag: `#${hashtag.name}`,
          postCount: hashtag._count.posts,
          projectCount
        };
      })
    );

    return NextResponse.json({ hashtags: hashtagResults });
  } catch (error) {
    console.error("Error searching hashtags:", error);
    return NextResponse.json({ error: "Failed to search hashtags" }, { status: 500 });
  }
}
