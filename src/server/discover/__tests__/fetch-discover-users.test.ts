import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db-read", () => ({
  prismaRead: {},
}));

import { getComplementaryProfileTypes, rankDiscoverCandidates, type DiscoverUser } from "../fetch-discover-users";

type DiscoverCandidate = DiscoverUser & {
  posts?: Array<{ createdAt: Date }>;
};

function candidate(overrides: Partial<DiscoverCandidate> & { id: string; username: string }): DiscoverCandidate {
  return {
    id: overrides.id,
    username: overrides.username,
    name: overrides.name ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    profile: overrides.profile ?? {
      avatarUrl: null,
      bannerUrl: null,
      profileType: "DEVELOPER",
      verified: false,
      bio: "Builder focused on shipping Roblox systems.",
      headline: "Roblox systems developer",
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
  };
}

describe("rankDiscoverCandidates", () => {
  it("prioritizes relevant active profiles over raw follower popularity", () => {
    const relevant = candidate({
      id: "relevant",
      username: "builder",
      skills: [
        {
          skillId: "lua",
          isPrimary: true,
          skill: { name: "Lua", category: "Programming" },
        },
      ],
      posts: [{ createdAt: new Date("2026-01-09T10:00:00Z") }],
      _count: { followers: 32, following: 4, posts: 6, portfolioItems: 3, reviewsReceived: 1 },
    });
    const popular = candidate({
      id: "popular",
      username: "popular-studio",
      profile: {
        avatarUrl: null,
        bannerUrl: null,
        profileType: "STUDIO",
        verified: true,
        bio: null,
        headline: null,
        availability: null,
      },
      _count: { followers: 8000, following: 100, posts: 2, portfolioItems: 0, reviewsReceived: 0 },
    });

    const ranked = rankDiscoverCandidates({
      candidates: [popular, relevant],
      currentUserId: "viewer",
      currentSkillIds: new Set(["lua"]),
      followedIds: new Set(),
      complementaryTypes: getComplementaryProfileTypes("CLIENT"),
      now: new Date("2026-01-10T10:00:00Z"),
    });

    expect(ranked[0].user.id).toBe("relevant");
    expect(ranked[0].user.discoverReason).toBe("Matches Lua");
  });

  it("demotes already-followed profiles and the current user", () => {
    const currentUser = candidate({ id: "viewer", username: "me", _count: { followers: 10, following: 0 } });
    const followed = candidate({ id: "followed", username: "known", _count: { followers: 100, following: 3 } });
    const fresh = candidate({
      id: "fresh",
      username: "fresh-builder",
      skills: [{ skillId: "ui", isPrimary: true, skill: { name: "UI", category: "Design" } }],
    });

    const ranked = rankDiscoverCandidates({
      candidates: [currentUser, followed, fresh],
      currentUserId: "viewer",
      currentSkillIds: new Set(["ui"]),
      followedIds: new Set(["followed"]),
      complementaryTypes: getComplementaryProfileTypes("DEVELOPER"),
      now: new Date("2026-01-10T10:00:00Z"),
    });

    expect(ranked[0].user.id).toBe("fresh");
    expect(ranked.at(-1)?.user.id).toBe("viewer");
  });
});
