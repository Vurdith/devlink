import { notFound } from "next/navigation";
import { PostAnalytics } from "@/components/analytics/PostAnalytics";
import {
  DEFAULT_RANKING_WEIGHTS,
  rankPosts,
} from "@/lib/ranking/devlink-ranking";
import {
  buildRankablePost,
  getEngagementSnapshot,
} from "@/lib/ranking/ranking-transforms";
import {
  fetchHomeFeedPosts,
  fetchPostForRanking,
} from "@/server/feed/fetch-home-feed";
import { getPostAnalyticsTimeSeries } from "@/server/analytics";

interface AnalyticsPageParams {
  params: Promise<{
    postId: string;
  }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageParams) {
  const { postId } = await params;

  let feedPosts = await fetchHomeFeedPosts(150);
  let targetPost = feedPosts.find((post) => post.id === postId);

  if (!targetPost) {
    const fetched = await fetchPostForRanking(postId);
    if (!fetched) {
      notFound();
    }
    // fetchPostForRanking returns a raw Prisma post; cast to feed format
    const enriched = {
      ...fetched,
      likes: [] as { id: string; userId: string }[],
      reposts: [] as { id: string; userId: string }[],
      savedBy: [] as { id: string; userId: string }[],
      hashtags: [] as string[],
      replies: [] as null[],
      views: 0,
      poll: fetched.poll ? {
        ...fetched.poll,
        options: fetched.poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: Array(opt._count.votes).fill({ id: '' }) as { id: string }[],
        }))
      } : null,
    };
    feedPosts = [...feedPosts, enriched];
    targetPost = enriched;
  }

  const rankablePosts = feedPosts.map(buildRankablePost);
  const rankingResult = rankPosts(rankablePosts);
  const breakdown = rankingResult.breakdownById[postId];

  if (!breakdown || !targetPost) {
    notFound();
  }

  const rankingPosition = rankingResult.orderedPostIds.indexOf(postId);
  const engagementSnapshot = getEngagementSnapshot(targetPost);

  // Fetch full time-series data from the dedicated analytics service
  // This ensures we get ALL views/likes, not just the truncated sample from the feed
  const timeSeriesData = await getPostAnalyticsTimeSeries(postId);

  return (
    <div className="min-h-screen bg-slate-950/30 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="space-y-12 sm:space-y-16">
          <PostAnalytics
            breakdown={breakdown}
            weights={DEFAULT_RANKING_WEIGHTS}
            engagement={engagementSnapshot}
            timeSeriesData={timeSeriesData}
            contentPreview={targetPost.content ?? ""}
            createdAt={targetPost.createdAt}
            rankingPosition={rankingPosition >= 0 ? rankingPosition + 1 : null}
            totalRanked={rankingResult.orderedPostIds.length}
            author={{
              username: targetPost.user?.username ?? undefined,
              name: targetPost.user?.name ?? undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
