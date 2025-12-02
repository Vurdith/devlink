"use client";

import { useMemo, memo } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import type { FC } from "react";
import type { RankingBreakdown } from "@/lib/ranking/devlink-ranking";

interface AnalyticsHeaderProps {
  author?: {
    username?: string;
    name?: string | null;
  };
  rankingPosition: number | null;
  totalRanked: number;
  createdAt: Date | string;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
    uniqueEngagers: number;
  };
  breakdown: RankingBreakdown;
  contentPreview: string;
}

const StatCard = memo(function StatCard({ 
  label, 
  value, 
  icon,
  color 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2 text-white`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
});

export const AnalyticsHeader: FC<AnalyticsHeaderProps> = memo(function AnalyticsHeader({
  author,
  rankingPosition,
  totalRanked,
  createdAt,
  engagement,
  breakdown,
  contentPreview,
}) {
  const postedDistance = useMemo(
    () =>
      formatDistanceToNowStrict(new Date(createdAt), {
        addSuffix: true,
      }),
    [createdAt]
  );

  const totalEngagement = engagement.likes + engagement.replies + engagement.reposts + engagement.saves;

  return (
    <div className="relative animate-slide-up">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-[var(--accent-2)]/20 rounded-3xl blur-3xl opacity-30" />
      
      <div className="relative bg-[#0d0d12] rounded-2xl p-6 border border-white/10">
        {/* Header Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
                Post Analytics
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Performance for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]">
                @{author?.username}
              </span>
            </h1>
          </div>
          
          {/* Ranking Badge */}
          {rankingPosition != null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-2)]/20 border border-[var(--accent)]/30 animate-pop-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-semibold text-white">
                #{rankingPosition} <span className="text-[var(--muted-foreground)]">of {totalRanked}</span>
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Total Engagement" 
            value={totalEngagement.toLocaleString()} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/></svg>}
            color="from-rose-500 to-pink-500"
          />
          <StatCard 
            label="Unique Engagers" 
            value={engagement.uniqueEngagers.toLocaleString()} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/></svg>}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard 
            label="Final Score" 
            value={breakdown.finalScore.toFixed(1)} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/></svg>}
            color="from-amber-500 to-orange-500"
          />
          <StatCard 
            label="Followers" 
            value={breakdown.metrics.followerCount.toLocaleString()} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>}
            color="from-violet-500 to-red-600"
          />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)] mb-4">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Posted {postedDistance}
          </span>
        </div>

        {/* Content Preview */}
        {contentPreview.trim().length > 0 && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm text-[var(--muted-foreground)] italic">
              "{contentPreview.length > 200 ? contentPreview.slice(0, 200) + "..." : contentPreview}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
