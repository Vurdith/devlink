import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db-read", () => ({
  prismaRead: {},
}));

import { rankSuggestedFollowCandidates } from "../suggested-users";

type SuggestedCandidate = Parameters<typeof rankSuggestedFollowCandidates>[0]["candidates"][number];

function candidate(overrides: Partial<SuggestedCandidate> & { id: string; username: string }): SuggestedCandidate {
  return {
    id: overrides.id,
    username: overrides.username,
    name: overrides.name ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    profile: overrides.profile ?? {
      avatarUrl: null,
      profileType: "DEVELOPER",
      verified: false,
      bio: "Builder shipping useful Roblox systems.",
      headline: "Gameplay systems developer",
      availability: "AVAILABLE",
    },
    skills: overrides.skills ?? [],
    posts: overrides.posts ?? [],
    _count: {
      followers: overrides._count?.followers ?? 0,
      following: overrides._count?.following ?? 0,
      posts: overrides._count?.posts ?? 0,
      portfolioItems: overrides._count?.portfolioItems ?? 0,
      reviewsReceived: overrides._count?.reviewsReceived ?? 0,
    },
    mutualFollowCount: overrides.mutualFollowCount ?? 0,
  };
}

describe("rankSuggestedFollowCandidates", () => {
  it("uses mutual follows as a trust signal when direct skill relevance is absent", () => {
    const connected = candidate({
      id: "connected",
      username: "connected-builder",
      mutualFollowCount: 2,
      _count: { followers: 24, following: 10, posts: 4, portfolioItems: 1, reviewsReceived: 0 },
    });
    const popular = candidate({
      id: "popular",
      username: "popular-builder",
      profile: {
        avatarUrl: null,
        profileType: "DEVELOPER",
        verified: true,
        bio: null,
        headline: null,
        availability: null,
      },
      _count: { followers: 9000, following: 120, posts: 2, portfolioItems: 0, reviewsReceived: 0 },
    });

    const ranked = rankSuggestedFollowCandidates({
      candidates: [popular, connected],
      currentSkillIds: new Set(),
      complementaryTypes: new Set(["DEVELOPER"]),
      now: new Date("2026-01-10T10:00:00Z"),
      limit: 2,
    });

    expect(ranked[0].id).toBe("connected");
    expect(ranked[0].reason).toBe("Followed by 2 people you follow");
  });

  it("keeps matching skills as the clearest reason when both signals exist", () => {
    const relevant = candidate({
      id: "relevant",
      username: "lua-builder",
      mutualFollowCount: 3,
      skills: [{ skillId: "lua", isPrimary: true, skill: { name: "Lua", category: "Programming" } }],
    });

    const ranked = rankSuggestedFollowCandidates({
      candidates: [relevant],
      currentSkillIds: new Set(["lua"]),
      complementaryTypes: new Set(["DEVELOPER"]),
      now: new Date("2026-01-10T10:00:00Z"),
      limit: 1,
    });

    expect(ranked[0].reason).toBe("Matches Lua");
    expect(ranked[0].matchingSkills).toEqual(["Lua"]);
  });
});
