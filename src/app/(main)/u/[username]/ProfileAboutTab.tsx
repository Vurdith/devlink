"use client";

import { ExpandableSkillCard, type UserSkill } from "./ExpandableSkillCard";
import {
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  type ExperienceLevel,
  type AvailabilityStatus,
} from "@/lib/skills";

interface ProfileData {
  location?: string | null;
  website?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  currency?: string | null;
  responseTime?: string | null;
}

interface ProfileAboutTabProps {
  skills: UserSkill[];
  profileData: ProfileData;
}

export function ProfileAboutTab({ skills, profileData }: ProfileAboutTabProps) {
  return (
    <div className="space-y-6">
      {skills.length > 0 && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--color-accent)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Skills & Services
          </h3>
          <div className="space-y-3">
            {skills.map((s) => {
              const levelConfig = EXPERIENCE_LEVELS[
                s.experienceLevel as ExperienceLevel
              ];
              const availabilityConfig = s.skillAvailability
                ? AVAILABILITY_STATUS[s.skillAvailability as AvailabilityStatus]
                : null;

              return (
                <ExpandableSkillCard
                  key={s.id}
                  skill={s}
                  levelConfig={levelConfig}
                  availabilityConfig={availabilityConfig}
                  currency={profileData.currency || "USD"}
                />
              );
            })}
          </div>
        </div>
      )}

      {(profileData.location || profileData.website) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profileData.location && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--color-accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm font-medium text-white/80">
                  {profileData.location}
                </p>
              </div>
            </div>
          )}

          {profileData.website && (
            <a
              href={profileData.website}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/[0.08] to-transparent border border-[var(--color-accent)]/20 flex items-center gap-3 group hover:border-[var(--color-accent)]/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center group-hover:bg-[var(--color-accent)]/30 transition-colors">
                <svg
                  className="w-5 h-5 text-[var(--color-accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wide">
                  Website
                </p>
                <p className="text-sm font-medium text-[var(--color-accent)] truncate group-hover:underline">
                  {profileData.website.replace(/^https?:\/\//, "")}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
