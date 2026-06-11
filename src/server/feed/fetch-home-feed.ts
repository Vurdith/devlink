import { prismaRead } from "@/server/db-read";
import { getOrSetFeedCache } from "@/server/cache";
import { postListSelect } from "@/server/posts/post-selects";
import type { Prisma } from "@prisma/client";

const FEED_CACHE_TTL = 30; // Cache feed for 30 seconds - invalidated on engagement actions
const MAX_HOME_FEED_CANDIDATES = 150;
const MAX_INTEREST_TERMS = 8;

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

function boundHomeFeedLimit(limit: number) {
  const parsedLimit = Math.trunc(limit);
  if (!Number.isFinite(parsedLimit)) {
    return 30;
  }

  return Math.min(Math.max(parsedLimit, 1), MAX_HOME_FEED_CANDIDATES);
}

function addFeedDefaults(post: SelectedFeedPost): FeedPost {
  return {
    ...post,
    hashtags: [],
  };
}

export async function fetchHomeFeedCandidates(limit = 30) {
  const boundedLimit = boundHomeFeedLimit(limit);
  const cacheKey = `feed:home:${boundedLimit}`;

  return getOrSetFeedCache(cacheKey, async () => {
    return prismaRead.post.findMany({
      where: {
        replyToId: null,
        isScheduled: false,
      },
      select: homeFeedCandidateSelect,
      orderBy: { createdAt: "desc" },
      take: boundedLimit,
    });
  }, FEED_CACHE_TTL);
}

export async function fetchFollowedHomeFeedCandidates(authorIds: string[], limit = 60) {
  if (authorIds.length === 0) return [];

  const boundedLimit = boundHomeFeedLimit(limit);

  return prismaRead.post.findMany({
    where: {
      replyToId: null,
      isScheduled: false,
      userId: { in: authorIds },
    },
    select: homeFeedCandidateSelect,
    orderBy: { createdAt: "desc" },
    take: boundedLimit,
  });
}

function normalizeInterestTerm(term: string) {
  return term.trim().toLowerCase();
}

function buildHashtagTerms(interestTerms: string[]) {
  return [
    ...new Set(
      interestTerms
        .map((term) => term.replace(/[^a-z0-9]/g, ""))
        .filter((term) => term.length >= 2)
    ),
  ];
}

export async function fetchInterestHomeFeedCandidates(interestTerms: string[], limit = 60) {
  const normalizedTerms = [
    ...new Set(
      interestTerms
        .map(normalizeInterestTerm)
        .filter((term) => term.length >= 2)
    ),
  ].slice(0, MAX_INTEREST_TERMS);

  if (normalizedTerms.length === 0) return [];

  const hashtagTerms = buildHashtagTerms(normalizedTerms);
  const boundedLimit = boundHomeFeedLimit(limit);

  return prismaRead.post.findMany({
    where: {
      replyToId: null,
      isScheduled: false,
      OR: [
        ...normalizedTerms.map((term) => ({ content: { contains: term } })),
        ...(hashtagTerms.length > 0
          ? [
              {
                hashtags: {
                  some: {
                    hashtag: {
                      name: { in: hashtagTerms },
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    select: homeFeedCandidateSelect,
    orderBy: [
      { createdAt: "desc" },
    ],
    take: boundedLimit,
  });
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
  const boundedLimit = boundHomeFeedLimit(limit);
  const cacheKey = `feed:home:details:${boundedLimit}`;

  return getOrSetFeedCache(cacheKey, async () => {
    const candidates = await fetchHomeFeedCandidates(boundedLimit);
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
