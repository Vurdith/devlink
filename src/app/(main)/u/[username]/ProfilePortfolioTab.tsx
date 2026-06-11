"use client";

import { PortfolioItemDisplay } from "@/components/portfolio/PortfolioItemDisplay";
import { Button } from "@/components/ui/Button";
import { iconBox, surface } from "@/components/ui/design-system";
import type { PortfolioItem } from "@/types/api";
import type { UserSkill } from "./ExpandableSkillCard";

interface ProfilePortfolioTabProps {
  portfolioItems: PortfolioItem[];
  isOwner: boolean;
  skills: UserSkill[];
  onAddItem: () => void;
  onEditItem: (item: PortfolioItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ProfilePortfolioTab({
  portfolioItems,
  isOwner,
  skills,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: ProfilePortfolioTabProps) {
  const primarySkill = skills.find((skill) => skill.isPrimary) ?? skills[0];
  const caseStudyPrompts = [
    "What problem you solved",
    "Your exact role and tools",
    "Screenshots, links, or outcomes",
  ];

  return (
    <>
      {isOwner && (
        <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:p-6")}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(900px 260px at 12% 0%, rgba(var(--color-accent-2-rgb),0.14), transparent 62%), radial-gradient(700px 220px at 100% 0%, rgba(var(--color-accent-rgb),0.10), transparent 58%)",
            }}
          />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className={iconBox("cyan", "h-10 w-10")}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white font-[var(--font-space-grotesk)]">
                  Portfolio
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {portfolioItems.length === 0
                    ? "Pick projects that show your role, result, and taste."
                    : `${portfolioItems.length} ${portfolioItems.length === 1 ? "case study" : "case studies"} published`}
                </p>
              </div>
            </div>
            <Button
              variant="glow"
              size="md"
              onClick={onAddItem}
              className="flex items-center gap-2.5 whitespace-nowrap"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add case study
            </Button>
          </div>
        </div>
      )}

      {portfolioItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {portfolioItems.map((item) => (
            <PortfolioItemDisplay
              key={item.id}
              item={item}
              isOwner={isOwner}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className={surface("empty", "noise-overlay relative overflow-hidden px-5 py-10 text-[var(--muted-foreground)] sm:px-6")}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              background:
                "radial-gradient(700px 260px at 50% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 62%)",
              }}
          />
          <div className="relative grid gap-6 text-left lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,1.05fr)] lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-3">
                <div className={iconBox("cyan", "h-12 w-12 shrink-0")}>
                  <svg
                    className="h-6 w-6 text-[var(--color-accent-2)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
                    Portfolio proof
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {isOwner ? "Publish one convincing case study" : "No public case studies"}
                  </h3>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-relaxed">
                {isOwner
                  ? "Start with the project that best proves what someone should hire you for. A clear role, result, and artifact beats a loose list of links."
                  : "No projects have been published yet."}
              </p>
              {isOwner && (
                <Button
                  variant="glow"
                  size="md"
                  onClick={onAddItem}
                  className="relative mt-5"
                >
                  Add first case study
                </Button>
              )}
            </div>

            {isOwner && (
              <div className="grid gap-2">
                {caseStudyPrompts.map((prompt, index) => (
                  <div
                    key={prompt}
                    className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[11px] font-semibold text-[var(--color-accent-2)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-white/74">{prompt}</span>
                  </div>
                ))}
                <p className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 text-xs leading-5 text-white/46">
                  {primarySkill
                    ? `Tip: link this project to ${primarySkill.skill.name} so it appears as evidence for that skill.`
                    : "Tip: add skills first if you want each project to reinforce a specific service."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
