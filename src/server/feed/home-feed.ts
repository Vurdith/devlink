import {
  fetchHomeFeedCandidates,
  fetchHomeFeedPostDetails,
  type FeedPost,
} from "@/server/feed/fetch-home-feed";
import { rankHomeFeedPosts } from "@/server/feed/rank-home-feed";
import { getOrSetFeedCache } from "@/server/cache";
import { prismaRead } from "@/server/db-read";

export const HOME_FEED_CANDIDATE_LIMIT = 120;
export const HOME_FEED_RENDER_LIMIT = 30;

interface FetchRankedHomeFeedPostsOptions {
  candidateLimit?: number;
  renderLimit?: number;
  currentUserId?: string;
}

async function fetchFollowedAuthorIds(currentUserId?: string) {
  if (!currentUserId) return new Set<string>();

  const following = await prismaRead.follower.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
    take: 500,
  });

  return new Set(following.map((follow) => follow.followingId));
}

export async function fetchRankedHomeFeedPosts({
  candidateLimit = HOME_FEED_CANDIDATE_LIMIT,
  renderLimit = HOME_FEED_RENDER_LIMIT,
  currentUserId,
}: FetchRankedHomeFeedPostsOptions = {}): Promise<FeedPost[]> {
  if (candidateLimit <= 0 || renderLimit <= 0) {
    return [];
  }

  const viewerKey = currentUserId ? `user:${currentUserId}` : "anon";
  const cacheKey = `home:ranked:v2:${viewerKey}:${Math.trunc(candidateLimit)}:${Math.trunc(renderLimit)}`;

  return getOrSetFeedCache(cacheKey, async () => {
    const [candidates, followedAuthorIds] = await Promise.all([
      fetchHomeFeedCandidates(candidateLimit),
      fetchFollowedAuthorIds(currentUserId),
    ]);
    if (candidates.length === 0) {
      return [];
    }

    const rankedCandidates = (await rankHomeFeedPosts(candidates, { followedAuthorIds })).slice(0, renderLimit);

    return fetchHomeFeedPostDetails(rankedCandidates.map((post) => post.id));
  });
}
