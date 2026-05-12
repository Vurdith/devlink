import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BaseModal, ModalInput, ModalTextarea } from "@/components/ui/BaseModal";
import { surface, ui } from "@/components/ui/design-system";
import { AVAILABILITY_STATUS, EXPERIENCE_LEVELS, RATE_UNITS, type AvailabilityStatus, type ExperienceLevel, type RateUnit } from "@/lib/skills";
import { cn } from "@/lib/cn";
import type { UserSkill } from "./profile-hub-types";

interface SkillEditModalProps {
  skill: UserSkill;
  onSave: (skill: UserSkill) => void | Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}

export const SkillEditModal = memo(function SkillEditModal({ skill, onSave, onClose, isSaving = false }: SkillEditModalProps) {
  const [draftSkill, setDraftSkill] = useState(skill);

  useEffect(() => {
    setDraftSkill(skill);
  }, [skill]);

  const updateDraftSkill = useCallback((updates: Partial<UserSkill>) => {
    setDraftSkill((current) => ({ ...current, ...updates }));
  }, []);

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={`Edit ${draftSkill.skill.name}`}
      size="lg"
      closeOnBackdrop={!isSaving}
      closeOnEscape={!isSaving}
      showCloseButton={!isSaving}
      contentClassName="p-5 sm:p-6"
      footer={
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(draftSkill)} isLoading={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
      headerRight={
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-2)] sm:block">
          Skill
        </p>
      }
    >
      <div className={surface("empty", "mb-5 px-4 py-3 text-sm text-white/62")}>
        {isSaving ? "Saving skill..." : "Set the level, availability, and rate shown on your profile."}
      </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Experience level</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.entries(EXPERIENCE_LEVELS) as [ExperienceLevel, typeof EXPERIENCE_LEVELS[ExperienceLevel]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateDraftSkill({ experienceLevel: key })}
                  disabled={isSaving}
                  className={cn(
                    "rounded-lg border p-2 text-xs font-medium outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                    draftSkill.experienceLevel === key ? `${config.bgColor} ${config.color}` : cn(ui.surface.empty, "text-white/60 hover:border-white/[0.14] hover:bg-white/[0.045]")
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Years of experience (optional)</label>
            <ModalInput
              type="number"
              value={draftSkill.yearsOfExp || ""}
              onChange={(event) => updateDraftSkill({ yearsOfExp: event.target.value ? parseInt(event.target.value) : null })}
              placeholder="e.g., 3"
              disabled={isSaving}
              min={0}
              max={50}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Headline (optional)</label>
            <ModalInput
              value={draftSkill.headline || ""}
              onChange={(event) => updateDraftSkill({ headline: event.target.value })}
              placeholder={`Senior ${draftSkill.skill.name} specialist`}
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Description (optional)</label>
            <ModalTextarea
              value={draftSkill.description || ""}
              onChange={(event) => updateDraftSkill({ description: event.target.value })}
              placeholder="What you do with this skill and when to contact you."
              disabled={isSaving}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Rate (optional)</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <ModalInput
                type="number"
                value={draftSkill.rate ? draftSkill.rate / 100 : ""}
                onChange={(event) =>
                  updateDraftSkill({
                    rate: event.target.value ? Math.round(parseFloat(event.target.value) * 100) : null,
                  })
                }
                placeholder="50"
                disabled={isSaving}
                className="flex-1"
              />
              <select
                value={draftSkill.rateUnit || "HOURLY"}
                onChange={(event) => updateDraftSkill({ rateUnit: event.target.value as RateUnit })}
                disabled={isSaving}
                className="cursor-pointer appearance-none rounded-lg border border-white/[0.10] bg-[rgba(8,11,16,0.78)] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-no-repeat px-3 py-2 pr-8 text-sm text-white outline-none transition-colors hover:border-white/[0.18] focus:border-[rgba(var(--color-accent-2-rgb),0.42)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(Object.entries(RATE_UNITS) as [RateUnit, typeof RATE_UNITS[RateUnit]][]).map(([key, config]) => (
                  <option key={key} value={key} className="bg-[#1a1a24] text-white">
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-2 block">Availability for this skill</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(AVAILABILITY_STATUS) as [AvailabilityStatus, typeof AVAILABILITY_STATUS[AvailabilityStatus]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateDraftSkill({ skillAvailability: key })}
                  disabled={isSaving}
                  className={cn(
                    "relative overflow-hidden rounded-lg border p-2 text-left text-xs font-medium outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                    draftSkill.skillAvailability === key ? `${config.bgColor} ${config.color}` : cn(ui.surface.empty, "text-white/60 hover:border-white/[0.14] hover:bg-white/[0.045]")
                  )}
                >
                  {draftSkill.skillAvailability === key ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 top-0 h-px",
                        key === "AVAILABLE" && "bg-emerald-300/55",
                        key === "OPEN_TO_OFFERS" && "bg-sky-300/55",
                        key === "BUSY" && "bg-amber-300/55",
                        key === "NOT_AVAILABLE" && "bg-rose-300/55"
                      )}
                    />
                  ) : null}
                  <span className="block">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={surface("empty", "flex items-center justify-between rounded-lg p-3")}>
            <div>
              <p className="text-sm font-medium text-white">Primary skill</p>
              <p className="text-xs text-white/50">Shown first on your profile.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draftSkill.isPrimary}
              onClick={() => updateDraftSkill({ isPrimary: !draftSkill.isPrimary })}
              disabled={isSaving}
              className={cn(
                "relative h-6 w-11 rounded-full outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-300/40",
                draftSkill.isPrimary ? "bg-[var(--color-accent-2)]" : "bg-white/20"
              )}
            >
              <div className={cn("w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform", draftSkill.isPrimary ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>
        </div>
    </BaseModal>
  );
});
