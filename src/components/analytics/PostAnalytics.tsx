"use client";

import { memo } from "react";
import type {
  RankingBreakdown,
  RankingWeights,
} from "@/lib/ranking/devlink-ranking";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { EngagementInsights } from "./EngagementInsights";
import { AppliedSafeguards } from "./AppliedSafeguards";
import { InterpretationGuide } from "./InterpretationGuide";

interface PostAnalyticsProps {
  breakdown: RankingBreakdown;
  weights: RankingWeights;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
    uniqueEngagers: number;
  };
  timeSeriesData?: Array<{
    date: string;
    views: number;
    likes: number;
    engagements: number;
  }>;
  contentPreview: string;
  createdAt: Date | string;
  rankingPosition: number | null;
  totalRanked: number;
  author?: {
    username?: string;
    name?: string | null;
  };
}

export const PostAnalytics = memo(function PostAnalytics({
  breakdown,
  weights,
  engagement,
  contentPreview,
  createdAt,
  rankingPosition,
  totalRanked,
  author,
}: PostAnalyticsProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with stats */}
      <AnalyticsHeader
        author={author}
        rankingPosition={rankingPosition}
        totalRanked={totalRanked}
        createdAt={createdAt}
        engagement={engagement}
        breakdown={breakdown}
        contentPreview={contentPreview}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown - Full width on mobile, half on desktop */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <ScoreBreakdown
            breakdown={breakdown}
            weights={weights}
            engagement={engagement}
          />
        </div>

        {/* Engagement Insights */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <EngagementInsights
            breakdown={breakdown}
            weights={weights}
            engagement={engagement}
          />
        </div>

        {/* Applied Safeguards */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <AppliedSafeguards breakdown={breakdown} weights={weights} />
        </div>

        {/* Interpretation Guide - Full width */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <InterpretationGuide weights={weights} />
        </div>
      </div>
    </div>
  );
});
