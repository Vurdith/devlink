"use client";

import { iconBox, surface } from "@/components/ui/design-system";
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
  const hasProfileDetails = Boolean(profileData.location || profileData.website);
  const primarySkill = skills.find((skill) => skill.isPrimary) ?? skills[0];

  if (skills.length === 0 && !hasProfileDetails) {
    return (
      <div className={surface("empty", "px-6 py-14 text-center text-[var(--muted-foreground)]")}>
        <div className={iconBox("muted", "mx-auto mb-4 h-14 w-14 text-white/45")}>
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6M8 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-white">No about details yet</p>
        <p className="mt-1 text-sm">Skills, links, and profile details will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {skills.length > 0 && (
        <section className={surface("panel", "overflow-hidden")}>
          <div className="border-b border-white/[0.08] p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-white font-[var(--font-space-grotesk)]">Capabilities</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Practical strengths, availability, and service focus.
              </p>
            </div>
            {primarySkill ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={iconBox(primarySkill.isPrimary ? "amber" : "cyan", "h-11 w-11")}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      {primarySkill.isPrimary ? "Signature capability" : "Leading capability"}
                    </p>
                    <p className="mt-1 truncate text-xl font-semibold text-white">{primarySkill.skill.name}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-left sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Listed</p>
                  <p className="text-sm font-semibold text-white">
                    {skills.length} {skills.length === 1 ? "capability" : "capabilities"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="divide-y divide-white/[0.06]">
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
        </section>
      )}

      {hasProfileDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profileData.location && (
            <div className={surface("empty", "flex items-center gap-3 p-4")}>
              <div className={iconBox("muted", "h-10 w-10")}>
                <svg
                  className="w-5 h-5 text-[var(--color-accent-2)]"
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
              className={surface("empty", "group flex items-center gap-3 p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.34)] hover:bg-white/[0.04]")}
            >
              <div className={iconBox("cyan", "h-10 w-10 transition-colors group-hover:bg-[rgba(var(--color-accent-2-rgb),0.13)]")}>
                <svg
                  className="w-5 h-5 text-[var(--color-accent-2)]"
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
                <p className="text-sm font-medium text-[var(--color-accent-2)] truncate group-hover:underline">
                  {profileData.website.replace(/^https?:\/\//, "")}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-[var(--color-accent-2)] opacity-0 group-hover:opacity-100 transition-opacity"
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
