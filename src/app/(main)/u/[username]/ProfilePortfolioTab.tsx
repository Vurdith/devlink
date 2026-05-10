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
  onAddItem,
  onEditItem,
  onDeleteItem,
}: ProfilePortfolioTabProps) {
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
                    ? "Curate the work visitors should judge you by."
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
        <div className={surface("empty", "noise-overlay relative overflow-hidden px-5 py-14 text-center text-[var(--muted-foreground)] sm:px-6")}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              background:
                "radial-gradient(700px 260px at 50% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 62%)",
            }}
          />
          <div className="relative mb-4 flex justify-center">
            <div className={iconBox("cyan", "h-16 w-16")}>
              <svg
                className="w-8 h-8 text-[var(--color-accent-2)]"
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
          </div>
          <p className="relative mb-2 text-lg font-semibold text-white">
            {isOwner ? "Start with one excellent case study" : "No public case studies"}
          </p>
          <p className="relative mx-auto max-w-md text-sm leading-relaxed">
            {isOwner
              ? "Show the result, your role, and why the work mattered. One polished project is better than five loose links."
              : "This user has not shared portfolio work yet."}
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
      )}
    </>
  );
}
