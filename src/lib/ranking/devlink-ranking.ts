/**
 * DevLink Post Ranking Algorithm v3 - SIMPLIFIED
 * 
 * Final Score = (Engagement + Freshness + Discovery) - Penalties
 * 
 * Each component is 0-100 scale for easy understanding.
 */

import { differenceInHours, differenceInDays } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export interface RankablePost {
  id: string;
  createdAt: Date | string;
  content: string;
  userId: string;
  userCreatedAt: Date | string;
  followerCount: number;
  viewCount?: number;
  metrics: {
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
    uniqueEngagers?: number;
  };
  engagementRatioOverride?: number;
  recentDuplicateScore?: number;
}

export interface RankingWeights {
  engagement: {
    like: number;
    reply: number;
    repost: number;
    save: number;
  };
  // How much each component contributes (out of 100)
  engagementWeight: number;
  freshnessWeight: number;
  discoveryWeight: number;
  // Thresholds
  newCreatorFollowerThreshold: number;
  newCreatorAgeDays: number;
  maxDiscoveryBoost: number;
  // Time decay
  freshnessPeakHours: number;
  freshnessHalfLifeHours: number;
  freshnessMinimum: number;
  // Penalties
  duplicatePenaltyMax: number;
  shortContentPenalty: number;
  minContentLength: number;
  // Legacy compatibility
  engagementRatio: number;
  newDeveloper: {
    followerThreshold: number;
    accountAgeDaysThreshold: number;
    maxBoost: number;
  };
  timeDecay: {
    freshHalfLifeHours: number;
    evergreenHalfLifeHours: number;
    transitionHours: number;
    minimumMultiplier: number;
  };
  spamPenalty: {
    lowEngagementRatioThreshold: number;
    lowEngagementPenalty: number;
    duplicateContentPenalty: number;
    maxPenalty: number;
  };
  baseScoreFloor: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  // Engagement multipliers
  engagement: {
    like: 1,
    reply: 3,    // Replies = high quality
    repost: 2,   // Shares = good reach
    save: 2,     // Saves = lasting value
  },
  // Component weights (total = 100)
  engagementWeight: 50,   // 50% from engagement
  freshnessWeight: 30,    // 30% from recency
  discoveryWeight: 20,    // 20% for new creators
  // New creator thresholds
  newCreatorFollowerThreshold: 300,
  newCreatorAgeDays: 45,
  maxDiscoveryBoost: 25,
  // Freshness config
  freshnessPeakHours: 6,      // Full freshness for 6 hours
  freshnessHalfLifeHours: 24, // Half score after 24 hours
  freshnessMinimum: 0.2,      // Never below 20%
  // Penalties
  duplicatePenaltyMax: 20,
  shortContentPenalty: 10,
  minContentLength: 15,
  // Legacy compatibility (for old components)
  engagementRatio: 5,
  newDeveloper: {
    followerThreshold: 300,
    accountAgeDaysThreshold: 45,
    maxBoost: 25,
  },
  timeDecay: {
    freshHalfLifeHours: 24,
    evergreenHalfLifeHours: 48,
    transitionHours: 24,
    minimumMultiplier: 0.2,
  },
  spamPenalty: {
    lowEngagementRatioThreshold: 0.005,
    lowEngagementPenalty: 5,
    duplicateContentPenalty: 10,
    maxPenalty: 20,
  },
  baseScoreFloor: 0,
};

export interface RankingBreakdown {
  // NEW: Clear component scores (0-100)
  engagementScore: number;      // How much engagement (0-100)
  freshnessScore: number;       // How fresh (0-100)
  discoveryBoost: number;       // New creator bonus (0-25)
  penalties: number;            // Total penalties
  finalScore: number;           // The actual ranking score
  
  // Calculation details for transparency
  calculation: {
    rawEngagement: number;      // likes + replies*3 + reposts*2 + saves*2
    engagementCapped: number;   // Capped at 100
    postAgeHours: number;
    freshnessMultiplier: number;
    isNewCreator: boolean;
    duplicateScore: number;
    contentLength: number;
  };
  
