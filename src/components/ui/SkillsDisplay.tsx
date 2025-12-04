"use client";

import { 
  SKILL_CATEGORIES, 
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  formatHourlyRate,
  type SkillCategory,
  type ExperienceLevel,
  type AvailabilityStatus,
} from "@/lib/skills";

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
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${categoryConfig.bgColor} ${categoryConfig.color}`}
            >
              {userSkill.isPrimary && <span className="text-amber-400">★</span>}
              {userSkill.skill.name}
            </span>
          );
        })}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/50 border border-white/10">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displaySkills.map((userSkill) => {
        const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
        const categoryConfig = SKILL_CATEGORIES[userSkill.skill.category as SkillCategory];
        return (
          <div
            key={userSkill.id}
            className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${levelConfig.bgColor} ${levelConfig.color}`}
          >
            {userSkill.isPrimary && (
              <span className="text-amber-400 text-xs">★</span>
            )}
            <span className="text-sm font-medium">{userSkill.skill.name}</span>
            <span className="text-xs opacity-60">{levelConfig.label}</span>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d0d12] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
              <div className="text-xs text-white font-medium">{userSkill.skill.name}</div>
              <div className="text-xs text-white/50">
                {categoryConfig.label} • {levelConfig.label}
                {userSkill.yearsOfExp && ` • ${userSkill.yearsOfExp}+ years`}
              </div>
            </div>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/50 border border-white/10">
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
  showRate = true 
}: AvailabilityBadgeProps) {
  const config = AVAILABILITY_STATUS[status];

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${config.bgColor} ${config.color}`}>
        {config.icon === "check-circle" && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {config.icon === "sparkles" && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )}
        {config.icon === "clock" && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {config.icon === "x-circle" && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {config.label}
      </span>
      
      {showRate && hourlyRate && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          {formatHourlyRate(hourlyRate, currency)}
        </span>
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
    <p className="text-sm text-[var(--muted-foreground)] italic">
      {headline}
    </p>
  );
}

