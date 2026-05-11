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
  const availabilityTone =
    skill.skillAvailability === "AVAILABLE"
      ? "bg-emerald-400"
      : skill.skillAvailability === "OPEN_TO_OFFERS"
        ? "bg-[var(--color-accent-2)]"
        : skill.skillAvailability === "BUSY"
          ? "bg-amber-400"
          : "bg-red-400";

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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,auto)] lg:items-start">
          <div className="min-w-0">
            {skill.isPrimary ? (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">
                Primary skill
              </p>
            ) : null}
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="truncate text-base font-semibold text-white sm:text-lg">
                {skill.skill.name}
              </h4>
            </div>
            {experienceLabel.length > 0 ? (
              <p className="mt-1 text-sm leading-relaxed text-white/50">
                {experienceLabel.join(" / ")}
              </p>
            ) : null}
          </div>

          {skillRate || availabilityConfig ? (
            <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(108px,1fr))] gap-2">
              {skillRate ? (
                <div className="rounded-lg border border-white/[0.07] bg-black/[0.12] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Rate
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {skillRate}
                  </p>
                </div>
              ) : null}

              {availabilityConfig ? (
                <div className="rounded-lg border border-white/[0.07] bg-black/[0.12] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Status
                  </p>
                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", availabilityTone)} />
                    <span className={cn("truncate text-sm font-semibold", availabilityConfig.color)}>
                      {availabilityConfig.label}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
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
