import { prismaRead } from "@/server/db-read";
import { getOrSetFeedCache } from "@/server/cache";
import { postListSelect } from "@/server/posts/post-selects";
import type { Prisma } from "@prisma/client";

const FEED_CACHE_TTL = 30; // Cache feed for 30 seconds - invalidated on engagement actions

const feedPostSelect = postListSelect;
const homeFeedCandidateSelect = {
  id: true,
  content: true,
  createdAt: true,
  userId: true,
  user: {
    select: {
      id: true,
      createdAt: true,
      _count: { select: { followers: true } },
    },
  },
  _count: {
    select: {
      likes: true,
      reposts: true,
      replies: true,
      savedBy: true,
    },
  },
} satisfies Prisma.PostSelect;

type SelectedFeedPost = Prisma.PostGetPayload<{ select: typeof feedPostSelect }>;
export type HomeFeedCandidate = Prisma.PostGetPayload<{ select: typeof homeFeedCandidateSelect }>;

export type FeedPost = SelectedFeedPost & { hashtags: string[] };

function addFeedDefaults(post: SelectedFeedPost): FeedPost {
  return {
    ...post,
    hashtags: [],
  };
}

export async function fetchHomeFeedCandidates(limit = 30) {
  const cacheKey = `feed:home:${limit}`;

  return getOrSetFeedCache(cacheKey, async () => {
    return prismaRead.post.findMany({
      where: {
        replyToId: null,
        isScheduled: false,
      },
      select: homeFeedCandidateSelect,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }, FEED_CACHE_TTL);
}

export async function fetchHomeFeedPostDetails(postIds: string[]): Promise<FeedPost[]> {
  if (postIds.length === 0) {
    return [];
  }

  const posts = await prismaRead.post.findMany({
    where: { id: { in: postIds } },
    select: feedPostSelect,
  });

  const postsById = new Map(posts.map((post) => [post.id, addFeedDefaults(post)]));

  return postIds
    .map((postId) => postsById.get(postId))
    .filter((post): post is FeedPost => Boolean(post));
}

export async function fetchHomeFeedPosts(limit = 30) {
  const cacheKey = `feed:home:details:${limit}`;

  return getOrSetFeedCache(cacheKey, async () => {
    const candidates = await fetchHomeFeedCandidates(limit);
    return fetchHomeFeedPostDetails(candidates.map((post) => post.id));
  }, FEED_CACHE_TTL);
}

export async function fetchPostForRanking(postId: string): Promise<FeedPost | null> {
  const post = await prismaRead.post.findUnique({
    where: { id: postId },
    select: feedPostSelect,
  });

  return post ? addFeedDefaults(post) : null;
}
