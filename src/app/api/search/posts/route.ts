import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { getUniqueViewCounts } from "@/lib/view-utils";

const SEARCH_CACHE_TTL = 60; // Cache for 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ posts: [] });
    }

    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    // Cache key includes user ID for personalized engagement flags
    const cacheKey = `search:posts:${q.toLowerCase()}:${currentUserId || 'anon'}`;
    
    // Try cache first
    const cached = await responseCache.get<any[]>(cacheKey);
    if (cached) {
      const response = NextResponse.json({ posts: cached });
      response.headers.set("X-Cache", "HIT");
      return response;
    }

    // Search for posts that contain the search term in content
    const posts = await prisma.post.findMany({
      where: {
        replyToId: null, // Only main posts, not replies
        content: {
          contains: q,
          mode: 'insensitive' // Case-insensitive search
        }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        isSlideshow: true,
        location: true,
        embedUrls: true,
        userId: true,
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
        _count: { select: { likes: true, reposts: true, replies: true, savedBy: true } },
        media: {
          select: { id: true, mediaUrl: true, mediaType: true, order: true },
          orderBy: { order: 'asc' }
        },
        poll: {
          select: {
            id: true,
            question: true,
            expiresAt: true,
            isMultiple: true,
            options: { select: { id: true, text: true, _count: { select: { votes: true } } } }
          }
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const postIds = posts.map(p => p.id);

    // Batch fetch all engagement data in parallel (same pattern as other endpoints)
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

    // Transform posts with proper engagement flags
    const transformedPosts = posts.map((post: any) => {
      const poll = post.poll
        ? {
            ...post.poll,
            options: post.poll.options.map((opt: any) => ({
              id: opt.id,
              text: opt.text,
              votes: opt._count.votes,
            })),
            totalVotes: post.poll.options.reduce((sum: number, opt: any) => sum + opt._count.votes, 0),
          }
        : null;

      return {
        ...post,
        views: viewCountMap.get(post.id) || 0,
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
        isSaved: savedPostIds.has(post.id),
        // Empty arrays for compatibility with PostCard component
        likes: [],
        reposts: [],
        savedBy: [],
        replies: Array(post._count?.replies || 0).fill(null),
        poll,
      };
    });
    
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
