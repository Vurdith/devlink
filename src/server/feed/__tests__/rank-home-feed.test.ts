import { describe, expect, it, vi } from "vitest";

import { rankHomeFeedPosts } from "../rank-home-feed";
import type { FeedPostForRanking } from "@/lib/ranking/ranking-transforms";

vi.mock("@/server/services/hotpath-client", () => ({
  rankFeedWithRust: vi.fn(async () => null),
}));

function buildFeedCandidate(overrides: Partial<FeedPostForRanking> & { id: string; userId: string }): FeedPostForRanking & { id: string; userId: string } {
  return {
    id: overrides.id,
    userId: overrides.userId,
    content: overrides.content ?? "A useful build update with enough detail",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    user: overrides.user ?? {
      id: overrides.userId,
      createdAt: new Date("2025-01-01T10:00:00Z"),
      _count: { followers: 1000 },
    },
    _count: {
      likes: overrides._count?.likes ?? 0,
      replies: overrides._count?.replies ?? 0,
      reposts: overrides._count?.reposts ?? 0,
      savedBy: overrides._count?.savedBy ?? 0,
    },
  };
}

describe("rankHomeFeedPosts", () => {
  it("boosts followed authors enough to personalize close-ranking feed items", async () => {
    const followed = buildFeedCandidate({
      id: "followed-author",
      userId: "u-followed",
      createdAt: new Date("2026-01-01T09:45:00Z"),
      _count: { likes: 1, replies: 0, reposts: 0, savedBy: 0 },
    });
    const stranger = buildFeedCandidate({
      id: "stranger-author",
      userId: "u-stranger",
      createdAt: new Date("2026-01-01T09:45:00Z"),
      _count: { likes: 2, replies: 0, reposts: 0, savedBy: 0 },
    });

    const [topPost] = await rankHomeFeedPosts([stranger, followed], {
      followedAuthorIds: new Set(["u-followed"]),
    });

    expect(topPost.id).toBe("followed-author");
  });

  it("boosts posts matching the viewer's skill interests", async () => {
    const skillMatch = buildFeedCandidate({
      id: "skill-match",
      userId: "u-skill",
      content: "Sharing a UI design pass for a Roblox inventory and mobile shop flow.",
      createdAt: new Date("2026-01-01T09:45:00Z"),
      _count: { likes: 1, replies: 0, reposts: 0, savedBy: 0 },
    });
    const generic = buildFeedCandidate({
      id: "generic",
      userId: "u-generic",
      content: "General launch update from the team.",
      createdAt: new Date("2026-01-01T09:45:00Z"),
      _count: { likes: 2, replies: 0, reposts: 0, savedBy: 0 },
    });

    const [topPost] = await rankHomeFeedPosts([generic, skillMatch], {
      viewerInterestTerms: ["UI Design"],
    });

    expect(topPost.id).toBe("skill-match");
  });
});
