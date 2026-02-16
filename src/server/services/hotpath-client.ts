type RankFeedRequest = {
  postIds: string[];
};

type RankFeedResponse = {
  orderedPostIds: string[];
};

const HOTPATH_BASE_URL = process.env.RUST_HOTPATH_SERVICE_URL;

export async function rankFeedWithRust(input: RankFeedRequest): Promise<RankFeedResponse | null> {
  if (!HOTPATH_BASE_URL || process.env.USE_RUST_FEED_RANKER !== "true") {
    return null;
  }

  try {
    const response = await fetch(`${HOTPATH_BASE_URL}/rank-feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_ids: input.postIds }),
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
  if (!HOTPATH_BASE_URL || process.env.USE_RUST_NOTIFICATION_FANOUT !== "true") {
    return false;
  }

  try {
    const response = await fetch(`${HOTPATH_BASE_URL}/fanout-notification`, {
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
  if (!HOTPATH_BASE_URL || process.env.USE_RUST_SEARCH_INDEXER !== "true") {
    return false;
  }

  try {
    const response = await fetch(`${HOTPATH_BASE_URL}/index-search`, {
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
  if (!HOTPATH_BASE_URL || process.env.USE_RUST_MEDIA_PIPELINE !== "true") {
    return false;
  }

  try {
    const response = await fetch(`${HOTPATH_BASE_URL}/process-media`, {
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
  if (!HOTPATH_BASE_URL || process.env.USE_RUST_RATE_LIMITER !== "true") {
    return null;
  }

  try {
    const response = await fetch(`${HOTPATH_BASE_URL}/rate-limit`, {
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