  // Legacy fields (for backward compatibility)
  baseEngagementScore: number;
  engagementRatioScore: number;
  newDeveloperBoost: number;
  timeDecayMultiplier: number;
  decayedCoreScore: number;
  spamPenalty: number;
  qualityScore: number;
  velocityScore: number;
  authorityScore: number;
  
  metrics: {
    totalEngagement: number;
    weightedEngagement: number;
    engagementToFollowerRatio: number;
    engagementToViewRatio: number;
    followerCount: number;
    viewCount: number;
    accountAgeDays: number;
    postAgeHours: number;
    duplicateContentScore: number;
    lowEngagementFlag: boolean;
    contentLength: number;
  };
  moderationNotes: string[];
}

export interface RankPostsOptions {
  weights?: Partial<RankingWeights>;
  now?: Date;
}

export interface RankedPost<T extends RankablePost> {
  post: T;
  score: number;
  breakdown: RankingBreakdown;
}

export interface RankPostsResult<T extends RankablePost> {
  orderedPostIds: string[];
  ranked: RankedPost<T>[];
  breakdownById: Record<string, RankingBreakdown>;
}

// ============================================================================
// Main Function
// ============================================================================

export function rankPosts<T extends RankablePost>(
  posts: T[],
  options: RankPostsOptions = {}
): RankPostsResult<T> {
  const now = options.now ?? new Date();
  const weights = { ...DEFAULT_RANKING_WEIGHTS, ...options.weights };
  const duplicateMap = buildDuplicateMap(posts);

  const ranked = posts.map((post) => {
    const breakdown = scorePost(post, now, weights, duplicateMap);
    return { post, score: breakdown.finalScore, breakdown };
  });

  ranked.sort((a, b) => b.score - a.score);

  return {
    orderedPostIds: ranked.map((r) => r.post.id),
    ranked,
    breakdownById: Object.fromEntries(ranked.map((r) => [r.post.id, r.breakdown])),
  };
}

// ============================================================================
// Scoring - SIMPLE AND CLEAR
// ============================================================================

