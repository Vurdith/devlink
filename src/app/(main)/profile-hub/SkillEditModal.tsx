import { Button } from "@/components/ui/Button";
import { ModalInput, ModalTextarea } from "@/components/ui/BaseModal";
import { AVAILABILITY_STATUS, EXPERIENCE_LEVELS, RATE_UNITS, type AvailabilityStatus, type ExperienceLevel, type RateUnit } from "@/lib/skills";
import { cn } from "@/lib/cn";
import type { UserSkill } from "./profile-hub-types";

interface SkillEditModalProps {
  skill: UserSkill;
  onSkillChange: (skill: UserSkill | null) => void;
  onSave: (skill: UserSkill) => void;
  onClose: () => void;
}

export function SkillEditModal({ skill, onSkillChange, onSave, onClose }: SkillEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative overflow-hidden w-full max-w-lg glass-soft rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Edit {skill.skill.name}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Experience Level</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(EXPERIENCE_LEVELS) as [ExperienceLevel, typeof EXPERIENCE_LEVELS[ExperienceLevel]][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => onSkillChange({ ...skill, experienceLevel: key })}
                  className={cn("p-2 rounded-lg border text-xs font-medium transition-all", skill.experienceLevel === key ? `${config.bgColor} ${config.color}` : "border-white/10 text-white/60 hover:border-white/20")}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Years of Experience (optional)</label>
            <ModalInput
              type="number"
              value={skill.yearsOfExp || ""}
              onChange={(event) => onSkillChange({ ...skill, yearsOfExp: event.target.value ? parseInt(event.target.value) : null })}
              placeholder="e.g., 3"
              min={0}
              max={50}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Skill Headline (optional)</label>
            <ModalInput
              value={skill.headline || ""}
              onChange={(event) => onSkillChange({ ...skill, headline: event.target.value })}
              placeholder={`e.g., Senior ${skill.skill.name} Specialist`}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Description (optional)</label>
            <ModalTextarea
              value={skill.description || ""}
              onChange={(event) => onSkillChange({ ...skill, description: event.target.value })}
              placeholder="What you offer and your approach..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Rate (optional)</label>
            <div className="flex gap-2">
              <ModalInput
                type="number"
                value={skill.rate ? skill.rate / 100 : ""}
                onChange={(event) =>
                  onSkillChange({
                    ...skill,
                    rate: event.target.value ? Math.round(parseFloat(event.target.value) * 100) : null,
                  })
                }
                placeholder="50"
                className="flex-1"
              />
              <select
                value={skill.rateUnit || "HOURLY"}
                onChange={(event) => onSkillChange({ ...skill, rateUnit: event.target.value as RateUnit })}
                className="px-3 py-2 pr-8 rounded-lg bg-[#1a1a24] border border-white/20 text-white text-sm cursor-pointer hover:border-white/30 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
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
                  onClick={() => onSkillChange({ ...skill, skillAvailability: key })}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2",
                    skill.skillAvailability === key ? `${config.bgColor} ${config.color}` : "border-white/10 text-white/60 hover:border-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      key === "AVAILABLE" && "bg-emerald-400",
                      key === "OPEN_TO_OFFERS" && "bg-blue-400",
                      key === "BUSY" && "bg-amber-400",
                      key === "NOT_AVAILABLE" && "bg-red-400"
                    )}
                  />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Primary Skill</p>
              <p className="text-xs text-white/50">Shown prominently on your profile</p>
            </div>
            <button onClick={() => onSkillChange({ ...skill, isPrimary: !skill.isPrimary })} className={cn("w-11 h-6 rounded-full transition-colors relative", skill.isPrimary ? "bg-amber-500" : "bg-white/20")}>
              <div className={cn("w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform", skill.isPrimary ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(skill)} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
