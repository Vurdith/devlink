import { memo } from "react";
import { AVAILABILITY_STATUS, EXPERIENCE_LEVELS, formatRate, type AvailabilityStatus } from "@/lib/skills";
import { ToneBadge, type DataTone } from "@/components/ui/DataDisplay";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import type { UserSkill } from "./profile-hub-types";

interface UserSkillsPanelProps {
  userSkills: UserSkill[];
  currency: string;
  onEditSkill: (skill: UserSkill) => void;
  onRemoveSkill: (id: string, name: string) => void;
  removingSkillId?: string | null;
  isSavingSkill?: boolean;
}

export const UserSkillsPanel = memo(function UserSkillsPanel({ userSkills, currency, onEditSkill, onRemoveSkill, removingSkillId, isSavingSkill = false }: UserSkillsPanelProps) {
  const isRemovingSkill = Boolean(removingSkillId);
  const isBusy = isSavingSkill || isRemovingSkill;

  return (
    <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="relative">
        <div className="mb-6 flex min-w-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={iconBox("amber", "h-10 w-10")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">Skills ({userSkills.length}/15)</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Set levels, rates, availability, and notes.</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/56 sm:inline-flex">
            {userSkills.length}/15 added
          </span>
        </div>

        {userSkills.length === 0 ? (
          <div className={surface("empty", "noise-overlay relative overflow-hidden px-5 py-10 text-center")}>
            <div className={iconBox("muted", "mx-auto mb-4 h-12 w-12")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">No skills yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              Add the work you want to be contacted for.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userSkills.map((userSkill) => {
              const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
              const availConfig = userSkill.skillAvailability ? AVAILABILITY_STATUS[userSkill.skillAvailability as AvailabilityStatus] : null;
              const isRemovingThisSkill = removingSkillId === userSkill.id;
              const availabilityTone: DataTone =
                userSkill.skillAvailability === "AVAILABLE"
                  ? "success"
                  : userSkill.skillAvailability === "OPEN_TO_OFFERS"
                    ? "info"
                    : userSkill.skillAvailability === "BUSY"
                      ? "warning"
                      : "danger";

              return (
                <div
                  key={userSkill.id}
                  className={cn(
                    "group overflow-hidden rounded-lg border transition-all duration-200 focus-within:border-[rgba(var(--color-accent-2-rgb),0.30)]",
                    userSkill.isPrimary ? "border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.045)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : cn(ui.surface.empty, "hover:border-white/[0.12] hover:bg-white/[0.045]")
                  )}
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        {userSkill.isPrimary && (
                          <span className="shrink-0 text-[var(--color-accent-2)]">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                        )}
                        <h4 className="truncate text-base font-semibold text-white">{userSkill.skill.name}</h4>
                      </div>

                      {userSkill.rate && userSkill.rateUnit && (
                        <ToneBadge tone="money">
                          {formatRate(userSkill.rate, userSkill.rateUnit, currency)}
                        </ToneBadge>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-white/50">
                      <span className={levelConfig.color}>{levelConfig.label}</span>

                      {userSkill.yearsOfExp && (
                        <>
                          <span className="text-white/20">/</span>
                          <span>{userSkill.yearsOfExp}+ years</span>
                        </>
                      )}

                      {availConfig && (
                        <>
                          <span className="text-white/20">/</span>
                          <ToneBadge tone={availabilityTone} className="py-0.5 text-[11px]">
                            {availConfig.label}
                          </ToneBadge>
                        </>
                      )}
                    </div>

                    {userSkill.headline && <p className="break-words border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-sm leading-relaxed text-white/62">{userSkill.headline}</p>}
                    {userSkill.description && <p className="mt-2 line-clamp-2 break-words pl-3 text-xs leading-relaxed text-white/42">{userSkill.description}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.018] px-4 py-3 sm:px-5">
                    <button
                      type="button"
                      onClick={() => onEditSkill(userSkill)}
                      disabled={isBusy}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                        ui.control.ghost,
                        "hover:text-[var(--color-accent-2)]",
                        isBusy && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSkill(userSkill.id, userSkill.skill.name)}
                      disabled={isBusy}
                      aria-busy={isRemovingThisSkill}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs text-white/40 outline-none transition-colors hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-300/35",
                        isBusy && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isRemovingThisSkill ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-rose-200/70 border-r-transparent animate-spin" aria-hidden="true" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {isRemovingThisSkill ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
