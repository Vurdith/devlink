import {
  fetchHomeFeedCandidates,
  fetchFollowedHomeFeedCandidates,
  fetchHomeFeedPostDetails,
  fetchInterestHomeFeedCandidates,
  type FeedPost,
} from "@/server/feed/fetch-home-feed";
import { mergeUniqueFeedCandidates } from "@/server/feed/feed-candidates";
import { rankHomeFeedPosts } from "@/server/feed/rank-home-feed";
import { getOrSetFeedCache } from "@/server/cache";
import { prismaRead } from "@/server/db-read";

export const HOME_FEED_CANDIDATE_LIMIT = 120;
export const HOME_FEED_FOLLOWED_CANDIDATE_LIMIT = 60;
export const HOME_FEED_INTEREST_CANDIDATE_LIMIT = 60;
export const HOME_FEED_RENDER_LIMIT = 30;

interface FetchRankedHomeFeedPostsOptions {
  candidateLimit?: number;
  renderLimit?: number;
  currentUserId?: string;
}

function normalizeViewerInterestTerm(term: string | null | undefined) {
  return term?.trim().toLowerCase() ?? "";
}

function buildViewerInterestTerms(
  skills: Array<{
    skill: { name: string; category: string };
  }>
) {
  return [
    ...new Set(
      skills
        .flatMap(({ skill }) => [skill.name, skill.category])
        .map(normalizeViewerInterestTerm)
        .filter((term) => term.length >= 2)
    ),
  ].slice(0, 8);
}

async function fetchViewerFeedContext(currentUserId?: string) {
  if (!currentUserId) {
    return {
      followedAuthorIds: new Set<string>(),
      interestTerms: [],
    };
  }

  const [following, currentUser] = await Promise.all([
    prismaRead.follower.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
      take: 500,
    }),
    prismaRead.user.findUnique({
      where: { id: currentUserId },
      select: {
        skills: {
          select: {
            skill: {
              select: {
                name: true,
                category: true,
              },
            },
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          take: 8,
        },
      },
    }),
  ]);

  return {
    followedAuthorIds: new Set(following.map((follow) => follow.followingId)),
    interestTerms: buildViewerInterestTerms(currentUser?.skills ?? []),
  };
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
  const cacheKey = `home:ranked:v4:${viewerKey}:${Math.trunc(candidateLimit)}:${Math.trunc(renderLimit)}`;

  return getOrSetFeedCache(cacheKey, async () => {
    const [candidates, viewerContext] = await Promise.all([
      fetchHomeFeedCandidates(candidateLimit),
      fetchViewerFeedContext(currentUserId),
    ]);

    const [followedCandidates, interestCandidates] = await Promise.all([
      fetchFollowedHomeFeedCandidates(
        [...viewerContext.followedAuthorIds],
        Math.min(HOME_FEED_FOLLOWED_CANDIDATE_LIMIT, Math.max(renderLimit * 2, 1))
      ),
      fetchInterestHomeFeedCandidates(
        viewerContext.interestTerms,
        Math.min(HOME_FEED_INTEREST_CANDIDATE_LIMIT, Math.max(renderLimit * 2, 1))
      ),
    ]);
    const candidatePool = mergeUniqueFeedCandidates(candidates, followedCandidates, interestCandidates);

    if (candidatePool.length === 0) {
      return [];
    }

    const rankedCandidates = (await rankHomeFeedPosts(candidatePool, {
      followedAuthorIds: viewerContext.followedAuthorIds,
      viewerInterestTerms: viewerContext.interestTerms,
    })).slice(0, renderLimit);

    return fetchHomeFeedPostDetails(rankedCandidates.map((post) => post.id));
  });
}
