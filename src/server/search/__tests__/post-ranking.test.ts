import { describe, expect, it } from "vitest";

import { mergeUniquePostCandidates, rankPostSearchCandidates, type PostSearchCandidate } from "../post-ranking";

function post(overrides: Partial<PostSearchCandidate> & { id: string; content: string }): PostSearchCandidate {
  return {
    id: overrides.id,
    content: overrides.content,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    media: overrides.media ?? [],
    user: overrides.user ?? {
      username: "builder",
      name: "Builder",
      profile: {
        bio: "Roblox builder sharing useful build notes.",
        profileType: "DEVELOPER",
        verified: false,
      },
    },
    _count: {
      likes: overrides._count?.likes ?? 0,
      replies: overrides._count?.replies ?? 0,
      reposts: overrides._count?.reposts ?? 0,
      savedBy: overrides._count?.savedBy ?? 0,
    },
  };
}

describe("rankPostSearchCandidates", () => {
  it("prioritizes stronger content matches over newer weak mentions", () => {
    const exact = post({
      id: "exact",
      content: "Inventory UI polish notes for mobile Roblox menus",
      createdAt: new Date("2025-12-01T10:00:00Z"),
    });
    const newer = post({
      id: "newer",
      content: "Quick update from today with a tiny inventory mention.",
      createdAt: new Date("2026-01-09T10:00:00Z"),
      _count: { likes: 1, replies: 0, reposts: 0, savedBy: 0 },
    });

    const ranked = rankPostSearchCandidates([newer, exact], "inventory ui", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("exact");
  });

  it("rewards proof-rich posts when relevance is similar", () => {
    const rich = post({
      id: "rich",
      content: "Trading system breakdown: escrow confirmation, audit log, and scam-resistant item search.",
      media: [{ id: "screen-1" }, { id: "screen-2" }],
      _count: { likes: 20, replies: 6, reposts: 4, savedBy: 8 },
      createdAt: new Date("2025-12-20T10:00:00Z"),
    });
    const thin = post({
      id: "thin",
      content: "Trading system update.",
      createdAt: new Date("2026-01-09T10:00:00Z"),
    });

    const ranked = rankPostSearchCandidates([thin, rich], "trading system", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("rich");
  });

  it("keeps external search index order as a relevance signal", () => {
    const firstIndexHit = post({
      id: "first-index-hit",
      content: "Builder notes about animation polish.",
      createdAt: new Date("2025-12-01T10:00:00Z"),
    });
    const secondIndexHit = post({
      id: "second-index-hit",
      content: "Builder notes about animation polish.",
      createdAt: new Date("2026-01-09T10:00:00Z"),
    });

    const ranked = rankPostSearchCandidates(
      [secondIndexHit, firstIndexHit],
      "animation polish",
      new Date("2026-01-10T10:00:00Z"),
      ["first-index-hit", "second-index-hit"]
    );

    expect(ranked[0].id).toBe("first-index-hit");
  });
});

describe("mergeUniquePostCandidates", () => {
  it("keeps the first copy of duplicated candidates", () => {
    const first = post({ id: "same", content: "First copy" });
    const duplicate = post({ id: "same", content: "Duplicate copy" });
    const other = post({ id: "other", content: "Other post" });

    const merged = mergeUniquePostCandidates([first, duplicate, other]);

    expect(merged.map((candidate) => candidate.content)).toEqual(["First copy", "Other post"]);
  });
});
