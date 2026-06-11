import { describe, expect, it } from "vitest";

import { rankJobCandidates, type JobRankingCandidate } from "../job-ranking";

function job(overrides: Partial<JobRankingCandidate> & { id: string; title: string }): JobRankingCandidate {
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description ?? "A clear Roblox project brief with timeline, deliverables, and review process.",
    budgetMin: overrides.budgetMin ?? null,
    budgetMax: overrides.budgetMax ?? null,
    skills: overrides.skills ?? null,
    location: overrides.location ?? "Remote",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T10:00:00Z"),
    _count: {
      applications: overrides._count?.applications ?? 0,
    },
    user: overrides.user ?? {
      profile: {
        verified: false,
      },
    },
  };
}

describe("rankJobCandidates", () => {
  it("prioritizes jobs matching the viewer's skills over newer generic roles", () => {
    const relevant = job({
      id: "relevant",
      title: "Roblox inventory UI overhaul",
      skills: "UI Design, Figma, Roblox",
      createdAt: new Date("2026-01-04T10:00:00Z"),
      budgetMin: 300,
      budgetMax: 600,
    });
    const generic = job({
      id: "generic",
      title: "General Roblox task",
      skills: "Scripting",
      createdAt: new Date("2026-01-10T10:00:00Z"),
      _count: { applications: 3 },
    });

    const ranked = rankJobCandidates([generic, relevant], ["UI Design"], new Date("2026-01-10T12:00:00Z"));

    expect(ranked[0].id).toBe("relevant");
  });

  it("falls back to freshness and useful listing detail when there is no skill match", () => {
    const fresh = job({
      id: "fresh",
      title: "Fresh role",
      createdAt: new Date("2026-01-10T10:00:00Z"),
      budgetMin: 100,
      budgetMax: 250,
    });
    const old = job({
      id: "old",
      title: "Older role",
      createdAt: new Date("2025-11-01T10:00:00Z"),
      budgetMin: 100,
      budgetMax: 250,
    });

    const ranked = rankJobCandidates([old, fresh], ["animation"], new Date("2026-01-10T12:00:00Z"));

    expect(ranked[0].id).toBe("fresh");
  });
});
