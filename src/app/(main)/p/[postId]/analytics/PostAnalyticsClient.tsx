"use client";

import { useEffect, useState, useMemo } from "react";
import { formatDistanceToNowStrict, differenceInHours, differenceInDays } from "date-fns";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { surface } from "@/components/ui/design-system";
import { calculateFallbackScore, DEFAULT_WEIGHTS, type AnalyticsEngagement } from "./analytics-scoring";

import type { ScoreBreakdown as RustScoreBreakdown } from "@/server/services/hotpath-client";

interface PostAnalyticsClientProps {
  postId: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    name: string | null;
  };
  followerCount: number;
  viewCount: number;
  engagement: AnalyticsEngagement;
  accountCreatedAt: string;
  rustBreakdown?: RustScoreBreakdown | null;
  recommendations?: string[];
}

// ============================================================================
// UI Subcomponents
// ============================================================================

// Icons
const HeartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MessageIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RepostIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BookmarkIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ZapIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CrownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 17l2 4h16l2-4-4-10-4 6-4-6-4 6-4-6-4 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShieldAlertIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

function TerminalMathBlock({ 
  rows, 
  rawPoints,
  normalizedValue,
  weight, 
  finalPoints, 
  colorClass 
}: { 
  rows: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  rawPoints?: number;
  normalizedValue: number;
  weight: number;
  finalPoints: number;
  colorClass: string;
}) {
  return (
    <div className="bg-[rgba(12,16,23,0.72)] rounded-[1.25rem] border border-white/5 p-5 font-mono relative overflow-hidden h-full flex flex-col noise-overlay">
      <div className="space-y-2 flex-1">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-white/60">{row.label}</span>
            <span className="text-white/90">{row.value}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
        {rawPoints !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Raw Points</span>
            <span className="text-white">{rawPoints.toFixed(1)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/50 text-xs">→ normalized (0-100)</span>
          <span className="text-white">{normalizedValue.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/50 text-xs">→ × {weight}% weight</span>
          <span className="text-white">{(normalizedValue * weight / 100).toFixed(1)}</span>
        </div>
      </div>
      
      <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
        <span className="text-white font-medium">Contribution</span>
        <span className={`font-bold text-xl ${colorClass}`}>+{finalPoints.toFixed(1)}</span>
      </div>
    </div>
  );
}

function AnimatedBar({ percentage, gradientClass, mounted }: { percentage: number, gradientClass: string, mounted: boolean }) {
  return (
    <div className="mt-8">
      <div className="flex justify-between text-[10px] font-mono text-white/50 mb-2 uppercase tracking-widest font-bold">
        <span>Algorithmic Multiplier</span>
        <span className="text-white">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full ${gradientClass} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: mounted ? `${Math.max(1, percentage)}%` : '0%' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PostAnalyticsClient({
  postId,
  content,
  createdAt,
  author,
  followerCount,
  viewCount,
  engagement,
  accountCreatedAt,
  rustBreakdown,
}: PostAnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const postDate = useMemo(() => new Date(createdAt), [createdAt]);
  const accountDate = useMemo(() => new Date(accountCreatedAt), [accountCreatedAt]);
  const now = useMemo(() => new Date(), []);
  
  const postAgeHours = Math.max(0.1, differenceInHours(now, postDate));
  const accountAgeDays = Math.max(0.1, differenceInDays(now, accountDate));
  const postedDistance = formatDistanceToNowStrict(postDate, { addSuffix: true });
  
  const breakdown = useMemo(() => {
    if (rustBreakdown) {
      return {
        finalScore: rustBreakdown.final_score,
        engagementScore: rustBreakdown.engagement_score,
        freshnessScore: rustBreakdown.freshness_score,
        discoveryScore: rustBreakdown.discovery_score,
        velocityScore: rustBreakdown.velocity_score,
        authorityScore: rustBreakdown.authority_score,
        penalties: rustBreakdown.penalties,
        penaltyReasons: rustBreakdown.penalty_reasons,
        rawEngagement: rustBreakdown.raw_engagement,
        postAgeHours: rustBreakdown.post_age_hours,
        isNewCreator: rustBreakdown.is_new_creator,
        followerCount: rustBreakdown.follower_count,
        viewCount: rustBreakdown.view_count,
        totalEngagement: rustBreakdown.total_engagement,
        engagementRate: rustBreakdown.engagement_rate,
        calculation: {
          weightedEngagement: rustBreakdown.calculation.weighted_engagement,
          engagementNormalized: rustBreakdown.calculation.engagement_normalized,
          freshnessMultiplier: rustBreakdown.calculation.freshness_multiplier,
          discoveryFactor: rustBreakdown.calculation.discovery_factor,
          velocityFactor: rustBreakdown.calculation.velocity_factor,
          authorityFactor: rustBreakdown.calculation.authority_factor,
          contentLength: rustBreakdown.calculation.content_length,
          duplicateScore: rustBreakdown.calculation.duplicate_score,
        },
        weighted: {
          engagement: (rustBreakdown.engagement_score * DEFAULT_WEIGHTS.components.engagement) / 100,
          freshness: (rustBreakdown.freshness_score * DEFAULT_WEIGHTS.components.freshness) / 100,
          discovery: (rustBreakdown.discovery_score * DEFAULT_WEIGHTS.components.discovery) / 100,
          velocity: (rustBreakdown.velocity_score * DEFAULT_WEIGHTS.components.velocity) / 100,
          authority: (rustBreakdown.authority_score * DEFAULT_WEIGHTS.components.authority) / 100,
        }
      };
    }
    
    return calculateFallbackScore(
      engagement,
      followerCount,
      viewCount,
      content.trim().length,
      postAgeHours,
      accountAgeDays
    );
  }, [rustBreakdown, engagement, followerCount, viewCount, content, postAgeHours, accountAgeDays]);
  
  const w = DEFAULT_WEIGHTS;
  
  if (!mounted) {
    return (
      <div className="min-h-screen pb-24 pt-8 px-6 flex justify-center">
        <div className="w-full max-w-5xl space-y-8 animate-pulse">
          <div className="h-10 w-32 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-[400px] glass rounded-3xl border border-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 glass rounded-3xl border border-white/10" />
            <div className="h-64 glass rounded-3xl border border-white/10" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-24 pt-8 px-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center mb-4">
          <BackButton fallbackPath={`/p/${postId}`} className="text-sm font-medium hover:text-white transition-colors" />
        </div>

        {/* Hero Dashboard */}
        <div className="glass rounded-[2rem] border border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-16 noise-overlay animate-fade-in">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(800px 400px at 50% 0%, rgba(var(--color-accent-rgb),0.15), transparent 70%)` }}
          />

          {/* Left: Score Circle */}
          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * breakdown.finalScore) / 100} 
                strokeLinecap="round"
                className="text-[var(--color-accent)] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-space-grotesk font-bold tracking-tighter text-white">
                {breakdown.finalScore.toFixed(0)}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/50 mt-1 font-bold">Total Score</span>
            </div>
          </div>

          {/* Right: Author & Stats Grid */}
          <div className="flex-1 w-full flex flex-col gap-8 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold text-white tracking-tight mb-2">
                Performance Report
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Analytics for post by <Link href={`/u/${author.username}`} className="text-[var(--color-accent)] hover:text-white transition-colors font-medium">@{author.username}</Link> • {postedDistance}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className={surface("panelMuted", "group relative col-span-2 flex flex-col justify-center overflow-hidden p-4 sm:col-span-1")}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-white/40 mb-2 flex items-center gap-2 relative z-10"><EyeIcon/></div>
                <div className="text-2xl font-space-grotesk font-bold text-white relative z-10">{viewCount.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1 font-semibold relative z-10">Views</div>
              </div>
              <div className={surface("panelMuted", "group relative flex flex-col justify-center overflow-hidden p-4")}>
                <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-rose-400/70 mb-2 flex items-center gap-2 relative z-10"><HeartIcon/></div>
                <div className="text-2xl font-space-grotesk font-bold text-white relative z-10">{engagement.likes.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1 font-semibold relative z-10">Likes</div>
              </div>
              <div className={surface("panelMuted", "group relative flex flex-col justify-center overflow-hidden p-4")}>
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-blue-400/70 mb-2 flex items-center gap-2 relative z-10"><MessageIcon/></div>
                <div className="text-2xl font-space-grotesk font-bold text-white relative z-10">{engagement.replies.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1 font-semibold relative z-10">Replies</div>
              </div>
              <div className={surface("panelMuted", "group relative flex flex-col justify-center overflow-hidden p-4")}>
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-green-400/70 mb-2 flex items-center gap-2 relative z-10"><RepostIcon/></div>
                <div className="text-2xl font-space-grotesk font-bold text-white relative z-10">{engagement.reposts.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1 font-semibold relative z-10">Reposts</div>
              </div>
              <div className={surface("panelMuted", "group relative flex flex-col justify-center overflow-hidden p-4")}>
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-amber-400/70 mb-2 flex items-center gap-2 relative z-10"><BookmarkIcon/></div>
                <div className="text-2xl font-space-grotesk font-bold text-white relative z-10">{engagement.saves.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1 font-semibold relative z-10">Saves</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-space-grotesk font-bold text-white tracking-tight">Full Points Breakdown</h2>
          <p className="text-[var(--muted-foreground)] mt-1">Total transparency into how the algorithm scored your post.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          
          {/* 1. Engagement */}
          <div className="lg:col-span-2 glass rounded-3xl border border-white/10 flex flex-col lg:flex-row p-1.5 noise-overlay bg-black/20 group hover:border-[var(--color-accent)]/30 transition-colors animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="p-8 lg:p-10 flex flex-col justify-center flex-1 relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <h3 className="text-2xl font-space-grotesk font-bold text-white tracking-tight">Engagement</h3>
                  <div className="text-sm text-white/50 mt-0.5">Primary Ranking Factor</div>
                </div>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Measures the depth and volume of interactions on your post. Because generating organic conversation is critical, <strong className="text-white font-medium">replies hold the highest algorithmic value</strong>, followed by reposts, saves, and standard likes.
              </p>
            </div>
            <div className="flex-1 p-3 lg:p-4">
               <TerminalMathBlock 
                 colorClass="text-rose-400"
                 weight={w.components.engagement}
                 finalPoints={breakdown.weighted.engagement}
                 normalizedValue={breakdown.calculation.engagementNormalized}
                 rawPoints={breakdown.calculation.weightedEngagement}
                 rows={[
                   { label: `Likes (${engagement.likes}) × ${w.engagement.like}`, value: engagement.likes * w.engagement.like },
                   { label: `Replies (${engagement.replies}) × ${w.engagement.reply}`, value: engagement.replies * w.engagement.reply },
                   { label: `Reposts (${engagement.reposts}) × ${w.engagement.repost}`, value: engagement.reposts * w.engagement.repost },
                   { label: `Saves (${engagement.saves}) × ${w.engagement.save}`, value: engagement.saves * w.engagement.save },
                 ]}
               />
            </div>
          </div>

          {/* 2. Freshness */}
          <div className="glass rounded-3xl border border-white/10 flex flex-col p-1.5 noise-overlay bg-black/20 group hover:border-[var(--color-accent)]/30 transition-colors animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="p-8 pb-6 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[1rem] bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ClockIcon />
                </div>
                <div>
                  <h3 className="text-xl font-space-grotesk font-bold text-white tracking-tight">Freshness</h3>
                  <div className="text-sm text-white/50 mt-0.5">Recency Bonus</div>
                </div>
              </div>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-2">
                Newer posts receive maximum visibility for the first {w.freshness.peakHours} hours, then decay by 50% every {w.freshness.halfLifeHours} hours.
              </p>
              <AnimatedBar mounted={mounted} percentage={breakdown.calculation.freshnessMultiplier * 100} gradientClass="bg-gradient-to-r from-emerald-600 to-emerald-400" />
            </div>
            <div className="p-3 lg:p-4 flex-1">
               <TerminalMathBlock 
                 colorClass="text-emerald-400"
                 weight={w.components.freshness}
                 finalPoints={breakdown.weighted.freshness}
                 normalizedValue={breakdown.calculation.freshnessMultiplier * 100}
                 rows={[
                   { label: `Post Age`, value: `${breakdown.postAgeHours.toFixed(1)} hrs` },
                   { label: `Peak Window`, value: `${w.freshness.peakHours.toFixed(1)} hrs` },
                   { label: `Decay Rate`, value: `-50% per ${w.freshness.halfLifeHours}h` },
                 ]}
               />
            </div>
          </div>

          {/* 3. Discovery */}
          <div className="glass rounded-3xl border border-white/10 flex flex-col p-1.5 noise-overlay bg-black/20 group hover:border-[var(--color-accent)]/30 transition-colors animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <div className="p-8 pb-6 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[1rem] bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <SearchIcon />
                </div>
                <div>
                  <h3 className="text-xl font-space-grotesk font-bold text-white tracking-tight">Discovery</h3>
                  <div className="text-sm text-white/50 mt-0.5">New Creator Boost</div>
                </div>
              </div>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-2">
                {breakdown.isNewCreator 
                  ? "You receive a discovery boost to help your content reach new audiences while you grow your account."
                  : "Your account is established. Discovery boosts help smaller accounts gain initial visibility."}
              </p>
              <AnimatedBar mounted={mounted} percentage={breakdown.calculation.discoveryFactor * 100} gradientClass="bg-gradient-to-r from-purple-600 to-purple-400" />
            </div>
            <div className="p-3 lg:p-4 flex-1">
               <TerminalMathBlock 
                 colorClass="text-purple-400"
                 weight={w.components.discovery}
                 finalPoints={breakdown.weighted.discovery}
                 normalizedValue={breakdown.calculation.discoveryFactor * 100}
                 rows={[
                   { label: `Followers Limit`, value: `< ${w.discovery.followerThreshold}` },
                   { label: `Account Age Limit`, value: `< ${w.discovery.ageDays}d` },
                   { label: `Boost Active`, value: breakdown.isNewCreator ? "YES" : "NO" },
                 ]}
               />
            </div>
          </div>

          {/* 4. Velocity */}
          <div className="glass rounded-3xl border border-white/10 flex flex-col p-1.5 noise-overlay bg-black/20 group hover:border-[var(--color-accent)]/30 transition-colors animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="p-8 pb-6 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[1rem] bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <ZapIcon />
                </div>
                <div>
                  <h3 className="text-xl font-space-grotesk font-bold text-white tracking-tight">Velocity</h3>
                  <div className="text-sm text-white/50 mt-0.5">Viral Momentum</div>
                </div>
              </div>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-2">
                Rewards rapid engagement relative to the post&apos;s age. Content that blows up quickly receives an exponential algorithmic boost.
              </p>
              <AnimatedBar mounted={mounted} percentage={breakdown.calculation.velocityFactor * 100} gradientClass="bg-gradient-to-r from-orange-600 to-amber-400" />
            </div>
            <div className="p-3 lg:p-4 flex-1">
               <TerminalMathBlock 
                 colorClass="text-orange-400"
                 weight={w.components.velocity}
                 finalPoints={breakdown.weighted.velocity}
                 normalizedValue={breakdown.calculation.velocityFactor * 100}
                 rows={[
                   { label: `Raw Eng. Points`, value: breakdown.calculation.weightedEngagement.toFixed(1) },
                   { label: `Time Window`, value: `${breakdown.postAgeHours.toFixed(1)} hrs` },
                   { label: `Points / Hour`, value: (breakdown.calculation.weightedEngagement / breakdown.postAgeHours).toFixed(2) },
                 ]}
               />
            </div>
          </div>

          {/* 5. Authority */}
          <div className="glass rounded-3xl border border-white/10 flex flex-col p-1.5 noise-overlay bg-black/20 group hover:border-[var(--color-accent)]/30 transition-colors animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <div className="p-8 pb-6 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[1rem] bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <CrownIcon />
                </div>
                <div>
                  <h3 className="text-xl font-space-grotesk font-bold text-white tracking-tight">Authority</h3>
                  <div className="text-sm text-white/50 mt-0.5">Established Floor</div>
                </div>
              </div>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-2">
                Recognizes established accounts with followings, providing a reliable baseline visibility floor for quality creators.
              </p>
              <AnimatedBar mounted={mounted} percentage={breakdown.calculation.authorityFactor * 100} gradientClass="bg-gradient-to-r from-amber-600 to-yellow-400" />
            </div>
            <div className="p-3 lg:p-4 flex-1">
               <TerminalMathBlock 
                 colorClass="text-amber-400"
                 weight={w.components.authority}
                 finalPoints={breakdown.weighted.authority}
                 normalizedValue={breakdown.calculation.authorityFactor * 100}
                 rows={[
                   { label: `Current Followers`, value: followerCount.toLocaleString() },
                   { label: `Factor Ceiling`, value: w.authority.scale.toLocaleString() },
                   { label: `Progress`, value: `${((followerCount / w.authority.scale) * 100).toFixed(1)}%` },
                 ]}
               />
            </div>
          </div>

          {/* 6. Penalties (If Applicable) */}
          {breakdown.penalties > 0 && (
            <div className="lg:col-span-2 glass rounded-3xl border border-red-500/30 flex flex-col p-8 noise-overlay bg-red-500/5 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[1rem] bg-red-500/20 text-red-400 flex items-center justify-center">
                  <ShieldAlertIcon />
                </div>
                <div>
                  <h3 className="text-xl font-space-grotesk font-bold text-white tracking-tight">Algorithmic Penalties</h3>
                  <div className="text-sm text-red-300/70 mt-0.5">Score Reductions Applied</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breakdown.penaltyReasons.map((reason, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-[rgba(12,16,23,0.72)] p-5 font-mono text-sm">
                    <span className="text-white/70">{reason}</span>
                    <span className="text-red-400 font-bold tracking-wider">DETECTED</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="inline-flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 font-mono">
                  <span className="text-red-300/70 uppercase text-xs font-bold tracking-widest">Total Reduction</span>
                  <span className="text-2xl text-red-400 font-bold">-{breakdown.penalties.toFixed(1)} pts</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
