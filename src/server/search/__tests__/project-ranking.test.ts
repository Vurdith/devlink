import { describe, expect, it } from "vitest";

import { mergeUniqueProjectCandidates, rankProjectSearchCandidates, type ProjectSearchCandidate } from "../project-ranking";

function project(overrides: Partial<ProjectSearchCandidate> & { id: string; title: string }): ProjectSearchCandidate {
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description ?? null,
    category: overrides.category ?? null,
    tags: overrides.tags ?? null,
    mediaUrls: overrides.mediaUrls ?? null,
    links: overrides.links ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    user: overrides.user ?? {
      username: "builder",
      name: "Builder",
    },
    skills: overrides.skills ?? [],
  };
}

describe("rankProjectSearchCandidates", () => {
  it("prioritizes exact title matches over newer weak matches", () => {
    const exact = project({
      id: "exact",
      title: "Inventory UI",
      description: "Designed and implemented a full Roblox inventory interface with filters and mobile states.",
      createdAt: new Date("2025-12-01T10:00:00Z"),
    });
    const newer = project({
      id: "newer",
      title: "Weekly UI notes",
      description: "Small update mentioning inventory UI.",
      createdAt: new Date("2026-01-09T10:00:00Z"),
    });

    const ranked = rankProjectSearchCandidates([newer, exact], "inventory ui", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("exact");
  });

  it("rewards skill/tag relevance and proof-rich case studies", () => {
    const rich = project({
      id: "rich",
      title: "Trading plaza systems",
      description:
        "Built the plaza economy flow, trading confirmation UI, item search, and fraud-resistant logs for a Roblox simulator launch.",
      tags: "economy, trading, simulator",
      mediaUrls: "https://example.com/screen-1.png, https://example.com/screen-2.png",
      links: "https://example.com/case-study",
      skills: [{ skill: { name: "Economy Design" } }, { skill: { name: "Lua" } }],
      createdAt: new Date("2025-11-01T10:00:00Z"),
    });
    const thin = project({
      id: "thin",
      title: "Simulator update",
      description: "Trading work.",
      createdAt: new Date("2026-01-09T10:00:00Z"),
    });

    const ranked = rankProjectSearchCandidates([thin, rich], "trading", new Date("2026-01-10T10:00:00Z"));

    expect(ranked[0].id).toBe("rich");
  });
});

describe("mergeUniqueProjectCandidates", () => {
  it("keeps the first copy of duplicated candidates from multiple pools", () => {
    const first = project({ id: "same", title: "First copy", description: "From focused title pool." });
    const duplicate = project({ id: "same", title: "Duplicate copy", description: "From broad pool." });
    const other = project({ id: "other", title: "Other project" });

    const merged = mergeUniqueProjectCandidates([first, duplicate, other]);

    expect(merged.map((candidate) => candidate.title)).toEqual(["First copy", "Other project"]);
  });
});
