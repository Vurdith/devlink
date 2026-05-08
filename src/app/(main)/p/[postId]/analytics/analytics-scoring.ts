export interface AnalyticsEngagement {
  likes: number;
  replies: number;
  reposts: number;
  saves: number;
}

export const DEFAULT_WEIGHTS = {
  engagement: { like: 1, reply: 3, repost: 2.5, save: 2 },
  components: { engagement: 40, freshness: 25, discovery: 15, velocity: 10, authority: 10 },
  freshness: { peakHours: 4, halfLifeHours: 18, minimum: 0.15 },
  discovery: { followerThreshold: 500, ageDays: 60, maxBoost: 20 },
  velocity: { maxBoost: 15 },
  authority: { scale: 1000, maxBoost: 15 },
  penalties: { duplicate: 25, shortContent: 5, minContentLength: 10, lowEngagement: 10 },
};

export function calculateFallbackScore(
  engagement: AnalyticsEngagement,
  followerCount: number,
  viewCount: number,
  contentLength: number,
  postAgeHours: number,
  accountAgeDays: number
) {
  const w = DEFAULT_WEIGHTS;

  const rawEngagement =
    engagement.likes * w.engagement.like +
    engagement.replies * w.engagement.reply +
    engagement.reposts * w.engagement.repost +
    engagement.saves * w.engagement.save;

  const engagementScore = rawEngagement > 0 ? 100 * (1 - Math.exp(-rawEngagement / 20)) : 0;

  const freshnessMultiplier =
    postAgeHours <= w.freshness.peakHours
      ? 1
      : Math.max(w.freshness.minimum, Math.pow(0.5, (postAgeHours - w.freshness.peakHours) / w.freshness.halfLifeHours));
  const freshnessScore = freshnessMultiplier * 100;

  const isNewCreator = followerCount < w.discovery.followerThreshold || accountAgeDays < w.discovery.ageDays;
  const discoveryFactor = isNewCreator
    ? Math.max(1 - followerCount / w.discovery.followerThreshold, 1 - accountAgeDays / w.discovery.ageDays, 0)
    : 0;
  const discoveryScore = discoveryFactor * 100;

  const velocityFactor = postAgeHours > 0 && rawEngagement > 0 ? Math.min(1, 1 - Math.exp(-rawEngagement / postAgeHours)) : 0;
  const velocityScore = velocityFactor * 100;

  const authorityFactor = Math.min(1, followerCount / w.authority.scale);
  const authorityScore = authorityFactor * 100;

  const totalEngagement = engagement.likes + engagement.replies + engagement.reposts + engagement.saves;
  const penaltyReasons: string[] = [];
  let penalties = 0;

  if (contentLength > 0 && contentLength < w.penalties.minContentLength) {
    penalties += w.penalties.shortContent;
    penaltyReasons.push("Short content");
  }

  if (viewCount > 100 && totalEngagement / viewCount < 0.002) {
    penalties += w.penalties.lowEngagement;
    penaltyReasons.push("Low engagement rate");
  }

  const weightedEngagement = (engagementScore * w.components.engagement) / 100;
  const weightedFreshness = (freshnessScore * w.components.freshness) / 100;
  const weightedDiscovery = (discoveryScore * w.components.discovery) / 100;
  const weightedVelocity = (velocityScore * w.components.velocity) / 100;
  const weightedAuthority = (authorityScore * w.components.authority) / 100;

  const finalScore = Math.max(
    0,
    Math.min(100, weightedEngagement + weightedFreshness + weightedDiscovery + weightedVelocity + weightedAuthority - penalties)
  );

  return {
    finalScore,
    engagementScore,
    freshnessScore,
    discoveryScore,
    velocityScore,
    authorityScore,
    penalties,
    penaltyReasons,
    rawEngagement,
    postAgeHours,
    isNewCreator,
    followerCount,
    viewCount,
    totalEngagement,
    engagementRate: viewCount > 0 ? totalEngagement / viewCount : 1,
    calculation: {
      weightedEngagement: rawEngagement,
      engagementNormalized: engagementScore,
      freshnessMultiplier,
      discoveryFactor,
      velocityFactor,
      authorityFactor,
      contentLength,
      duplicateScore: 0,
    },
    weighted: {
      engagement: weightedEngagement,
      freshness: weightedFreshness,
      discovery: weightedDiscovery,
      velocity: weightedVelocity,
      authority: weightedAuthority,
    },
  };
}
