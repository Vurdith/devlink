"use client";

import { memo } from "react";
import type { FC } from "react";
import type {
  RankingBreakdown,
  RankingWeights,
} from "@/lib/ranking/devlink-ranking";
import { AnalyticsCard } from "./AnalyticsCard";
import { cn } from "@/lib/cn";

interface ScoreBreakdownProps {
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

// Helper component for each score row
const ScoreComponent = memo(function ScoreComponent({
  index,
  name,
  icon,
  color,
  score,
  contribution,
  weight,
  details,
  isBonus,
  isPenalty,
}: {
  index: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  score: number | null;
  contribution: number;
  weight: number;
  details: React.ReactNode;
  isBonus?: boolean;
  isPenalty?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-xl bg-white/5 border border-white/10 animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          `bg-gradient-to-br ${color} text-white`
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{name}</span>
              {score !== null && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--muted-foreground)]">
                  {score.toFixed(0)}/100
                </span>
              )}
              {weight > 0 && (
                <span className="text-xs text-[var(--muted-foreground)]">
                  ×{weight}%
                </span>
              )}
            </div>
            <span className={cn(
              "text-lg font-bold",
              isPenalty ? "text-red-400" : isBonus ? "text-emerald-400" : "text-white"
            )}>
              {isPenalty ? "" : "+"}{contribution.toFixed(1)}
            </span>
          </div>
          {details}
        </div>
      </div>
    </div>
  );
});

export const ScoreBreakdown: FC<ScoreBreakdownProps> = memo(function ScoreBreakdown({ breakdown, weights }) {
  const calc = breakdown.calculation;
  
  // Calculate the weighted contributions
  const engagementContribution = (breakdown.engagementScore * weights.engagementWeight) / 100;
  const freshnessContribution = (breakdown.freshnessScore * weights.freshnessWeight) / 100;
  
  return (
    <AnalyticsCard gradient delay={0.1}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">How Your Score Works</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Simple breakdown of your ranking
          </p>
        </div>
      </div>

      {/* The Formula */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-xs text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Formula</div>
        <div className="text-white font-mono text-sm">
          Score = Engagement + Freshness + Discovery − Penalties
        </div>
      </div>

      {/* Score Components */}
      <div className="space-y-4">
        {/* 1. Engagement */}
        <ScoreComponent
          index={0}
          name="Engagement"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          }
          color="from-rose-500 to-pink-500"
          score={breakdown.engagementScore}
          contribution={engagementContribution}
          weight={weights.engagementWeight}
          details={
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <div>Raw weighted: {calc?.rawEngagement?.toFixed(1) ?? "0"} (likes×1 + replies×3 + reposts×2 + saves×2)</div>
              <div>Capped score: {calc?.engagementCapped?.toFixed(0) ?? "0"}/100</div>
            </div>
          }
        />

        {/* 2. Freshness */}
        <ScoreComponent
          index={1}
          name="Freshness"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
          color="from-emerald-500 to-green-500"
          score={breakdown.freshnessScore}
          contribution={freshnessContribution}
          weight={weights.freshnessWeight}
          details={
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <div>Post age: {calc?.postAgeHours?.toFixed(0) ?? "0"} hours</div>
              <div>Decay multiplier: {((calc?.freshnessMultiplier ?? 1) * 100).toFixed(0)}%</div>
              <div className="text-[10px]">Full score for {weights.freshnessPeakHours}h, halves every {weights.freshnessHalfLifeHours}h</div>
            </div>
          }
        />

        {/* 3. Discovery Boost */}
        <ScoreComponent
          index={2}
          name="Discovery Boost"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
          color="from-red-500 to-red-600"
          score={null}
          contribution={breakdown.discoveryBoost}
          weight={weights.discoveryWeight}
          isBonus
          details={
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <div>New creator: {calc?.isNewCreator ? "Yes" : "No"}</div>
              {calc?.isNewCreator && (
                <div className="text-emerald-400">+{breakdown.discoveryBoost.toFixed(1)} points added</div>
              )}
              <div className="text-[10px]">Applies if &lt;{weights.newCreatorFollowerThreshold} followers or &lt;{weights.newCreatorAgeDays} days old</div>
            </div>
          }
        />

        {/* 4. Penalties */}
        {breakdown.penalties > 0 && (
          <ScoreComponent
            index={3}
            name="Penalties"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
            color="from-red-500 to-rose-500"
            score={null}
            contribution={-breakdown.penalties}
            weight={0}
            isPenalty
            details={
              <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                {breakdown.moderationNotes.map((note) => (
                  <div key={note} className="text-amber-400">{note.replace(/_/g, " ")}</div>
                ))}
                {calc?.duplicateScore && calc.duplicateScore > 0 && (
                  <div>Duplicate score: {(calc.duplicateScore * 100).toFixed(0)}%</div>
                )}
              </div>
            }
          />
        )}
      </div>

      {/* Final Calculation */}
      <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 border border-[var(--accent)]/20">
          <div className="text-xs text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Final Calculation</div>
          <div className="font-mono text-sm text-white mb-3">
            {engagementContribution.toFixed(1)} + {freshnessContribution.toFixed(1)} + {breakdown.discoveryBoost.toFixed(1)} − {breakdown.penalties.toFixed(1)} = <span className="text-[var(--accent)] font-bold">{breakdown.finalScore.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[var(--muted-foreground)]">Final Score</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]">
              {breakdown.finalScore.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
});
