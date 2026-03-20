type RankFeedRequest = {
  candidates: Array<{
    postId: string;
    score: number;
    createdAt?: string;
  }>;
};

type RankFeedResponse = {
  orderedPostIds: string[];
  breakdowns?: Record<string, ScoreBreakdown>;
};

type ScoreBreakdown = {
  final_score: number;
  engagement_score: number;
  freshness_score: number;
  discovery_score: number;
  velocity_score: number;
  authority_score: number;
  penalties: number;
  penalty_reasons: string[];
  raw_engagement: number;
  post_age_hours: number;
  is_new_creator: boolean;
  follower_count: number;
  view_count: number;
  total_engagement: number;
  engagement_rate: number;
  calculation: {
    weighted_engagement: number;
    engagement_normalized: number;
    freshness_multiplier: number;
    discovery_factor: number;
    velocity_factor: number;
    authority_factor: number;
    content_length: number;
    duplicate_score: number;
  };
};

type AnalyticsResponse = {
  post_id: string;
  current_score: number;
  score_breakdown: ScoreBreakdown;
  engagement_velocity: {
    current_rate: number;
    peak_rate: number;
    acceleration: number;
    deceleration_detected: boolean;
    time_to_peak_hours: number | null;
  };
  predicted_metrics: {
    estimated_likes_24h: number;
    estimated_replies_24h: number;
    estimated_reposts_24h: number;
    estimated_views_24h: number;
    confidence: number;
  };
  recommendations: string[];
  comparable_posts: Array<{
    post_id: string;
    score: number;
    similarity: number;
  }>;
};

const HOTPATH_BASE_URL = process.env.RUST_HOTPATH_SERVICE_URL;

function getHotpathBaseUrl(): string | null {
  return HOTPATH_BASE_URL ?? null;
}

export async function rankFeedWithRust(input: RankFeedRequest): Promise<RankFeedResponse | null> {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/rank-feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates: input.candidates.map((candidate) => ({
          post_id: candidate.postId,
          score: candidate.score,
          created_at: candidate.createdAt,
        })),
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { ordered_post_ids?: string[] };
    if (!Array.isArray(data.ordered_post_ids)) return null;
    return { orderedPostIds: data.ordered_post_ids };
  } catch (error) {
    console.error("[HotpathClient] rank-feed failed:", error);
    return null;
  }
}

export async function fanoutNotificationWithRust(input: {
  notificationId?: string;
  recipientId: string;
  actorId: string;
  kind: string;
}) {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return false;

  try {
    const response = await fetch(`${baseUrl}/fanout-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notification_id: input.notificationId,
        recipient_id: input.recipientId,
        actor_id: input.actorId,
        kind: input.kind,
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("[HotpathClient] fanout-notification failed:", error);
    return false;
  }
}

export async function indexSearchDocumentWithRust(input: {
  entity: "post" | "user" | "portfolio";
  entityId: string;
}) {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return false;

  try {
    const response = await fetch(`${baseUrl}/index-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: input.entity,
        entity_id: input.entityId,
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("[HotpathClient] index-search failed:", error);
    return false;
  }
}

export async function processMediaWithRust(input: {
  mediaId: string;
  mediaType: "image" | "video";
  url: string;
}) {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return false;

  try {
    const response = await fetch(`${baseUrl}/process-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_id: input.mediaId,
        media_type: input.mediaType,
        url: input.url,
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("[HotpathClient] process-media failed:", error);
    return false;
  }
}

export async function checkRateLimitWithRust(input: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ success: boolean; limit: number; remaining: number } | null> {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/rate-limit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: input.key,
        limit: input.limit,
        window_seconds: input.windowSeconds,
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      success?: boolean;
      limit?: number;
      remaining?: number;
    };
    if (
      typeof data.success !== "boolean" ||
      typeof data.limit !== "number" ||
      typeof data.remaining !== "number"
    ) {
      return null;
    }
    return {
      success: data.success,
      limit: data.limit,
      remaining: data.remaining,
    };
  } catch (error) {
    console.error("[HotpathClient] rate-limit failed:", error);
    return null;
  }
}

export async function computeAnalyticsWithRust(input: {
  postId: string;
  createdAt?: string;
  userId: string;
  userCreatedAt?: string;
  followerCount?: number;
  viewCount?: number;
  content?: string;
  metrics?: {
    likes?: number;
    replies?: number;
    reposts?: number;
    saves?: number;
    uniqueEngagers?: number;
  };
  historicalEngagement?: Array<{
    timestamp: string;
    likes: number;
    replies: number;
    reposts: number;
    saves: number;
    views: number;
  }>;
}): Promise<AnalyticsResponse | null> {
  const baseUrl = getHotpathBaseUrl();
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: input.postId,
        created_at: input.createdAt,
        user_id: input.userId,
        user_created_at: input.userCreatedAt,
        follower_count: input.followerCount,
        view_count: input.viewCount,
        content: input.content,
        metrics: input.metrics ? {
          likes: input.metrics.likes,
          replies: input.metrics.replies,
          reposts: input.metrics.reposts,
          saves: input.metrics.saves,
          unique_engagers: input.metrics.uniqueEngagers,
        } : undefined,
        historical_engagement: input.historicalEngagement?.map(h => ({
          timestamp: h.timestamp,
          likes: h.likes,
          replies: h.replies,
          reposts: h.reposts,
          saves: h.saves,
          views: h.views,
        })),
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json() as AnalyticsResponse;
    return data;
  } catch (error) {
    console.error("[HotpathClient] analytics failed:", error);
    return null;
  }
}

export type { ScoreBreakdown, AnalyticsResponse };
