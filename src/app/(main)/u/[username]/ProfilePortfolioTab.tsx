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
        <div className={surface("panelMuted", "relative mb-6 overflow-hidden p-4 sm:p-5")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <h3 className="text-base font-semibold text-white">
                  Your Portfolio
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {portfolioItems.length === 0
                    ? "Showcase your best work"
                    : `${portfolioItems.length} ${portfolioItems.length === 1 ? "item" : "items"} showcased`}
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
              Add Portfolio Item
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
        <div className={surface("empty", "px-6 py-14 text-center text-[var(--muted-foreground)]")}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[rgba(var(--color-accent-2-rgb),0.09)] border border-[rgba(var(--color-accent-2-rgb),0.18)] flex items-center justify-center">
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
          <p className="text-lg font-semibold text-white mb-2">
            {isOwner ? "Build out your portfolio" : "No public portfolio items"}
          </p>
          <p className="text-sm">
            {isOwner
              ? "Add your strongest work so visitors can understand what you make."
              : "This user hasn&apos;t shared their portfolio yet."}
          </p>
          {isOwner && (
            <Button
              variant="glow"
              size="md"
              onClick={onAddItem}
              className="mt-5"
            >
              Add Portfolio Item
            </Button>
          )}
        </div>
      )}
    </>
  );
}
