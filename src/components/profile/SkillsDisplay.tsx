"use client";

import {
  AVAILABILITY_STATUS,
  EXPERIENCE_LEVELS,
  SKILL_CATEGORIES,
  formatHourlyRate,
  type AvailabilityStatus,
  type ExperienceLevel,
  type SkillCategory,
} from "@/lib/skills";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";
import { ToneBadge, type DataTone } from "@/components/ui/DataDisplay";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface UserSkill {
  id: string;
  skillId: string;
  experienceLevel: ExperienceLevel;
  yearsOfExp: number | null;
  isPrimary: boolean;
  skill: Skill;
}

interface SkillsDisplayProps {
  skills: UserSkill[];
  compact?: boolean;
  maxDisplay?: number;
}

function PrimarySkillIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3.2l2.6 5.26 5.8.84-4.2 4.1.99 5.77L12 16.45l-5.19 2.72.99-5.77-4.2-4.1 5.8-.84L12 3.2z" />
    </svg>
  );
}

export function SkillsDisplay({ skills, compact = false, maxDisplay }: SkillsDisplayProps) {
  if (!skills || skills.length === 0) return null;

  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remainingCount = maxDisplay ? Math.max(0, skills.length - maxDisplay) : 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {displaySkills.map((userSkill) => {
          const categoryConfig = SKILL_CATEGORIES[userSkill.skill.category as SkillCategory];
          return (
            <span
              key={userSkill.id}
              className={cn(
                "inline-flex min-h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium",
                categoryConfig.bgColor,
                categoryConfig.color
              )}
            >
              {userSkill.isPrimary && <PrimarySkillIcon className="h-3 w-3 text-amber-300" />}
              {userSkill.skill.name}
            </span>
          );
        })}
        {remainingCount > 0 && (
          <span className={cn("inline-flex min-h-8 items-center rounded-lg px-2 text-xs text-white/50", ui.surface.empty)}>
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {displaySkills.map((userSkill) => {
        const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
        const categoryConfig = SKILL_CATEGORIES[userSkill.skill.category as SkillCategory];
        return (
          <div
            key={userSkill.id}
            className={cn(
              "group relative flex min-w-0 items-center gap-3 rounded-lg border px-3 py-3 transition-all hover:-translate-y-0.5",
              levelConfig.bgColor,
              levelConfig.color
            )}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-current/15 bg-black/10">
              {userSkill.isPrimary ? (
                <PrimarySkillIcon className="h-3.5 w-3.5 text-amber-300" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{userSkill.skill.name}</span>
              <span className="mt-0.5 block truncate text-xs opacity-70">{categoryConfig.label}</span>
            </span>
            <span className="rounded-md border border-current/15 bg-black/10 px-2 py-1 text-xs font-semibold opacity-80">
              {levelConfig.label}
            </span>

            <div className={surface("panelStrong", "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100")}>
              <div className="text-xs font-medium text-white">{userSkill.skill.name}</div>
              <div className="text-xs text-white/50">
                {categoryConfig.label} / {levelConfig.label}
                {userSkill.yearsOfExp && ` / ${userSkill.yearsOfExp}+ years`}
              </div>
            </div>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <span className={cn("inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-white/50", ui.surface.empty)}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  hourlyRate?: number | null;
  currency?: string;
  showRate?: boolean;
}

export function AvailabilityBadge({
  status,
  hourlyRate,
  currency = "USD",
  showRate = true,
}: AvailabilityBadgeProps) {
  const config = AVAILABILITY_STATUS[status];
  const tone: DataTone =
    status === "AVAILABLE"
      ? "success"
      : status === "OPEN_TO_OFFERS"
        ? "info"
        : status === "BUSY"
          ? "warning"
          : "danger";

  return (
    <div className="inline-flex items-center gap-2">
      <ToneBadge
        tone={tone}
        icon={config.icon === "check-circle" ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : config.icon === "sparkles" ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ) : config.icon === "clock" ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : config.icon === "x-circle" ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : null}
      >
        {config.label}
      </ToneBadge>

      {showRate && hourlyRate && (
        <ToneBadge tone="money">
          {formatHourlyRate(hourlyRate, currency)}
        </ToneBadge>
      )}
    </div>
  );
}

interface HeadlineDisplayProps {
  headline: string;
}

export function HeadlineDisplay({ headline }: HeadlineDisplayProps) {
  if (!headline) return null;

  return (
    <p className="text-sm italic text-[var(--muted-foreground)]">
      {headline}
    </p>
  );
}
