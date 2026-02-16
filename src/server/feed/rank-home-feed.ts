import { rankPosts } from "@/lib/ranking/devlink-ranking";
import { buildRankablePost } from "@/lib/ranking/ranking-transforms";
import type { FeedPost } from "@/server/feed/fetch-home-feed";
import { rankFeedWithRust } from "@/server/services/hotpath-client";

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

  return safeOrder.map((id) => postMap.get(id)).filter((post): post is FeedPost => Boolean(post));
}
