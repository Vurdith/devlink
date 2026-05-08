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
      className={`rounded-xl border transition-all overflow-hidden ${
        skill.isPrimary
          ? "bg-gradient-to-r from-amber-400/[0.08] to-white/[0.015] border-amber-300/20"
          : "bg-white/[0.018] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.03]"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            {skill.isPrimary && (
              <span className="text-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            )}
            <h4 className="font-semibold text-white text-base">
              {skill.skill.name}
            </h4>
          </div>

          {skill.rate && skill.rateUnit && (
            <span className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-1 text-xs font-semibold text-emerald-300">
              {formatRate(skill.rate, skill.rateUnit as RateUnit, currency)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-3">
          <span className={levelConfig?.color || "text-white/50"}>
            {levelConfig?.label}
          </span>

          {skill.yearsOfExp && (
            <>
              <span className="text-white/20">/</span>
              <span>{skill.yearsOfExp}+ years</span>
            </>
          )}

          {availabilityConfig && (
            <>
              <span className="text-white/20">/</span>
              <span className="flex items-center gap-1.5">
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
            </>
          )}
        </div>

        {skill.headline && (
          <p className="text-sm text-white/60 leading-relaxed">
            {skill.headline}
          </p>
        )}
      </div>

      {hasExpandableContent && (
        <div
          className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.06] bg-white/[0.015] cursor-pointer hover:bg-white/[0.03] transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs text-white/40">
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
        <div className="px-5 py-4 border-t border-white/[0.06] bg-black/[0.08]">
          <p className="text-sm text-white/50 leading-relaxed">
            {skill.description}
          </p>
        </div>
      )}
    </div>
  );
}

export type { UserSkill };
