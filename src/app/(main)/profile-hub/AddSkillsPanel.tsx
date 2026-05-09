import { ModalInput } from "@/components/ui/BaseModal";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import type { Skill } from "./profile-hub-types";

interface AddSkillsPanelProps {
  filteredSkills: Skill[];
  skillSearch: string;
  userSkillCount: number;
  onSkillSearchChange: (value: string) => void;
  onAddSkill: (skill: Skill) => void;
  onAddCustomSkill: (skillName: string) => void;
}

export function AddSkillsPanel({
  filteredSkills,
  skillSearch,
  userSkillCount,
  onSkillSearchChange,
  onAddSkill,
  onAddCustomSkill,
}: AddSkillsPanelProps) {
  const canAddMore = userSkillCount < 15;
  const trimmedSearch = skillSearch.trim();

  return (
    <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.36)] to-transparent" />
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
          <div className={iconBox("cyan", "h-10 w-10")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Add skills</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Search from 200+ skills or add your own</p>
          </div>
        </div>

        <ModalInput placeholder="Search skills..." value={skillSearch} onChange={(event) => onSkillSearchChange(event.target.value)} className="mb-4" />

        <div className="mb-4 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {filteredSkills.slice(0, 30).map((skill) => (
            <button
              key={skill.id}
              onClick={() => onAddSkill(skill)}
              disabled={!canAddMore}
              className={cn(
                "rounded-lg border p-3 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                ui.surface.empty,
                "hover:border-[rgba(var(--color-accent-2-rgb),0.28)] hover:bg-[rgba(var(--color-accent-2-rgb),0.06)]",
                !canAddMore && "opacity-50 cursor-not-allowed"
              )}
            >
              <p className="font-medium text-white text-sm">{skill.name}</p>
            </button>
          ))}

          {trimmedSearch && filteredSkills.length === 0 && (
            <button
              onClick={() => onAddCustomSkill(trimmedSearch)}
              disabled={!canAddMore}
              className={cn(
                "col-span-full rounded-lg border p-3 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                "border-[rgba(var(--color-accent-2-rgb),0.28)] bg-[rgba(var(--color-accent-2-rgb),0.06)] hover:bg-[rgba(var(--color-accent-2-rgb),0.10)]",
                !canAddMore && "opacity-50 cursor-not-allowed"
              )}
            >
              <p className="font-medium text-white text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add &quot;{trimmedSearch}&quot; as custom skill
              </p>
            </button>
          )}
        </div>

        {!trimmedSearch && filteredSkills.length === 0 && (
          <div className={surface("empty", "px-4 py-5 text-center text-sm text-[var(--muted-foreground)]")}>
            Skill suggestions will appear here as the catalog loads.
          </div>
        )}
        {!trimmedSearch && filteredSkills.length > 0 && <p className="text-center text-xs text-white/40">Can&apos;t find your skill? Type it above and add it as a custom skill</p>}
      </div>
    </div>
  );
}
