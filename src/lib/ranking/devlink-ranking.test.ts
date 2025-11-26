import { describe, expect, it } from "vitest";
import {
  DEFAULT_RANKING_WEIGHTS,
  rankPosts,
  type RankablePost,
} from "./devlink-ranking";

function makePost(overrides: Partial<RankablePost> = {}): RankablePost {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    content: overrides.content ?? "Hello world",
    userId: overrides.userId ?? "user-1",
    userCreatedAt: overrides.userCreatedAt ?? new Date().toISOString(),
    followerCount: overrides.followerCount ?? 10,
    metrics: {
      likes: overrides.metrics?.likes ?? 1,
      replies: overrides.metrics?.replies ?? 0,
      reposts: overrides.metrics?.reposts ?? 0,
      saves: overrides.metrics?.saves ?? 0,
      uniqueEngagers: overrides.metrics?.uniqueEngagers,
    },
    ...overrides,
  };
}

describe("rankPosts", () => {
  it("falls back to total engagement ratio when followers are zero", () => {
    const post = makePost({
      followerCount: 0,
      metrics: { likes: 5, replies: 5, reposts: 0, saves: 0 },
    });
    const result = rankPosts([post], { now: new Date() });
    const breakdown = result.breakdownById[post.id];
    expect(breakdown.metrics.engagementToFollowerRatio).toBe(10);
  });

  it("applies duplicate penalty scaling", () => {
    const original = makePost({ content: "same content" });
    const duplicate = makePost({ content: "same content" });
    const result = rankPosts([original, duplicate], { now: new Date() });
    expect(
      result.breakdownById[original.id].metrics.duplicateContentScore
    ).toBeCloseTo(0.25, 2);
    expect(
      result.breakdownById[duplicate.id].metrics.duplicateContentScore
    ).toBeCloseTo(0.25, 2);
  });

  it("switches to evergreen time decay after transition hours", () => {
    const now = new Date();
    const freshPost = makePost({
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    });
    const oldPost = makePost({
      id: "old",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
    });
    const result = rankPosts([freshPost, oldPost], { now });
    const freshMultiplier =
      result.breakdownById[freshPost.id].timeDecayMultiplier;
    const oldMultiplier = result.breakdownById[oldPost.id].timeDecayMultiplier;
    expect(freshMultiplier).toBeGreaterThan(oldMultiplier);
    expect(oldMultiplier).toBeGreaterThanOrEqual(
      DEFAULT_RANKING_WEIGHTS.timeDecay.minimumMultiplier
    );
  });

  it("respects weight overrides", () => {
    const post = makePost({
      metrics: { likes: 1, replies: 0, reposts: 0, saves: 0 },
    });
    const result = rankPosts([post], {
      now: new Date(),
      weights: { engagement: { like: 10 } },
    });
    expect(result.breakdownById[post.id].baseEngagementScore).toBe(10);
  });
});

