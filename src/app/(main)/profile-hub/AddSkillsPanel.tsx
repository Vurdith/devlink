import { memo, useMemo, useState } from "react";
import { ModalInput } from "@/components/ui/BaseModal";
import { OptionButton } from "@/components/ui/OptionCard";
import { iconBox, surface } from "@/components/ui/design-system";
import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/skills";
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
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "ALL">("ALL");
  const canAddMore = userSkillCount < 15;
  const trimmedSearch = skillSearch.trim();
  const normalizedSearch = trimmedSearch.toLowerCase();
  const isAddingSkill = Boolean(addingSkillId);
  const isBusy = isAddingSkill || isAddingCustomSkill;
  const userSkillIds = useMemo(() => new Set(userSkills.map((skill) => skill.skillId)), [userSkills]);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };

    for (const skill of allSkills) {
      if (userSkillIds.has(skill.id)) continue;
      counts.ALL += 1;
      counts[skill.category] = (counts[skill.category] ?? 0) + 1;
    }

    return counts;
  }, [allSkills, userSkillIds]);
  const categoryOptions = useMemo(
    () =>
      (["ALL", ...Object.keys(SKILL_CATEGORIES)] as Array<SkillCategory | "ALL">).filter(
        (category) => category === "ALL" || (categoryCounts[category] ?? 0) > 0
      ),
    [categoryCounts]
  );
  const visibleSkills = useMemo(() => {
    const matches: Skill[] = [];

    for (const skill of allSkills) {
      if (userSkillIds.has(skill.id)) continue;
      if (activeCategory !== "ALL" && skill.category !== activeCategory) continue;
      if (normalizedSearch && !skill.name.toLowerCase().includes(normalizedSearch)) continue;

      matches.push(skill);
      if (matches.length >= 24) break;
    }

    return matches;
  }, [activeCategory, allSkills, normalizedSearch, userSkillIds]);

  return (
    <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="relative">
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
          <div className={iconBox("cyan", "h-10 w-10")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Add skills</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Choose a lane, then add the exact work you offer.</p>
          </div>
          </div>
          <span className="hidden shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/55 sm:inline-flex">
            {userSkillCount}/15
          </span>
        </div>

        <div className="mb-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="grid gap-1 rounded-lg border border-white/[0.07] bg-black/[0.10] p-1.5">
            {categoryOptions.map((category) => {
              const isActive = activeCategory === category;
              const label = category === "ALL" ? "All" : SKILL_CATEGORIES[category].label;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  disabled={isBusy}
                  className={cn(
                    "flex min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]",
                    isActive
                      ? "border border-[rgba(var(--color-accent-2-rgb),0.28)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-white"
                      : "text-white/55 hover:bg-white/[0.045] hover:text-white/80"
                  )}
                >
                  <span className="truncate font-medium">{label}</span>
                  <span className="shrink-0 text-xs text-white/35">{categoryCounts[category] ?? 0}</span>
                </button>
              );
            })}
          </div>

          <div className="min-w-0">
            <ModalInput
              placeholder="Search skill name"
              value={skillSearch}
              onChange={(event) => setSkillSearch(event.target.value)}
              disabled={isBusy}
              aria-describedby="add-skills-feedback"
              className="mb-3"
            />

            <div className="grid max-h-80 min-w-0 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/[0.08] p-2 sm:grid-cols-2">
              {visibleSkills.map((skill) => {
                const isAddingThisSkill = addingSkillId === skill.id;
                const category = SKILL_CATEGORIES[skill.category as SkillCategory];

                return (
                  <OptionButton
                    key={skill.id}
                    onClick={async () => {
                      const didAdd = await onAddSkill(skill);
                      if (didAdd) setSkillSearch("");
                    }}
                    disabled={!canAddMore || isBusy}
                    aria-busy={isAddingThisSkill}
                    className="min-h-[74px] min-w-0 rounded-lg p-3 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{skill.name}</p>
                      <p className="mt-1 truncate text-xs text-white/42">{category?.label ?? "Other"}</p>
                    </div>
                    {isAddingThisSkill ? (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/60 border-r-transparent animate-spin" aria-hidden="true" />
                    ) : (
                      <span className="shrink-0 text-[var(--color-accent-2)]" aria-hidden="true">+</span>
                    )}
                  </OptionButton>
                );
              })}

              {trimmedSearch && visibleSkills.length === 0 && (
                <OptionButton
                  type="button"
                  onClick={async () => {
                    const didAdd = await onAddCustomSkill(trimmedSearch);
                    if (didAdd) setSkillSearch("");
                  }}
                  disabled={!canAddMore || isBusy}
                  selected
                  aria-busy={isAddingCustomSkill}
                  className="col-span-full min-w-0 rounded-lg p-3 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="min-w-0 flex-1 truncate">
                      {isAddingCustomSkill ? `Adding "${trimmedSearch}"...` : `Add "${trimmedSearch}"`}
                    </span>
                    {isAddingCustomSkill && (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/60 border-r-transparent animate-spin" aria-hidden="true" />
                    )}
                  </p>
                </OptionButton>
              )}
            </div>
          </div>
        </div>

        <p id="add-skills-feedback" className="sr-only" aria-live="polite">
          {isAddingCustomSkill ? "Adding your custom skill." : isAddingSkill ? "Adding skill to your profile." : ""}
        </p>

        {!trimmedSearch && visibleSkills.length === 0 && (
          <div className={surface("empty", "noise-overlay relative overflow-hidden px-4 py-5 text-center text-sm text-[var(--muted-foreground)]")}>
            No more skills in this lane.
          </div>
        )}
      </div>
    </div>
  );
});
