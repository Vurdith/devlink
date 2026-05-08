import type { PortfolioItem } from "@/types/api";

export function parsePortfolioListField(value: unknown): string[] {
  if (!value || typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fall back to CSV for older stored values or malformed edits.
    }
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractPortfolioSkillIds(item: PortfolioItem | null | undefined): string[] {
  const skills = item?.skills;
  if (!Array.isArray(skills)) return [];

  const ids = skills
    .map((skill) => skill?.skill?.id ?? (skill as { skillId?: string })?.skillId)
    .filter((id): id is string => typeof id === "string");

  return Array.from(new Set(ids));
}
