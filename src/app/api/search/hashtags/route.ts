import { NextRequest, NextResponse } from "next/server";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchCacheKeyPart,
} from "@/server/search/query-utils";

const HASHTAG_CACHE_TTL = 300;
const DEFAULT_HASHTAG_LIMIT = 10;
const MAX_HASHTAG_LIMIT = 25;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ hashtags: [] });
    }

    const searchTerm = normalizeSearchQuery(q, "#").toLowerCase();
    if (!searchTerm) {
      return NextResponse.json({ hashtags: [] });
    }
    const limit = normalizeSearchLimit(
      searchParams.get("limit"),
      DEFAULT_HASHTAG_LIMIT,
      MAX_HASHTAG_LIMIT
    );

    const cacheKey = `search:hashtags:${searchCacheKeyPart(searchTerm)}:${limit}`;
    
    const cached = await responseCache.get<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ hashtags: cached });
    }
    
    const hashtags = await prismaRead.hashtag.findMany({
      where: {
        name: {
          contains: searchTerm
        }
      },
      select: {
        name: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });

    const hashtagResults = hashtags.map((hashtag) => ({
      tag: `#${hashtag.name}`,
      postCount: hashtag._count.posts,
      projectCount: 0
    }));
    
    await responseCache.set(cacheKey, hashtagResults, HASHTAG_CACHE_TTL);

    return NextResponse.json({ hashtags: hashtagResults });
  } catch (error) {
    console.error("Error searching hashtags:", error);
    return NextResponse.json({ error: "Failed to search hashtags" }, { status: 500 });
  }
}
