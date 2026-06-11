import { rankPosts } from "@/lib/ranking/devlink-ranking";
import { buildRankablePost, type FeedPostForRanking } from "@/lib/ranking/ranking-transforms";
import { rankFeedWithRust } from "@/server/services/hotpath-client";

const DIVERSITY_WINDOW = 20;
const MAX_POSTS_PER_AUTHOR_IN_WINDOW = 2;
const FOLLOWED_AUTHOR_BOOST = 8;
const INTEREST_MATCH_BOOST = 9;
const ADDITIONAL_INTEREST_MATCH_BOOST = 4;
type RankableFeedPost = FeedPostForRanking & { id: string; userId: string };

interface RankHomeFeedPostsOptions {
  followedAuthorIds?: Set<string>;
  viewerInterestTerms?: string[];
}

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

function applyAuthorDiversity<TPost extends RankableFeedPost>(order: string[], postsById: Map<string, TPost>): string[] {
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

function scoreInterestMatch(post: RankableFeedPost, interestTerms: string[]) {
  if (interestTerms.length === 0) return 0;

  const content = post.content?.toLowerCase() ?? "";
  if (!content) return 0;

  const matchCount = interestTerms.filter((term) => content.includes(term)).length;
  if (matchCount === 0) return 0;

  return INTEREST_MATCH_BOOST + Math.min(2, matchCount - 1) * ADDITIONAL_INTEREST_MATCH_BOOST;
}

function normalizeInterestTerms(interestTerms: string[]) {
  return [
    ...new Set(
      interestTerms
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 2)
    ),
  ].slice(0, 8);
}

export async function rankHomeFeedPosts<TPost extends RankableFeedPost>(
  posts: TPost[],
  options: RankHomeFeedPostsOptions = {}
): Promise<TPost[]> {
  if (posts.length <= 1) return posts;

  const rankablePosts = posts.map(buildRankablePost);
  const localRanking = rankPosts(rankablePosts);
  const followedAuthorIds = options.followedAuthorIds ?? new Set<string>();
  const viewerInterestTerms = normalizeInterestTerms(options.viewerInterestTerms ?? []);
  const viewerRanked = localRanking.ranked
    .map((rankedPost) => ({
      ...rankedPost,
      score:
        rankedPost.score +
        (followedAuthorIds.has(rankedPost.post.userId) ? FOLLOWED_AUTHOR_BOOST : 0) +
        scoreInterestMatch(rankedPost.post, viewerInterestTerms),
    }))
    .sort((a, b) => b.score - a.score);
  const fallbackOrder = viewerRanked.map(({ post }) => post.id);

  const rustRanking = await rankFeedWithRust({
    candidates: viewerRanked.map(({ post, score }) => ({
      postId: post.id,
      score,
      createdAt: new Date(post.createdAt).toISOString(),
    })),
  });

  const rustOrder = rustRanking?.orderedPostIds ?? [];
  const safeOrder = mergeOrdering(rustOrder, fallbackOrder);
  const postMap = new Map(posts.map((post) => [post.id, post]));
  const diversifiedOrder = applyAuthorDiversity(safeOrder, postMap);

  return diversifiedOrder.map((id) => postMap.get(id)).filter((post): post is TPost => Boolean(post));
}
