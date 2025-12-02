import { useMemo, useState } from "react";
import type { FC } from "react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import type {
  RankingBreakdown,
  RankingWeights,
} from "@/lib/ranking/devlink-ranking";

interface ScoreExplanationProps {
  breakdown: RankingBreakdown;
  weights: RankingWeights;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
    uniqueEngagers: number;
  };
}

export const ScoreExplanation: FC<ScoreExplanationProps> = ({
  breakdown,
  weights,
  engagement,
}) => {
  const [expanded, setExpanded] = useState(false);
  const nf0 = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const nf2 = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );
  const nf4 = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }),
    []
  );

  const weightedLikes = engagement.likes * weights.engagement.like;
  const weightedReplies = engagement.replies * weights.engagement.reply;
  const weightedReposts = engagement.reposts * weights.engagement.repost;
  const weightedSaves = engagement.saves * weights.engagement.save;
  const rawCore =
    breakdown.baseEngagementScore + breakdown.engagementRatioScore;
  const finalScorePreFloor =
    rawCore * breakdown.timeDecayMultiplier +
    breakdown.newDeveloperBoost -
    breakdown.spamPenalty;

  return (
    <AnalyticsCard className="!p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white">
          How this score is calculated
        </h3>
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-600/10"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Hide details" : "Show detailed math"}
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-400">
        Every card above maps to a step in the ranking pipeline. Expand to see
        the exact calculations.
      </p>
      {expanded && (
        <ol className="space-y-4 text-sm text-gray-300">
        <li>
          <p className="font-semibold text-white">1. Weighted engagement</p>
          <p className="mt-1">
            ({nf0.format(engagement.likes)} × {nf2.format(
              weights.engagement.like
            )}{" "}
            = {nf2.format(weightedLikes)}) + ({nf0.format(
              engagement.replies
            )}{" "}
            × {nf2.format(weights.engagement.reply)} = {nf2.format(
              weightedReplies
            )}){" "}
            + ({nf0.format(engagement.reposts)} × {nf2.format(
              weights.engagement.repost
            )}{" "}
            = {nf2.format(weightedReposts)}) + ({nf0.format(
              engagement.saves
            )}{" "}
            × {nf2.format(weights.engagement.save)} = {nf2.format(
              weightedSaves
            )}){" "}
            ={" "}
            <span className="font-semibold text-red-300">
              {nf2.format(breakdown.baseEngagementScore)}
            </span>
          </p>
        </li>
        <li>
          <p className="font-semibold text-white">
            2. Engagement-to-follower ratio
          </p>
          <p className="mt-1">
            Unique engagers ({nf0.format(engagement.uniqueEngagers)}) ÷
            followers ({nf0.format(breakdown.metrics.followerCount)}) ={" "}
            {nf4.format(
              breakdown.metrics.engagementToFollowerRatio
            )}. Multiply by the engagement ratio weight (
            {nf2.format(weights.engagementRatio)}) to get{" "}
            <span className="font-semibold text-red-300">
              {nf2.format(breakdown.engagementRatioScore)}
            </span>
          </p>
        </li>
        <li>
          <p className="font-semibold text-white">3. Time decay</p>
          <p className="mt-1">
            Raw core ({nf2.format(rawCore)}) × decay multiplier (
            {nf2.format(
              breakdown.timeDecayMultiplier
            )}) ={" "}
            <span className="font-semibold text-red-300">
              {nf2.format(breakdown.decayedCoreScore)}
            </span>
            . The multiplier is chosen using the {nf2.format(
              breakdown.metrics.postAgeHours
            )}
            h age vs the fresh/evergreen half-lives.
          </p>
        </li>
        <li>
          <p className="font-semibold text-white">4. New developer boost</p>
          <p className="mt-1">
            Follower runway + account-age runway combine, then get capped by the
            max boost ({nf2.format(
              weights.newDeveloper.maxBoost
            )}). Result:{" "}
            <span className="font-semibold text-red-300">
              {nf2.format(breakdown.newDeveloperBoost)}
            </span>
          </p>
        </li>
        <li>
          <p className="font-semibold text-white">5. Spam penalties</p>
          <p className="mt-1">
            Duplicate content and low-engagement checks subtract up to{" "}
            {nf2.format(weights.spamPenalty.maxPenalty)}. For this post we
            removed{" "}
            <span className="font-semibold text-rose-300">
              {nf2.format(breakdown.spamPenalty)}
            </span>
          </p>
        </li>
        <li>
          <p className="font-semibold text-white">6. Final assembly</p>
          <p className="mt-1">
            ({nf2.format(rawCore)} ×{" "}
            {nf2.format(breakdown.timeDecayMultiplier)}) +{" "}
            {nf2.format(breakdown.newDeveloperBoost)} −{" "}
            {nf2.format(breakdown.spamPenalty)} ={" "}
            <span className="font-semibold text-red-300">
              {nf2.format(finalScorePreFloor)}
            </span>
            , then floor-protected at{" "}
            {nf2.format(weights.baseScoreFloor)} to give the final score shown
            above.
          </p>
        </li>
      </ol>
      )}
    </AnalyticsCard>
  );
};
