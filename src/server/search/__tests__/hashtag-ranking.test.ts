import { describe, expect, it } from "vitest";

import {
  mergeUniqueHashtagCandidates,
  rankHashtagSearchCandidates,
  type HashtagSearchCandidate,
} from "../hashtag-ranking";

function tag(overrides: Partial<HashtagSearchCandidate> & { name: string }): HashtagSearchCandidate {
  return {
    name: overrides.name,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    latestPostAt: overrides.latestPostAt ?? null,
    _count: {
      posts: overrides._count?.posts ?? 1,
    },
  };
}

describe("rankHashtagSearchCandidates", () => {
  it("prioritizes exact tag matches over popular broad matches", () => {
    const exact = tag({
      name: "ui",
      _count: { posts: 2 },
      latestPostAt: new Date("2025-12-01T10:00:00Z"),
    });
    const popular = tag({
      name: "building-ui-systems",
      _count: { posts: 900 },
      latestPostAt: new Date("2026-01-09T10:00:00Z"),
    });

    const ranked = rankHashtagSearchCandidates([popular, exact], "ui", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].name).toBe("ui");
  });

  it("rewards active high-signal tags over alphabetic ordering", () => {
    const active = tag({
      name: "motion-ai",
      _count: { posts: 24 },
      latestPostAt: new Date("2026-01-09T10:00:00Z"),
    });
    const alphabetic = tag({
      name: "motion-archive",
      _count: { posts: 3 },
      latestPostAt: new Date("2025-01-01T10:00:00Z"),
    });

    const ranked = rankHashtagSearchCandidates([alphabetic, active], "motion", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].name).toBe("motion-ai");
  });
});

describe("mergeUniqueHashtagCandidates", () => {
  it("keeps the first copy of duplicated tags case-insensitively", () => {
    const first = tag({ name: "Roblox" });
    const duplicate = tag({ name: "roblox" });
    const other = tag({ name: "lua" });

    const merged = mergeUniqueHashtagCandidates([first, duplicate, other]);

    expect(merged.map((candidate) => candidate.name)).toEqual(["Roblox", "lua"]);
  });
});