function scorePost(
  post: RankablePost,
  now: Date,
  weights: RankingWeights,
  duplicateMap: Map<string, number>
): RankingBreakdown {
  // 1. EXTRACT DATA
  const likes = Math.max(0, post.metrics.likes || 0);
  const replies = Math.max(0, post.metrics.replies || 0);
  const reposts = Math.max(0, post.metrics.reposts || 0);
  const saves = Math.max(0, post.metrics.saves || 0);
  const followerCount = Math.max(0, post.followerCount || 0);
  const viewCount = Math.max(0, post.viewCount || 0);
  const contentLength = (post.content || "").trim().length;
  
  const postAgeHours = Math.max(0, differenceInHours(now, new Date(post.createdAt)));
  const accountAgeDays = Math.max(0, differenceInDays(now, new Date(post.userCreatedAt)));

  // 2. ENGAGEMENT SCORE (0-100)
  // Raw = weighted sum of interactions
  const rawEngagement = 
    likes * weights.engagement.like +
    replies * weights.engagement.reply +
    reposts * weights.engagement.repost +
    saves * weights.engagement.save;
  
  // Cap at 100 (10 weighted engagements = 100, scales logarithmically after)
  const engagementCapped = Math.min(100, rawEngagement * 10);
  const engagementScore = engagementCapped;

  // 3. FRESHNESS SCORE (0-100)
  let freshnessMultiplier = 1;
  if (postAgeHours > weights.freshnessPeakHours) {
    const hoursAfterPeak = postAgeHours - weights.freshnessPeakHours;
    freshnessMultiplier = Math.pow(0.5, hoursAfterPeak / weights.freshnessHalfLifeHours);
    freshnessMultiplier = Math.max(weights.freshnessMinimum, freshnessMultiplier);
  }
  const freshnessScore = freshnessMultiplier * 100;

  // 4. DISCOVERY BOOST (0-maxBoost for new creators)
  let discoveryBoost = 0;
  const isNewCreator = 
    followerCount < weights.newCreatorFollowerThreshold || 
    accountAgeDays < weights.newCreatorAgeDays;
  
  if (isNewCreator) {
    // More boost for fewer followers/newer accounts
    const followerFactor = 1 - (followerCount / weights.newCreatorFollowerThreshold);
    const ageFactor = 1 - (accountAgeDays / weights.newCreatorAgeDays);
    const boostFactor = Math.max(0, Math.max(followerFactor, ageFactor));
    discoveryBoost = boostFactor * weights.maxDiscoveryBoost;
  }

  // 5. PENALTIES
  let penalties = 0;
  const moderationNotes: string[] = [];
  
  // Duplicate content check
  const normalizedContent = (post.content || "").trim().toLowerCase().slice(0, 200);
  const duplicateScore = post.recentDuplicateScore ?? duplicateMap.get(normalizedContent) ?? 0;
  if (duplicateScore > 0.2) {
    penalties += duplicateScore * weights.duplicatePenaltyMax;
    moderationNotes.push(duplicateScore > 0.6 ? "duplicate_high" : "duplicate_medium");
  }
  
  // Short content penalty
  if (contentLength > 0 && contentLength < weights.minContentLength) {
    penalties += weights.shortContentPenalty;
    moderationNotes.push("short_content");
  }

  // 6. FINAL SCORE CALCULATION
  // Formula: (engagement * weight) + (freshness * weight) + discovery - penalties
  const weightedEngagement = (engagementScore * weights.engagementWeight) / 100;
  const weightedFreshness = (freshnessScore * weights.freshnessWeight) / 100;
  
  const rawScore = weightedEngagement + weightedFreshness + discoveryBoost - penalties;
  const finalScore = Math.max(weights.baseScoreFloor, rawScore);

  // Legacy fields
  const totalEngagement = likes + replies + reposts + saves;
  const engagementToFollowerRatio = followerCount > 0 ? totalEngagement / followerCount : 0;
  const engagementToViewRatio = viewCount > 0 ? totalEngagement / viewCount : 0;

  return {
    // New clear breakdown
    engagementScore,
    freshnessScore,
    discoveryBoost,
    penalties,
    finalScore,
    
    calculation: {
      rawEngagement,
      engagementCapped,
      postAgeHours,
      freshnessMultiplier,
      isNewCreator,
      duplicateScore,
      contentLength,
    },
    
    // Legacy compatibility
    baseEngagementScore: rawEngagement,
    engagementRatioScore: engagementScore * 0.5,
    newDeveloperBoost: discoveryBoost,
    timeDecayMultiplier: freshnessMultiplier,
    decayedCoreScore: rawEngagement * freshnessMultiplier,
    spamPenalty: penalties,
    qualityScore: engagementScore,
    velocityScore: Math.min(100, rawEngagement * 5),
    authorityScore: Math.min(100, Math.log10(followerCount + 1) * 25),
    
    metrics: {
      totalEngagement,
      weightedEngagement: rawEngagement,
      engagementToFollowerRatio,
      engagementToViewRatio,
      followerCount,
      viewCount,
      accountAgeDays,
      postAgeHours,
      duplicateContentScore: duplicateScore,
      lowEngagementFlag: viewCount > 10 && engagementToViewRatio < 0.01,
      contentLength,
    },
    moderationNotes,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function buildDuplicateMap(posts: RankablePost[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  for (const post of posts) {
    const key = (post.content || "").trim().toLowerCase().slice(0, 200);
    if (key.length > 10) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const scores = new Map<string, number>();
  for (const [key, count] of counts) {
    if (count > 1) {
      // 2 copies = 0.33, 3 = 0.66, 4+ = 1.0
      scores.set(key, Math.min(1, (count - 1) / 3));
    }
  }
  
  return scores;
}
