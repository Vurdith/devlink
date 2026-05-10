"use client";

import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface } from "@/components/ui/design-system";
import { ExpandableSkillCard, type UserSkill } from "./ExpandableSkillCard";
import {
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  formatHourlyRate,
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
  const availabilityConfig = profileData.availability
    ? AVAILABILITY_STATUS[profileData.availability as AvailabilityStatus]
    : null;
  const responseTimeLabels: Record<string, string> = {
    WITHIN_HOURS: "Within hours",
    WITHIN_DAY: "Within a day",
    WITHIN_WEEK: "Within a week",
  };
  const hasProfileDetails = Boolean(
    profileData.location ||
      profileData.website ||
      availabilityConfig ||
      profileData.hourlyRate ||
      profileData.responseTime
  );
  const primarySkill = skills.find((skill) => skill.isPrimary) ?? skills[0];
  const supportingSkills = skills.filter((skill) => skill.id !== primarySkill?.id).slice(0, 3);
  const extraSkillCount = Math.max(0, skills.length - 1 - supportingSkills.length);

  if (skills.length === 0 && !hasProfileDetails) {
    return (
      <FeedbackState
        title="No about details yet"
        description="Skills, links, and profile details will appear here."
        className="py-14"
        icon={
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6M8 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
      {skills.length > 0 && (
        <section className={surface("panel", "overflow-hidden")}>
          <div className="border-b border-white/[0.08] p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-white font-[var(--font-space-grotesk)]">Skills</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                The strongest signals first, with notes where this profile added context.
              </p>
            </div>
            {primarySkill ? (
              <div className="mt-5 grid gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={iconBox(primarySkill.isPrimary ? "amber" : "cyan", "h-11 w-11 flex-shrink-0")}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      {primarySkill.isPrimary ? "Primary skill" : "Lead skill"}
                    </p>
                    <p className="mt-1 truncate text-xl font-semibold text-white">{primarySkill.skill.name}</p>
                  </div>
                </div>
                <div className="min-w-0 text-sm text-white/62 sm:text-right">
                  {supportingSkills.length > 0 ? (
                    <p className="truncate">
                      Also: {supportingSkills.map((skill) => skill.skill.name).join(", ")}
                      {extraSkillCount > 0 ? `, +${extraSkillCount}` : ""}
                    </p>
                  ) : (
                    <p>Focused profile</p>
                  )}
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
        <section className={surface("panelMuted", "h-fit overflow-hidden p-5 sm:p-6")}>
          <div className="mb-4">
            <h3 className="font-[var(--font-space-grotesk)] text-lg font-semibold text-white">Profile details</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Fast context before opening a conversation.</p>
          </div>
          <div className="divide-y divide-white/[0.07]">
          {availabilityConfig && (
            <div className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className={iconBox("cyan", "h-10 w-10")}>
                <svg className="h-5 w-5 text-[var(--color-accent-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l4 4L19 6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">Availability</p>
                <p className={`truncate text-sm font-medium ${availabilityConfig.color}`}>{availabilityConfig.label}</p>
              </div>
            </div>
          )}

          {profileData.responseTime && (
            <div className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className={iconBox("muted", "h-10 w-10")}>
                <svg className="h-5 w-5 text-[var(--color-accent-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">Replies</p>
                <p className="truncate text-sm font-medium text-white/80">{responseTimeLabels[profileData.responseTime] ?? profileData.responseTime}</p>
              </div>
            </div>
          )}

          {profileData.hourlyRate ? (
            <div className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className={iconBox("muted", "h-10 w-10")}>
                <svg className="h-5 w-5 text-[var(--color-accent-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">Rate</p>
                <p className="truncate text-sm font-medium text-white/80">{formatHourlyRate(profileData.hourlyRate, profileData.currency || "USD")}</p>
              </div>
            </div>
          ) : null}

          {profileData.location && (
            <div className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
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
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                  Location
                </p>
                <p className="truncate text-sm font-medium text-white/80">
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
              className="group flex min-w-0 items-center gap-3 py-4 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.62)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(12,16,23)] first:pt-0 last:pb-0"
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
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">
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
        </section>
      )}
    </div>
  );
}
