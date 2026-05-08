import { AVAILABILITY_STATUS, EXPERIENCE_LEVELS, formatRate, type AvailabilityStatus } from "@/lib/skills";
import { cn } from "@/lib/cn";
import type { UserSkill } from "./profile-hub-types";

interface UserSkillsPanelProps {
  userSkills: UserSkill[];
  currency: string;
  onEditSkill: (skill: UserSkill) => void;
  onRemoveSkill: (id: string, name: string) => void;
}

export function UserSkillsPanel({ userSkills, currency, onEditSkill, onRemoveSkill }: UserSkillsPanelProps) {
  return (
    <div className="relative overflow-hidden glass-soft border border-white/10 rounded-2xl p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          background:
            "radial-gradient(900px 260px at 20% 0%, rgba(var(--color-accent-rgb),0.10), transparent 62%), radial-gradient(700px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.10), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
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
          <div>
            <h2 className="text-lg font-semibold text-white">Your Skills ({userSkills.length}/15)</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Click a skill to edit rates and details</p>
          </div>
        </div>

        {userSkills.length === 0 ? (
          <p className="text-white/50 text-sm py-8 text-center">No skills added yet. Add skills below to showcase your expertise.</p>
        ) : (
          <div className="space-y-3">
            {userSkills.map((userSkill) => {
              const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
              const availConfig = userSkill.skillAvailability ? AVAILABILITY_STATUS[userSkill.skillAvailability as AvailabilityStatus] : null;

              return (
                <div
                  key={userSkill.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    userSkill.isPrimary ? "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20" : "bg-white/[0.01] border-white/[0.06] hover:border-white/10"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {userSkill.isPrimary && (
                          <span className="text-amber-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                        )}
                        <h4 className="font-semibold text-white text-base">{userSkill.skill.name}</h4>
                      </div>

                      {userSkill.rate && userSkill.rateUnit && <span className="text-sm font-medium text-emerald-400">{formatRate(userSkill.rate, userSkill.rateUnit, currency)}</span>}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                      <span className={levelConfig.color}>{levelConfig.label}</span>

                      {userSkill.yearsOfExp && (
                        <>
                          <span className="text-white/20">&bull;</span>
                          <span>{userSkill.yearsOfExp}+ years</span>
                        </>
                      )}

                      {availConfig && (
                        <>
                          <span className="text-white/20">&bull;</span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                userSkill.skillAvailability === "AVAILABLE" && "bg-emerald-400",
                                userSkill.skillAvailability === "OPEN_TO_OFFERS" && "bg-blue-400",
                                userSkill.skillAvailability === "BUSY" && "bg-amber-400",
                                userSkill.skillAvailability === "NOT_AVAILABLE" && "bg-red-400"
                              )}
                            />
                            <span className={availConfig.color}>{availConfig.label}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {userSkill.headline && <p className="text-sm text-white/60 leading-relaxed">{userSkill.headline}</p>}
                    {userSkill.description && <p className="text-xs text-white/40 leading-relaxed mt-2 line-clamp-2">{userSkill.description}</p>}
                  </div>

                  <div className="flex items-center gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                    <button
                      onClick={() => onEditSkill(userSkill)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveSkill(userSkill.id, userSkill.skill.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
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
}
