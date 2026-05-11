"use client";

import { useState } from "react";
import {
  AVAILABILITY_STATUS,
  EXPERIENCE_LEVELS,
  formatRate,
  type AvailabilityStatus,
  type ExperienceLevel,
  type RateUnit,
} from "@/lib/skills";
import { cn } from "@/lib/cn";

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
  const hasExpandableContent = Boolean(skill.description);
  const skillRate =
    skill.rate && skill.rateUnit
      ? formatRate(skill.rate, skill.rateUnit as RateUnit, currency)
      : null;
  const experienceLabel = [
    levelConfig?.label,
    skill.yearsOfExp ? `${skill.yearsOfExp}+ years` : null,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.018] transition-colors hover:border-white/[0.12] hover:bg-white/[0.032]",
        skill.isPrimary &&
          "border-[rgba(var(--color-accent-2-rgb),0.16)] bg-[linear-gradient(135deg,rgba(var(--color-accent-2-rgb),0.075),rgba(12,16,23,0.30)_46%,rgba(12,16,23,0.16))]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-full w-1 bg-white/[0.06]",
          skill.isPrimary && "bg-[rgba(var(--color-accent-2-rgb),0.35)]"
        )}
      />
      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="truncate text-base font-semibold text-white sm:text-lg">
                {skill.skill.name}
              </h4>
              {skill.isPrimary ? (
                <span className="rounded-full border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-accent-2)]">
                  Primary
                </span>
              ) : null}
            </div>
            {experienceLabel.length > 0 ? (
              <p className="mt-1 text-sm leading-relaxed text-white/50">
                {experienceLabel.join(" / ")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {skillRate ? (
              <p className="text-sm font-semibold text-white">{skillRate}</p>
            ) : null}

            {availabilityConfig ? (
              <div className="flex items-center gap-2 text-sm font-medium text-white/55">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    skill.skillAvailability === "AVAILABLE" && "bg-emerald-400",
                    skill.skillAvailability === "OPEN_TO_OFFERS" &&
                      "bg-[var(--color-accent-2)]",
                    skill.skillAvailability === "BUSY" && "bg-amber-400",
                    skill.skillAvailability === "NOT_AVAILABLE" && "bg-red-400"
                  )}
                />
                <span className={availabilityConfig.color}>
                  {availabilityConfig.label}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {skill.headline ? (
          <p className="mt-4 border-l border-[rgba(var(--color-accent-2-rgb),0.32)] pl-3 text-sm font-medium leading-relaxed text-white/72">
            {skill.headline}
          </p>
        ) : null}
      </div>

      {hasExpandableContent ? (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.018] px-5 py-3 text-left outline-none transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.045] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)] sm:px-6"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="text-xs font-semibold text-white/50">
            {expanded ? "Hide details" : "Show details"}
          </span>
          <svg
            className={`h-3 w-3 text-white/40 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
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
        </button>
      ) : null}

      {expanded && skill.description ? (
        <div className="border-t border-white/[0.06] bg-black/[0.08] px-5 py-4 sm:px-6">
          <p className="text-sm leading-relaxed text-white/56">
            {skill.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export type { UserSkill };
