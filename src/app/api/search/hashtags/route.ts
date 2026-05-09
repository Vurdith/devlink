import { NextRequest, NextResponse } from "next/server";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import { normalizeSearchQuery, searchCacheKeyPart } from "@/server/search/query-utils";

const HASHTAG_CACHE_TTL = 300; // Cache for 5 minutes (hashtags don't change often)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ hashtags: [] });
    }

    // Remove # if present
    const searchTerm = normalizeSearchQuery(q, "#").toLowerCase();
    if (!searchTerm) {
      return NextResponse.json({ hashtags: [] });
    }

    const cacheKey = `search:hashtags:${searchCacheKeyPart(searchTerm)}`;
    
    // Try cache first
    const cached = await responseCache.get<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ hashtags: cached });
    }
    
    // Search for hashtags that contain the search term
    const hashtags = await prismaRead.hashtag.findMany({
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

    // Transform results
    const hashtagResults = hashtags.map((hashtag) => ({
      tag: `#${hashtag.name}`,
      postCount: hashtag._count.posts,
      projectCount: 0
    }));
    
    // Cache the results
    await responseCache.set(cacheKey, hashtagResults, HASHTAG_CACHE_TTL);

    return NextResponse.json({ hashtags: hashtagResults });
  } catch (error) {
    console.error("Error searching hashtags:", error);
    return NextResponse.json({ error: "Failed to search hashtags" }, { status: 500 });
  }
}
