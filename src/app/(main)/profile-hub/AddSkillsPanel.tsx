import { memo, useMemo, useState } from "react";
import { ModalInput } from "@/components/ui/BaseModal";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import type { Skill, UserSkill } from "./profile-hub-types";

interface AddSkillsPanelProps {
  allSkills: Skill[];
  userSkills: UserSkill[];
  userSkillCount: number;
  onAddSkill: (skill: Skill) => boolean | Promise<boolean>;
  onAddCustomSkill: (skillName: string) => boolean | Promise<boolean>;
  addingSkillId?: string | null;
  isAddingCustomSkill?: boolean;
}

export const AddSkillsPanel = memo(function AddSkillsPanel({
  allSkills,
  userSkills,
  userSkillCount,
  onAddSkill,
  onAddCustomSkill,
  addingSkillId,
  isAddingCustomSkill = false,
}: AddSkillsPanelProps) {
  const [skillSearch, setSkillSearch] = useState("");
  const canAddMore = userSkillCount < 15;
  const trimmedSearch = skillSearch.trim();
  const normalizedSearch = trimmedSearch.toLowerCase();
  const isAddingSkill = Boolean(addingSkillId);
  const isBusy = isAddingSkill || isAddingCustomSkill;
  const userSkillIds = useMemo(() => new Set(userSkills.map((skill) => skill.skillId)), [userSkills]);
  const visibleSkills = useMemo(() => {
    const matches: Skill[] = [];

    for (const skill of allSkills) {
      if (userSkillIds.has(skill.id)) continue;
      if (normalizedSearch && !skill.name.toLowerCase().includes(normalizedSearch)) continue;

      matches.push(skill);
      if (matches.length >= 30) break;
    }

    return matches;
  }, [allSkills, normalizedSearch, userSkillIds]);

  return (
    <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="relative">
        <div className="mb-6 flex min-w-0 items-center gap-3">
          <div className={iconBox("cyan", "h-10 w-10")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Add skills</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Search the catalog or add a custom skill.</p>
          </div>
        </div>

        <ModalInput
          placeholder="Search skills..."
          value={skillSearch}
          onChange={(event) => setSkillSearch(event.target.value)}
          disabled={isBusy}
          aria-describedby="add-skills-feedback"
          className="mb-4"
        />

        <div className="mb-4 grid max-h-72 min-w-0 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/[0.08] p-2 sm:grid-cols-2">
          {visibleSkills.map((skill) => {
            const isAddingThisSkill = addingSkillId === skill.id;

            return (
              <button
                key={skill.id}
                type="button"
                onClick={async () => {
                  const didAdd = await onAddSkill(skill);
                  if (didAdd) setSkillSearch("");
                }}
                disabled={!canAddMore || isBusy}
                aria-busy={isAddingThisSkill}
                className={cn(
                  "group min-w-0 rounded-lg border p-3 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]",
                  ui.surface.empty,
                  "hover:border-[rgba(var(--color-accent-2-rgb),0.28)] hover:bg-[rgba(var(--color-accent-2-rgb),0.06)]",
                  (!canAddMore || isBusy) && "opacity-50 cursor-not-allowed"
                )}
              >
                <p className="flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-white">
                  <span className="truncate">{skill.name}</span>
                  {isAddingThisSkill && (
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/60 border-r-transparent animate-spin" aria-hidden="true" />
                  )}
                </p>
              </button>
            );
          })}

          {trimmedSearch && visibleSkills.length === 0 && (
            <button
              type="button"
              onClick={async () => {
                const didAdd = await onAddCustomSkill(trimmedSearch);
                if (didAdd) setSkillSearch("");
              }}
              disabled={!canAddMore || isBusy}
              aria-busy={isAddingCustomSkill}
              className={cn(
                "col-span-full min-w-0 rounded-lg border p-3 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]",
                "border-[rgba(var(--color-accent-2-rgb),0.28)] bg-[rgba(var(--color-accent-2-rgb),0.06)] hover:bg-[rgba(var(--color-accent-2-rgb),0.10)]",
                (!canAddMore || isBusy) && "opacity-50 cursor-not-allowed"
              )}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="min-w-0 flex-1 truncate">
                  {isAddingCustomSkill ? `Adding "${trimmedSearch}"...` : `Add "${trimmedSearch}" as custom skill`}
                </span>
                {isAddingCustomSkill && (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/60 border-r-transparent animate-spin" aria-hidden="true" />
                )}
              </p>
            </button>
          )}
        </div>

        <p id="add-skills-feedback" className="sr-only" aria-live="polite">
          {isAddingCustomSkill ? "Adding your custom skill." : isAddingSkill ? "Adding skill to your profile." : ""}
        </p>

        {!trimmedSearch && visibleSkills.length === 0 && (
          <div className={surface("empty", "noise-overlay relative overflow-hidden px-4 py-5 text-center text-sm text-[var(--muted-foreground)]")}>
            Skill suggestions appear here once the catalog loads.
          </div>
        )}
        {!trimmedSearch && visibleSkills.length > 0 && <p className="text-center text-xs text-white/42">Can&apos;t find it? Type the skill name above.</p>}
      </div>
    </div>
  );
});
