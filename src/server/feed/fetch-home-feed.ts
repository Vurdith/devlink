import { prisma } from "@/server/db";
import { prismaRead } from "@/server/db-read";
import { getOrSetFeedCache } from "@/server/cache";
import { postListSelect } from "@/server/posts/post-selects";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";

const FEED_CACHE_TTL = 30; // Cache feed for 30 seconds - invalidated on engagement actions

const feedPostSelect = postListSelect;

export type FeedPost = Awaited<ReturnType<typeof _transformFeedPosts>>[number];

async function _transformFeedPosts(
  posts: Awaited<ReturnType<typeof prisma.post.findMany<{ where: { replyToId: null }; select: typeof feedPostSelect }>>>
) {
  const postIds = posts.map((post) => post.id);
  const summary = await fetchPostEngagementSummary(
    postIds,
    undefined,
    getPostPollIds(posts)
  );

  return posts.map((post) => ({
    ...attachPostEngagement(post, summary),
    hashtags: [] as string[],
  }));
}

export async function fetchHomeFeedPosts(limit = 30) {
  const cacheKey = `feed:home:${limit}`;

  return getOrSetFeedCache(cacheKey, async () => {
    // Fetch posts
    const posts = await prismaRead.post.findMany({
      where: {
        replyToId: null,
        isScheduled: false,
      },
      select: feedPostSelect,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return _transformFeedPosts(posts);
  }, FEED_CACHE_TTL);
}

export async function fetchPostForRanking(postId: string) {
  return prismaRead.post.findUnique({
    where: { id: postId },
    select: feedPostSelect,
  });
}
