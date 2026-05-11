"use client";

import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface } from "@/components/ui/design-system";
import { ExpandableSkillCard, type UserSkill } from "./ExpandableSkillCard";
import {
  AVAILABILITY_STATUS,
  EXPERIENCE_LEVELS,
  type AvailabilityStatus,
  type ExperienceLevel,
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

  if (skills.length === 0 && !hasProfileDetails) {
    return (
      <FeedbackState
        title="No about details yet"
        description="Skills, location, and links will appear here once published."
        className="py-14"
        icon={
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6M8 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
      {skills.length > 0 ? (
        <section className={surface("panel", "overflow-hidden")}>
          <div className="border-b border-white/[0.08] p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-[var(--font-space-grotesk)] text-xl font-semibold tracking-tight text-white">
                Skills
              </h3>
              <span className="text-sm font-medium text-white/45">
                {skills.length} {skills.length === 1 ? "skill" : "skills"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:p-5">
            {skills.map((skill) => {
              const levelConfig =
                EXPERIENCE_LEVELS[skill.experienceLevel as ExperienceLevel];
              const availabilityConfig = skill.skillAvailability
                ? AVAILABILITY_STATUS[
                    skill.skillAvailability as AvailabilityStatus
                  ]
                : null;

              return (
                <ExpandableSkillCard
                  key={skill.id}
                  skill={skill}
                  levelConfig={levelConfig}
                  availabilityConfig={availabilityConfig}
                  currency={profileData.currency || "USD"}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {hasProfileDetails ? (
        <section
          className={surface("panelMuted", "h-fit overflow-hidden p-4 sm:p-6")}
        >
          <h3 className="mb-4 font-[var(--font-space-grotesk)] text-lg font-semibold text-white">
            Details
          </h3>
          <div className="divide-y divide-white/[0.07]">
            {profileData.location ? (
              <div className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
                <div className={iconBox("muted", "h-10 w-10")}>
                  <svg
                    className="h-5 w-5 text-[var(--color-accent-2)]"
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
            ) : null}

            {profileData.website ? (
              <a
                href={profileData.website}
                target="_blank"
                rel="noreferrer"
                className="group flex min-w-0 items-center gap-3 py-4 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.62)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(12,16,23)] first:pt-0 last:pb-0"
              >
                <div
                  className={iconBox(
                    "cyan",
                    "h-10 w-10 transition-colors group-hover:bg-[rgba(var(--color-accent-2-rgb),0.13)]"
                  )}
                >
                  <svg
                    className="h-5 w-5 text-[var(--color-accent-2)]"
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                    Website
                  </p>
                  <p className="truncate text-sm font-medium text-[var(--color-accent-2)] group-hover:underline">
                    {profileData.website.replace(/^https?:\/\//, "")}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 text-[var(--color-accent-2)] opacity-0 transition-opacity group-hover:opacity-100"
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
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
