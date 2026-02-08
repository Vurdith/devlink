import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getUniqueViewCounts } from "@/lib/view-utils";
import { responseCache } from "@/lib/cache";
import { getAuthSession } from "@/server/auth";

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
    const cached = await responseCache.get<any>(cacheKey);
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
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isPinned: true,
          isSlideshow: true,
          location: true,
          embedUrls: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  profileType: true,
                  verified: true,
                }
              },
              _count: { select: { followers: true, following: true } }
            }
          },
          _count: { select: { likes: true, reposts: true, replies: true } },
          media: { select: { id: true, mediaUrl: true, mediaType: true, order: true }, orderBy: { order: 'asc' } },
          poll: {
            select: {
              id: true,
              question: true,
              expiresAt: true,
              isMultiple: true,
              options: { select: { id: true, text: true, _count: { select: { votes: true } } } }
            }
          },
        }
      })
    ]);

    const postIds = posts.map((post) => post.id);
    
    // Batch fetch all engagement data in parallel
    const [viewCountMap, userLikes, userReposts, userSaves] = await Promise.all([
      getUniqueViewCounts(postIds),
      currentUserId ? prisma.postLike.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      currentUserId ? prisma.postRepost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      currentUserId ? prisma.savedPost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([])
    ]);
    
    const likedPostIds = new Set(userLikes.map(l => l.postId));
    const repostedPostIds = new Set(userReposts.map(r => r.postId));
    const savedPostIds = new Set(userSaves.map(s => s.postId));

    const finalPosts = posts.map((post: any) => {
      const poll = post.poll
        ? {
            ...post.poll,
            options: post.poll.options.map((option: any) => ({
              id: option.id,
              text: option.text,
              votes: option._count.votes,
            })),
            totalVotes: post.poll.options.reduce((sum: number, option: any) => sum + option._count.votes, 0),
          }
        : null;

      return {
        ...post,
        views: viewCountMap.get(post.id) || 0,
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
        isSaved: savedPostIds.has(post.id),
        poll,
        // Add counts for UI
        likes: [],
        reposts: [],
        replies: Array(post._count?.replies || 0).fill(null),
      };
    });

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



