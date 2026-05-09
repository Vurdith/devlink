import {
  fetchHomeFeedCandidates,
  fetchHomeFeedPostDetails,
  type FeedPost,
} from "@/server/feed/fetch-home-feed";
import { rankHomeFeedPosts } from "@/server/feed/rank-home-feed";

export const HOME_FEED_CANDIDATE_LIMIT = 120;
export const HOME_FEED_RENDER_LIMIT = 30;

interface FetchRankedHomeFeedPostsOptions {
  candidateLimit?: number;
  renderLimit?: number;
}

export async function fetchRankedHomeFeedPosts({
  candidateLimit = HOME_FEED_CANDIDATE_LIMIT,
  renderLimit = HOME_FEED_RENDER_LIMIT,
}: FetchRankedHomeFeedPostsOptions = {}): Promise<FeedPost[]> {
  if (candidateLimit <= 0 || renderLimit <= 0) {
    return [];
  }

  const candidates = await fetchHomeFeedCandidates(candidateLimit);
  if (candidates.length === 0) {
    return [];
  }

  const rankedCandidates = (await rankHomeFeedPosts(candidates)).slice(0, renderLimit);

  return fetchHomeFeedPostDetails(rankedCandidates.map((post) => post.id));
}
