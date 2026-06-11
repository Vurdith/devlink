import { describe, expect, it } from "vitest";

import { mergeUniqueUserCandidates, rankUserSearchCandidates, type UserSearchCandidate } from "../user-ranking";

function user(overrides: Partial<UserSearchCandidate> & { id: string; username: string }): UserSearchCandidate {
  return {
    id: overrides.id,
    username: overrides.username,
    name: overrides.name ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    profile: overrides.profile ?? {
      avatarUrl: null,
      verified: false,
      profileType: "DEVELOPER",
      bio: "Roblox developer building gameplay systems.",
      headline: "Gameplay systems developer",
      availability: "AVAILABLE",
    },
    skills: overrides.skills ?? [],
    _count: {
      followers: overrides._count?.followers ?? 0,
      posts: overrides._count?.posts ?? 0,
      portfolioItems: overrides._count?.portfolioItems ?? 0,
      reviewsReceived: overrides._count?.reviewsReceived ?? 0,
    },
  };
}

describe("rankUserSearchCandidates", () => {
  it("prioritizes exact username matches over popular broad matches", () => {
    const exact = user({
      id: "exact",
      username: "builder",
      name: "New Builder",
      _count: { followers: 3, posts: 1, portfolioItems: 0, reviewsReceived: 0 },
    });
    const popular = user({
      id: "popular",
      username: "builder-studio-network",
      name: "Builder Studio Network",
      profile: {
        avatarUrl: null,
        verified: true,
        profileType: "STUDIO",
        bio: "A large verified Roblox studio.",
        headline: "Verified Roblox studio",
        availability: null,
      },
      _count: { followers: 9000, posts: 80, portfolioItems: 8, reviewsReceived: 5 },
    });

    const ranked = rankUserSearchCandidates([popular, exact], "builder", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("exact");
  });

  it("rewards skill and profile relevance over alphabetic ordering", () => {
    const relevant = user({
      id: "relevant",
      username: "zara-ui",
      name: "Zara Interface",
      skills: [
        { skill: { name: "UI Design", category: "Design" } },
        { skill: { name: "Figma", category: "Design" } },
      ],
      _count: { followers: 24, posts: 5, portfolioItems: 3, reviewsReceived: 1 },
    });
    const alphabetical = user({
      id: "alphabetical",
      username: "aaron-builder",
      name: "Aaron Builder",
      profile: {
        avatarUrl: null,
        verified: false,
        profileType: "DEVELOPER",
        bio: "General scripting help.",
        headline: "Scripter",
        availability: null,
      },
    });

    const ranked = rankUserSearchCandidates([alphabetical, relevant], "ui", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("relevant");
  });
});

describe("mergeUniqueUserCandidates", () => {
  it("keeps the first copy of duplicated candidates from multiple pools", () => {
    const first = user({ id: "same", username: "first-copy" });
    const duplicate = user({ id: "same", username: "duplicate-copy" });
    const other = user({ id: "other", username: "other-builder" });

    const merged = mergeUniqueUserCandidates([first, duplicate, other]);

    expect(merged.map((candidate) => candidate.username)).toEqual(["first-copy", "other-builder"]);
  });
});
