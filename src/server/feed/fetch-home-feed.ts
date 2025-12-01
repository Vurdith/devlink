import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

const FEED_CACHE_TTL = 60; // Cache feed for 60 seconds (increased for performance)

// Full select for feed display AND ranking - includes view count via _count
const feedPostSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isPinned: true,
  isSlideshow: true,
  location: true,
  userId: true,
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          avatarUrl: true,
          bannerUrl: true,
          profileType: true,
          verified: true,
          bio: true,
          website: true,
          location: true,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  },
  _count: {
    select: {
      likes: true,
      reposts: true,
      replies: true,
      savedBy: true,
      views: true, // Use _count for views - much faster than fetching all records
    },
  },
  media: {
    select: {
      id: true,
      mediaUrl: true,
      mediaType: true,
      order: true,
    },
    orderBy: { order: "asc" as const },
  },
  poll: {
    select: {
      id: true,
      question: true,
      expiresAt: true,
      isMultiple: true,
      options: {
        select: {
          id: true,
          text: true,
          _count: { select: { votes: true } }
        }
      }
    }
  },
};

export async function fetchHomeFeedPosts(limit = 30) {
  const cacheKey = `feed:home:${limit}`;
  
  // Try cache first - this is the fast path
  const cached = await responseCache.get<any[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Single database query - no separate view count query needed
  const posts = await prisma.post.findMany({
    where: { 
      replyToId: null,
      isScheduled: false,
    },
    select: feedPostSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Transform to expected format - views come from _count now
  const result = posts.map(post => ({
    ...post,
    likes: [],
    reposts: [],
    savedBy: [],
    hashtags: [],
    replies: Array(post._count?.replies || 0).fill(null),
    views: post._count?.views || 0, // Direct from _count - no extra query
    poll: post.poll ? {
      ...post.poll,
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: Array(opt._count.votes).fill({ id: '' }),
      }))
    } : null
  }));
  
  // Cache the result
  await responseCache.set(cacheKey, result, FEED_CACHE_TTL);
  
  return result;
}

export async function fetchPostForRanking(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    select: feedPostSelect,
  });
}
