"use client";

import { memo } from "react";
import type { FC } from "react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import type { RankingWeights } from "@/lib/ranking/devlink-ranking";

interface InterpretationGuideProps {
  weights: RankingWeights;
}

export const InterpretationGuide: FC<InterpretationGuideProps> = memo(function InterpretationGuide({
  weights,
}) {
  const tips = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: "Engagement Weights",
      description: `Likes ×${weights.engagement.like}, Replies ×${weights.engagement.reply}, Reposts ×${weights.engagement.repost}, Saves ×${weights.engagement.save}. Replies are weighted highest because they show real conversation.`,
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "Freshness Decay",
      description: `Posts keep full freshness for ${weights.freshnessPeakHours} hours, then lose half their freshness score every ${weights.freshnessHalfLifeHours} hours. Minimum: ${(weights.freshnessMinimum * 100).toFixed(0)}%.`,
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "New Creator Discovery",
      description: `Accounts with under ${weights.newCreatorFollowerThreshold} followers or under ${weights.newCreatorAgeDays} days old get up to +${weights.maxDiscoveryBoost} bonus points to help them get discovered.`,
      color: "from-[var(--color-accent)] to-[var(--color-accent)]",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: "Weight Distribution",
      description: `Engagement: ${weights.engagementWeight}%, Freshness: ${weights.freshnessWeight}%, Discovery: ${weights.discoveryWeight}%. Half your score comes from engagement.`,
      color: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <AnalyticsCard delay={0.25}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">How Ranking Works</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Understanding your score</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip, index) => (
          <div
            key={tip.title}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tip.color} flex items-center justify-center mb-3 text-white`}>
              {tip.icon}
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{tip.title}</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
});
