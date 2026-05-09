import type { TabPost, TabType } from "./profile-types";

export const PROFILE_POST_TABS = [
  "posts",
  "replies",
  "reposts",
  "liked",
  "saved",
] as const satisfies readonly TabType[];

export type ProfilePostTab = (typeof PROFILE_POST_TABS)[number];

const ENGAGEMENT_PROFILE_TABS = [
  "liked",
  "reposts",
  "saved",
] as const satisfies readonly ProfilePostTab[];

export function isProfilePostTab(tab: TabType): tab is ProfilePostTab {
  return PROFILE_POST_TABS.includes(tab as ProfilePostTab);
}

export function isEngagementProfileTab(tab: TabType): tab is (typeof ENGAGEMENT_PROFILE_TABS)[number] {
  return ENGAGEMENT_PROFILE_TABS.includes(tab as (typeof ENGAGEMENT_PROFILE_TABS)[number]);
}

export function getProfileTabCacheKey(userId: string, tab: ProfilePostTab, page: number) {
  return `${userId}:${tab}:${page}`;
}

export function buildProfileTabRequest({
  tab,
  userId,
  page,
  limit,
}: {
  tab: ProfilePostTab;
  userId: string;
  page: number;
  limit: number;
}) {
  const params = new URLSearchParams();
  const skip = (page - 1) * limit;

  switch (tab) {
    case "posts":
      params.set("userId", userId);
      params.set("limit", limit.toString());
      params.set("skip", skip.toString());
      return `/api/posts?${params.toString()}`;
    case "replies":
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      return `/api/users/${userId}/replies?${params.toString()}`;
    case "reposts":
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      return `/api/users/${userId}/reposts?${params.toString()}`;
    case "liked":
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      return `/api/users/${userId}/liked?${params.toString()}`;
    case "saved":
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      return `/api/posts/save?${params.toString()}`;
  }
}

export function readProfileTabPosts(tab: ProfilePostTab, data: unknown): TabPost[] {
  if (tab === "saved" && isSavedPostsResponse(data)) {
    return data.savedPosts.map((saved) => saved.post);
  }

  if (isPostsResponse(data)) {
    return data.posts;
  }

  return Array.isArray(data) ? (data as TabPost[]) : [];
}

function isPostsResponse(data: unknown): data is { posts: TabPost[] } {
  return Boolean(
    data &&
      typeof data === "object" &&
      "posts" in data &&
      Array.isArray((data as { posts?: unknown }).posts)
  );
}

function isSavedPostsResponse(data: unknown): data is { savedPosts: Array<{ post: TabPost }> } {
  return Boolean(
    data &&
      typeof data === "object" &&
      "savedPosts" in data &&
      Array.isArray((data as { savedPosts?: unknown }).savedPosts)
  );
}
