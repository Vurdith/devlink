import { rankPosts } from "@/lib/ranking/devlink-ranking";
import { buildRankablePost } from "@/lib/ranking/ranking-transforms";
import type { FeedPost } from "@/server/feed/fetch-home-feed";
import { rankFeedWithRust } from "@/server/services/hotpath-client";

const DIVERSITY_WINDOW = 20;
const MAX_POSTS_PER_AUTHOR_IN_WINDOW = 2;

function mergeOrdering(preferredOrder: string[], fallbackOrder: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const id of preferredOrder) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }

  for (const id of fallbackOrder) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }

  return merged;
}

function applyAuthorDiversity(order: string[], postsById: Map<string, FeedPost>): string[] {
  if (order.length <= 1) return order;

  const result: string[] = [];
  const deferred: string[] = [];
  const windowAuthorCounts = new Map<string, number>();

  for (const postId of order) {
    const post = postsById.get(postId);
    if (!post) continue;

    if (result.length < DIVERSITY_WINDOW) {
      const currentCount = windowAuthorCounts.get(post.userId) ?? 0;
      if (currentCount >= MAX_POSTS_PER_AUTHOR_IN_WINDOW) {
        deferred.push(postId);
        continue;
      }
      windowAuthorCounts.set(post.userId, currentCount + 1);
    }

    result.push(postId);
  }

  return [...result, ...deferred];
}

export async function rankHomeFeedPosts(posts: FeedPost[]): Promise<FeedPost[]> {
  if (posts.length <= 1) return posts;

  const rankablePosts = posts.map(buildRankablePost);
  const localRanking = rankPosts(rankablePosts);
  const fallbackOrder = localRanking.orderedPostIds;

  const rustRanking = await rankFeedWithRust({
    candidates: localRanking.ranked.map(({ post, score }) => ({
      postId: post.id,
      score,
      createdAt: new Date(post.createdAt).toISOString(),
    })),
  });

  const rustOrder = rustRanking?.orderedPostIds ?? [];
  const safeOrder = mergeOrdering(rustOrder, fallbackOrder);
  const postMap = new Map(posts.map((post) => [post.id, post]));
  const diversifiedOrder = applyAuthorDiversity(safeOrder, postMap);

  return diversifiedOrder.map((id) => postMap.get(id)).filter((post): post is FeedPost => Boolean(post));
}
