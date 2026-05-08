import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { responseCache } from "@/server/cache";
import { getAuthSession } from "@/server/auth";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";

const HASHTAG_CACHE_TTL = 60; // Cache for 60 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hashtag: string }> }
) {
  try {
    const { hashtag } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;
    
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;

    // Cache key includes user ID for personalized engagement flags
    const cacheKey = `hashtag:${hashtag.toLowerCase()}:${page}:${limit}:${currentUserId || 'anon'}`;
    
    // Try cache first
    const cached = await responseCache.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      response.headers.set("X-Cache", "HIT");
      response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
      return response;
    }

    // Find the hashtag
    const hashtagRecord = await prisma.hashtag.findUnique({
      where: { name: hashtag.toLowerCase() }
    });

    if (!hashtagRecord) {
      return NextResponse.json({ posts: [], hashtag: null });
    }

    // Count and fetch posts in parallel
    const [totalPosts, posts] = await Promise.all([
      prisma.post.count({
        where: {
          replyToId: null,
          hashtags: { some: { hashtagId: hashtagRecord.id } },
        },
      }),
      prisma.post.findMany({
        where: {
          replyToId: null,
          hashtags: { some: { hashtagId: hashtagRecord.id } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: postListSelect
      })
    ]);

    const postIds = posts.map((post) => post.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(posts)
    );
    const finalPosts = posts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );

    const result = {
      posts: finalPosts,
      hashtag: {
        name: hashtagRecord.name,
        postCount: totalPosts,
        createdAt: hashtagRecord.createdAt
      },
      pagination: {
        page,
        limit,
        total: totalPosts,
        hasMore: skip + finalPosts.length < totalPosts
      }
    };

    // Cache the result
    await responseCache.set(cacheKey, result, HASHTAG_CACHE_TTL);

    const response = NextResponse.json(result);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;

  } catch (error) {
    console.error("Hashtag posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch hashtag posts" }, { status: 500 });
  }
}



