"use client";

import { memo } from "react";
import type { FC } from "react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import type {
  RankingBreakdown,
  RankingWeights,
} from "@/lib/ranking/devlink-ranking";
import { cn } from "@/lib/cn";

interface AppliedSafeguardsProps {
  breakdown: RankingBreakdown;
  weights: RankingWeights;
}

export const AppliedSafeguards: FC<AppliedSafeguardsProps> = memo(function AppliedSafeguards({
  breakdown,
  weights,
}) {
  const calc = breakdown.calculation;
  
  const safeguards = [
    {
      label: "Content Age",
      value: `${calc?.postAgeHours?.toFixed(0) ?? 0}h`,
      description: calc?.postAgeHours && calc.postAgeHours > weights.freshnessPeakHours 
        ? "Freshness decaying" 
        : "Full freshness",
      status: calc?.postAgeHours && calc.postAgeHours <= weights.freshnessPeakHours 
        ? "good" 
        : calc?.postAgeHours && calc.postAgeHours <= weights.freshnessHalfLifeHours 
          ? "warning" 
          : "low",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Freshness Score",
      value: `${breakdown.freshnessScore?.toFixed(0) ?? 100}%`,
      description: `${((calc?.freshnessMultiplier ?? 1) * 100).toFixed(0)}% multiplier`,
      status: breakdown.freshnessScore && breakdown.freshnessScore >= 70 
        ? "good" 
        : breakdown.freshnessScore && breakdown.freshnessScore >= 40 
          ? "warning" 
          : "low",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Duplicate Check",
      value: calc?.duplicateScore && calc.duplicateScore > 0 
        ? `${(calc.duplicateScore * 100).toFixed(0)}%` 
        : "Unique",
      description: "Content similarity",
      status: !calc?.duplicateScore || calc.duplicateScore < 0.1 
        ? "good" 
        : calc.duplicateScore < 0.5 
          ? "warning" 
          : "bad",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    },
    {
      label: "Total Penalties",
      value: breakdown.penalties > 0 ? `-${breakdown.penalties.toFixed(1)}` : "None",
      description: breakdown.penalties > 0 ? "Points deducted" : "No issues found",
      status: breakdown.penalties === 0 
        ? "good" 
        : breakdown.penalties < 5 
          ? "warning" 
          : "bad",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  const statusColors = {
    good: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    warning: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    low: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    bad: { bg: "bg-[var(--color-accent)]/20", text: "text-[var(--color-accent)]", border: "border-[var(--color-accent)]/30" },
    neutral: { bg: "bg-white/10", text: "text-[var(--muted-foreground)]", border: "border-white/20" },
  };

  return (
    <AnalyticsCard delay={0.2}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Quality Checks</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Anti-spam & freshness</p>
        </div>
      </div>

      <div className="space-y-3">
        {safeguards.map((item, index) => {
          const colors = statusColors[item.status as keyof typeof statusColors];
          
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all animate-slide-up",
                colors.bg,
                colors.border
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, colors.text)}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{item.description}</div>
                </div>
              </div>
              <div className={cn("text-sm font-semibold", colors.text)}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
});
