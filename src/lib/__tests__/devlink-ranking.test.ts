import { describe, it, expect } from "vitest";
import {
  rankPosts,
  DEFAULT_RANKING_WEIGHTS,
  RankablePost,
  RankingWeights,
} from "../ranking/devlink-ranking";

function buildPost(
  overrides: Partial<RankablePost> & { id: string; userId: string }
): RankablePost {
  return {
    id: overrides.id,
    userId: overrides.userId,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    content: overrides.content ?? "Update in progress",
    userCreatedAt: overrides.userCreatedAt ?? new Date().toISOString(),
    followerCount: overrides.followerCount ?? 0,
    metrics: {
      likes: overrides.metrics?.likes ?? 0,
      replies: overrides.metrics?.replies ?? 0,
      reposts: overrides.metrics?.reposts ?? 0,
      saves: overrides.metrics?.saves ?? 0,
      uniqueEngagers: overrides.metrics?.uniqueEngagers,
    },
    engagementRatioOverride: overrides.engagementRatioOverride,
    recentDuplicateScore: overrides.recentDuplicateScore,
  };
}

const mockWeights: RankingWeights = {
  ...DEFAULT_RANKING_WEIGHTS,
};

describe("DevLink ranking", () => {
  it("boosts new developers with low follower counts", () => {
    const now = new Date("2025-01-01T12:00:00Z");

    const establishedPost = buildPost({
      id: "established",
      userId: "u1",
      createdAt: new Date("2025-01-01T06:00:00Z"),
      userCreatedAt: new Date("2024-01-01T00:00:00Z"),
      followerCount: 8000,
      metrics: { likes: 50, replies: 12, saves: 20, reposts: 8 },
    });

    const newcomerPost = buildPost({
      id: "newbie",
      userId: "u2",
      createdAt: new Date("2025-01-01T08:00:00Z"),
      userCreatedAt: new Date("2025-01-01T00:00:00Z"),
      followerCount: 120,
      metrics: { likes: 25, replies: 8, saves: 10, reposts: 5 },
    });

    const result = rankPosts([establishedPost, newcomerPost], { now, weights: mockWeights });

    const newbieScore = result.breakdownById["newbie"].finalScore;
    const establishedScore = result.breakdownById["established"].finalScore;

    expect(newbieScore).toBeGreaterThan(
      establishedScore,
      "New developer should outrank established account with comparable engagement"
    );
  });

  it("applies time decay so older posts fall behind newer ones", () => {
    const now = new Date("2025-02-01T12:00:00Z");

    const freshPost = buildPost({
      id: "fresh",
      userId: "u1",
      createdAt: new Date("2025-02-01T10:00:00Z"),
      userCreatedAt: new Date("2024-03-01T00:00:00Z"),
      followerCount: 1000,
      metrics: { likes: 10, replies: 4, reposts: 3, saves: 5 },
    });

    const stalePost = buildPost({
      id: "stale",
      userId: "u2",
      createdAt: new Date("2025-01-30T10:00:00Z"),
      userCreatedAt: new Date("2024-03-01T00:00:00Z"),
      followerCount: 1000,
      metrics: { likes: 40, replies: 10, reposts: 6, saves: 8 },
    });

    const result = rankPosts([stalePost, freshPost], { now, weights: mockWeights });

    const [topId] = result.orderedPostIds;
    expect(topId).toBe("fresh");
  });

  it("penalizes potential spam when engagement ratios remain low", () => {
    const now = new Date("2025-03-10T15:00:00Z");

    const organicPost = buildPost({
      id: "organic",
      userId: "u1",
      createdAt: new Date("2025-03-10T14:00:00Z"),
      userCreatedAt: new Date("2024-01-01T00:00:00Z"),
      followerCount: 900,
      metrics: { likes: 25, replies: 6, reposts: 3, saves: 4 },
      content: "Weekly progress update: new lighting system online!",
    });

    const spammyPost = buildPost({
      id: "spam",
      userId: "u2",
      createdAt: new Date("2025-03-10T14:30:00Z"),
      userCreatedAt: new Date("2024-01-01T00:00:00Z"),
      followerCount: 5000,
      metrics: { likes: 5, replies: 1, reposts: 0, saves: 0 },
      content: "Check out my commission slot!!!",
    });

    const almostDuplicate = buildPost({
      id: "spam-duplicate",
      userId: "u2",
      createdAt: new Date("2025-03-10T14:45:00Z"),
      userCreatedAt: new Date("2024-01-01T00:00:00Z"),
      followerCount: 5000,
      metrics: { likes: 4, replies: 0, reposts: 0, saves: 0 },
      content: "Check out my commission slot!!!", // identical content
    });

    const result = rankPosts([almostDuplicate, spammyPost, organicPost], {
      now,
      weights: mockWeights,
    });

    const spamPenalty = result.breakdownById["spam"].spamPenalty;
    const duplicatePenalty = result.breakdownById["spam-duplicate"].spamPenalty;
    const organicPenalty = result.breakdownById["organic"].spamPenalty;

    expect(spamPenalty).toBeGreaterThan(
      organicPenalty,
      "Low engagement should increase spam penalty"
    );
    expect(duplicatePenalty).toBeGreaterThanOrEqual(
      spamPenalty,
      "Identical content should accumulate additional repeat penalty"
    );
  });
});

