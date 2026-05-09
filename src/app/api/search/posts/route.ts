import { NextRequest, NextResponse } from "next/server";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import { getAuthSession } from "@/server/auth";
import { searchPostsIndex } from "@/server/search";
import { normalizeSearchQuery, searchCacheKeyPart } from "@/server/search/query-utils";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";

const SEARCH_CACHE_TTL = 60; // Cache for 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ posts: [] });
    }

    const query = normalizeSearchQuery(q);
    if (!query) {
      return NextResponse.json({ posts: [] });
    }

    const session = await getAuthSession();
    const currentUserId = session?.user?.id;

    // Cache key includes user ID for personalized engagement flags
    const cacheKey = `search:posts:${searchCacheKeyPart(query)}:${currentUserId || "anon"}`;
    
    // Try cache first
    const cached = await responseCache.get<unknown[]>(cacheKey);
    if (cached) {
      const response = NextResponse.json({ posts: cached });
      response.headers.set("X-Cache", "HIT");
      return response;
    }

    // Use search index when configured; fallback to Prisma filtering.
    const indexedPostIds = await searchPostsIndex(query, 20);

    // Search for posts by indexed IDs or direct content fallback.
    const posts = await prismaRead.post.findMany({
      where: {
        replyToId: null, // Only main posts, not replies
        ...(indexedPostIds.length > 0
          ? { id: { in: indexedPostIds } }
          : {
              content: {
                contains: query,
                mode: "insensitive",
              },
            }),
      },
      select: postListSelect,
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });

    const postIds = posts.map(p => p.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(posts)
    );
    const transformedPosts = posts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );
    
    // Cache the results
    await responseCache.set(cacheKey, transformedPosts, SEARCH_CACHE_TTL);

    const response = NextResponse.json({ posts: transformedPosts });
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 });
  }
}
