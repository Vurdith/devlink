import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";
import { getUniqueViewCounts } from "@/lib/view-utils";

const FEED_CACHE_TTL = 30; // Cache feed for 30 seconds - invalidated on engagement actions

// Full select for feed display AND ranking
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
      // Note: Don't use _count.views - it counts all records, not unique users
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

export type FeedPost = Awaited<ReturnType<typeof _transformFeedPosts>>[number];

function _transformFeedPosts(
  posts: Awaited<ReturnType<typeof prisma.post.findMany<{ where: { replyToId: null }; select: typeof feedPostSelect }>>>,
  viewCountMap: Map<string, number>
) {
  return posts.map(post => ({
    ...post,
    likes: [] as { id: string; userId: string }[],
    reposts: [] as { id: string; userId: string }[],
    savedBy: [] as { id: string; userId: string }[],
    hashtags: [] as string[],
    replies: Array(post._count?.replies || 0).fill(null) as null[],
    views: viewCountMap.get(post.id) || 0,
    poll: post.poll ? {
      ...post.poll,
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: Array(opt._count.votes).fill({ id: '' }) as { id: string }[],
      }))
    } : null
  }));
}

export async function fetchHomeFeedPosts(limit = 30) {
  const cacheKey = `feed:home:${limit}`;
  
  // Try cache first - this is the fast path
  const cached = await responseCache.get<FeedPost[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch posts
  const posts = await prisma.post.findMany({
    where: { 
      replyToId: null,
      isScheduled: false,
    },
    select: feedPostSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Get unique view counts (consistent with all other pages)
  const postIds = posts.map(post => post.id);
  const viewCountMap = await getUniqueViewCounts(postIds);

  // Transform to expected format
  const result = _transformFeedPosts(posts, viewCountMap);
  
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
