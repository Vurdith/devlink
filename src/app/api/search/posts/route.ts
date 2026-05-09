import { NextRequest, NextResponse } from "next/server";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import { getAuthSession } from "@/server/auth";
import { searchPostsIndex } from "@/server/search";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchCacheKeyPart,
} from "@/server/search/query-utils";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";
import type { Prisma } from "@prisma/client";

const SEARCH_CACHE_TTL = 60;
const DEFAULT_POST_LIMIT = 20;
const MAX_POST_LIMIT = 40;
type SearchPost = Prisma.PostGetPayload<{ select: typeof postListSelect }>;

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
    const limit = normalizeSearchLimit(
      searchParams.get("limit"),
      DEFAULT_POST_LIMIT,
      MAX_POST_LIMIT
    );

    const session = await getAuthSession();
    const currentUserId = session?.user?.id;

    const cacheKey = `search:posts:v2:${searchCacheKeyPart(query)}:${limit}`;
    
    let posts = await responseCache.get<SearchPost[]>(cacheKey);
    let cacheStatus = "HIT";

    if (!posts) {
      cacheStatus = "MISS";
      const indexedPostIds = await searchPostsIndex(query, limit);

      posts = await prismaRead.post.findMany({
        where: {
          replyToId: null,
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
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      await responseCache.set(cacheKey, posts, SEARCH_CACHE_TTL);
    }

    const postIds = posts.map(p => p.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(posts)
    );
    const transformedPosts = posts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );

    const response = NextResponse.json({ posts: transformedPosts });
    response.headers.set("X-Cache", cacheStatus);
    response.headers.set(
      "Cache-Control",
      currentUserId ? "private, no-store" : "public, max-age=30, stale-while-revalidate=60"
    );
    response.headers.set("Vary", "Cookie");
    return response;
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 });
  }
}
