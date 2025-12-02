"use client";

import { memo } from "react";
import type { FC } from "react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import type {
  RankingBreakdown,
  RankingWeights,
} from "@/lib/ranking/devlink-ranking";
import { cn } from "@/lib/cn";

interface EngagementInsightsProps {
  breakdown: RankingBreakdown;
  weights: RankingWeights;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
  };
}

export const EngagementInsights: FC<EngagementInsightsProps> = memo(function EngagementInsights({
  breakdown,
  weights,
  engagement,
}) {
  const totalEngagement = engagement.likes + engagement.replies + engagement.reposts + engagement.saves;
  const calc = breakdown.calculation;

  const metrics = [
    { 
      key: "likes", 
      label: "Likes", 
      value: engagement.likes,
      weight: weights.engagement.like,
      contribution: engagement.likes * weights.engagement.like,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "text-rose-400",
      bgColor: "bg-rose-500/20"
    },
    { 
      key: "replies",
      label: "Replies", 
      value: engagement.replies,
      weight: weights.engagement.reply,
      contribution: engagement.replies * weights.engagement.reply,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    { 
      key: "reposts",
      label: "Reposts", 
      value: engagement.reposts,
      weight: weights.engagement.repost,
      contribution: engagement.reposts * weights.engagement.repost,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    { 
      key: "saves",
      label: "Saves", 
      value: engagement.saves,
      weight: weights.engagement.save,
      contribution: engagement.saves * weights.engagement.save,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "text-amber-400",
      bgColor: "bg-amber-500/20"
    },
  ];

  return (
    <AnalyticsCard delay={0.15}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Engagement Details</h3>
          <p className="text-sm text-[var(--muted-foreground)]">How interactions contribute</p>
        </div>
      </div>

      {/* Engagement Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, index) => {
          const percentage = totalEngagement > 0 ? ((metric.value / totalEngagement) * 100).toFixed(0) : 0;
          
          return (
            <div
              key={metric.key}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", metric.bgColor, metric.color)}>
                  {metric.icon}
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{metric.value.toLocaleString()}</span>
                <span className="text-xs text-[var(--muted-foreground)]">({percentage}%)</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                ×{metric.weight} = <span className="text-white">{metric.contribution.toFixed(1)}</span> pts
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Total Engagement</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                All interactions combined
              </div>
            </div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {totalEngagement.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-red-600/10 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Weighted Engagement</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                After applying weights
              </div>
            </div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-red-500">
              {(calc?.rawEngagement ?? 0).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
});
