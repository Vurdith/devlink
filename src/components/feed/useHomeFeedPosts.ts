"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeedPost } from "@/types/post";
import { withPostCount } from "./post-engagement-utils";

const ENGAGEMENT_EVENT_NAME = "postEngagementUpdate";
const ENGAGEMENT_HYDRATION_DELAY_MS = 250;
const ENGAGEMENT_HYDRATION_IDLE_TIMEOUT_MS = 1200;
const LOCAL_UPDATE_SYNC_GRACE_MS = 2000;

type EngagementHydration = Record<
  string,
  {
    isLiked?: boolean;
    isReposted?: boolean;
    isSaved?: boolean;
  }
>;

interface EngagementEventDetail {
  post?: { id?: unknown };
  action?: unknown;
  liked?: unknown;
  likeCount?: unknown;
  reposted?: unknown;
  repostCount?: unknown;
  saved?: unknown;
}

interface UseHomeFeedPostsOptions {
  initialPosts: FeedPost[];
  userId?: string;
}

function hasBooleanValue(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function readEngagementDetail(event: Event): EngagementEventDetail | null {
  if (!(event instanceof CustomEvent) || typeof event.detail !== "object" || event.detail === null) {
    return null;
  }

  return event.detail as EngagementEventDetail;
}

function applyEngagementHydration(posts: FeedPost[], engagement: EngagementHydration) {
  return posts.map((post) => {
    const postEngagement = engagement[post.id];
    if (!postEngagement) return post;

    return {
      ...post,
      isLiked: postEngagement.isLiked,
      isReposted: postEngagement.isReposted,
      isSaved: postEngagement.isSaved,
    };
  });
}

function applyEngagementEvent(post: FeedPost, detail: EngagementEventDetail) {
  const updates: Partial<FeedPost> = {};

  if (detail.action === "like" && hasBooleanValue(detail.liked)) {
    updates.isLiked = detail.liked;
  }
  if (detail.action === "repost" && hasBooleanValue(detail.reposted)) {
    updates.isReposted = detail.reposted;
  }
  if (detail.action === "save" && hasBooleanValue(detail.saved)) {
    updates.isSaved = detail.saved;
  }

  const updatedPost = { ...post, ...updates };

  if (detail.action === "like" && typeof detail.likeCount === "number") {
    return withPostCount(updatedPost, "likes", detail.likeCount);
  }
  if (detail.action === "repost" && typeof detail.repostCount === "number") {
    return withPostCount(updatedPost, "reposts", detail.repostCount);
  }

  return updatedPost;
}

async function fetchHomeFeedEngagement(postIds: string[], signal: AbortSignal) {
  const response = await fetch("/api/posts/engagement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postIds }),
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { engagement?: EngagementHydration };
  return body.engagement ?? null;
}

export function useHomeFeedPosts({ initialPosts, userId }: UseHomeFeedPostsOptions) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(initialPosts);
  const [engagementFetched, setEngagementFetched] = useState(false);
  const lastLocalUpdateRef = useRef(0);

  const postIds = useMemo(() => feedPosts.map((post) => post.id), [feedPosts]);
  const postIdsKey = postIds.join(":");

  const markLocalUpdate = useCallback(() => {
    lastLocalUpdateRef.current = Date.now();
  }, []);

  useEffect(() => {
    const timeSinceLastUpdate = Date.now() - lastLocalUpdateRef.current;
    if (timeSinceLastUpdate <= LOCAL_UPDATE_SYNC_GRACE_MS) {
      return;
    }

    setFeedPosts(initialPosts);
    setEngagementFetched(false);
  }, [initialPosts]);

  useEffect(() => {
    if (!userId || engagementFetched || postIds.length === 0) return;

    const controller = new AbortController();
    const hydrateEngagement = async () => {
      try {
        const engagement = await fetchHomeFeedEngagement(postIds, controller.signal);
        if (!engagement) return;

        setFeedPosts((prevPosts) => applyEngagementHydration(prevPosts, engagement));
        setEngagementFetched(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch engagement:", error);
        }
      }
    };

    const scheduleIdle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : undefined;

    if (scheduleIdle) {
      const idleId = scheduleIdle(hydrateEngagement, {
        timeout: ENGAGEMENT_HYDRATION_IDLE_TIMEOUT_MS,
      });

      return () => {
        controller.abort();
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(hydrateEngagement, ENGAGEMENT_HYDRATION_DELAY_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [userId, engagementFetched, postIds, postIdsKey]);

  useEffect(() => {
    const handleEngagementUpdate = (event: Event) => {
      const detail = readEngagementDetail(event);
      if (!detail) return;

      const postId = detail?.post?.id;
      if (typeof postId !== "string") return;

      markLocalUpdate();
      setFeedPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? applyEngagementEvent(post, detail) : post))
      );
    };

    window.addEventListener(ENGAGEMENT_EVENT_NAME, handleEngagementUpdate);
    return () => window.removeEventListener(ENGAGEMENT_EVENT_NAME, handleEngagementUpdate);
  }, [markLocalUpdate]);

  const handlePostUpdate = useCallback(
    (updatedPost: FeedPost) => {
      markLocalUpdate();
      setFeedPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
      );
    },
    [markLocalUpdate]
  );

  return {
    feedPosts,
    handlePostUpdate,
  };
}
