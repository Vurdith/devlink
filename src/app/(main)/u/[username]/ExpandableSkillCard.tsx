"use client";

import { useState } from "react";
import {
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  formatRate,
  type ExperienceLevel,
  type AvailabilityStatus,
  type RateUnit,
} from "@/lib/skills";
import { cn } from "@/lib/cn";
import { iconBox, surface } from "@/components/ui/design-system";

interface UserSkill {
  id: string;
  skillId: string;
  experienceLevel: string;
  yearsOfExp: number | null;
  isPrimary: boolean;
  headline?: string | null;
  rate?: number | null;
  rateUnit?: string | null;
  skillAvailability?: string | null;
  description?: string | null;
  skill: { id: string; name: string; category: string };
}

interface ExpandableSkillCardProps {
  skill: UserSkill;
  levelConfig: typeof EXPERIENCE_LEVELS[ExperienceLevel];
  availabilityConfig: typeof AVAILABILITY_STATUS[AvailabilityStatus] | null;
  currency: string;
}

export function ExpandableSkillCard({
  skill,
  levelConfig,
  availabilityConfig,
  currency,
}: ExpandableSkillCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasExpandableContent = skill.description;

  return (
    <div
      className={surface(
        skill.isPrimary ? "panel" : "panelMuted",
        cn(
          "group overflow-hidden transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]",
          skill.isPrimary && "border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.08),rgba(12,16,23,0.74)_42%,rgba(12,16,23,0.74))]"
        )
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className={iconBox(skill.isPrimary ? "amber" : "cyan", "mt-0.5 h-9 w-9 flex-shrink-0")}>
              {skill.isPrimary ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-white">
                {skill.skill.name}
              </h4>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{skill.skill.category}</p>
            </div>
          </div>

          {skill.rate && skill.rateUnit && (
            <span className="flex-shrink-0 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-xs font-semibold text-emerald-300">
              {formatRate(skill.rate, skill.rateUnit as RateUnit, currency)}
            </span>
          )}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span className={`rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-semibold ${levelConfig?.color || "text-white/50"}`}>
            {levelConfig?.label}
          </span>

          {skill.yearsOfExp && (
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1">
              {skill.yearsOfExp}+ years
            </span>
          )}

          {availabilityConfig && (
            <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    skill.skillAvailability === "AVAILABLE"
                      ? "bg-emerald-400"
                      : skill.skillAvailability === "OPEN_TO_OFFERS"
                        ? "bg-blue-400"
                        : skill.skillAvailability === "BUSY"
                          ? "bg-amber-400"
                          : "bg-red-400"
                  }`}
                />
                <span className={availabilityConfig.color}>
                  {availabilityConfig.label}
                </span>
            </span>
          )}
        </div>

        {skill.headline && (
          <p className="border-l border-[rgba(var(--color-accent-2-rgb),0.32)] pl-3 text-sm leading-relaxed text-white/68">
            {skill.headline}
          </p>
        )}
      </div>

      {hasExpandableContent && (
        <div
          className="flex cursor-pointer items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.018] px-5 py-3 transition-colors hover:bg-white/[0.04]"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs font-semibold text-white/50">
            {expanded ? "Hide details" : "Show details"}
          </span>
          <svg
            className={`w-3 h-3 text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      )}

      {expanded && skill.description && (
        <div className="border-t border-white/[0.06] bg-black/[0.08] px-5 py-4">
          <p className="text-sm leading-relaxed text-white/56">
            {skill.description}
          </p>
        </div>
      )}
    </div>
  );
}

export type { UserSkill };
