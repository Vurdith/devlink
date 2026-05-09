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
import { iconBox } from "@/components/ui/design-system";

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
  const experienceLabel = [
    levelConfig?.label,
    skill.yearsOfExp ? `${skill.yearsOfExp}+ years` : null,
    skill.skill.category,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-white/[0.012] transition-colors hover:bg-white/[0.03]",
        skill.isPrimary &&
          "bg-[linear-gradient(135deg,rgba(251,191,36,0.075),rgba(12,16,23,0.36)_46%,rgba(12,16,23,0.16))]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-full w-px bg-white/[0.08]",
          skill.isPrimary && "bg-amber-300/35"
        )}
      />
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <div className={iconBox(skill.isPrimary ? "amber" : "cyan", "mt-0.5 h-10 w-10 flex-shrink-0")}>
              {skill.isPrimary ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <h4 className="truncate text-base font-semibold text-white sm:text-lg">
                  {skill.skill.name}
                </h4>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/45">
                {experienceLabel.join(" / ")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {skill.rate && skill.rateUnit ? (
              <p className="text-sm font-semibold text-emerald-300">
                {formatRate(skill.rate, skill.rateUnit as RateUnit, currency)}
              </p>
            ) : null}

            {availabilityConfig ? (
              <div className="flex items-center gap-2 text-xs font-medium text-white/55">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    skill.skillAvailability === "AVAILABLE"
                      ? "bg-emerald-400"
                      : skill.skillAvailability === "OPEN_TO_OFFERS"
                        ? "bg-blue-400"
                        : skill.skillAvailability === "BUSY"
                          ? "bg-amber-400"
                          : "bg-red-400"
                  }`}
                />
                <span className={availabilityConfig.color}>{availabilityConfig.label}</span>
              </div>
            ) : null}
          </div>
        </div>

        {skill.headline && (
          <p className="mt-4 border-l border-[rgba(var(--color-accent-2-rgb),0.32)] pl-3 text-sm font-medium leading-relaxed text-white/72">
            {skill.headline}
          </p>
        )}
      </div>

      {hasExpandableContent && (
        <div
          className="flex cursor-pointer items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.018] px-5 py-3 transition-colors hover:bg-white/[0.04] sm:px-6"
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
        <div className="border-t border-white/[0.06] bg-black/[0.08] px-5 py-4 sm:px-6">
          <p className="text-sm leading-relaxed text-white/56">
            {skill.description}
          </p>
        </div>
      )}
    </div>
  );
}

export type { UserSkill };
