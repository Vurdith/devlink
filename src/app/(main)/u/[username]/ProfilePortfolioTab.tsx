"use client";

import { PortfolioItemDisplay } from "@/components/portfolio/PortfolioItemDisplay";
import { Button } from "@/components/ui/Button";
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
        <div className="relative overflow-hidden mb-8 p-5 rounded-2xl glass-soft border border-white/10">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-55"
            style={{
              background:
                "radial-gradient(900px 260px at 20% 0%, rgba(var(--color-accent-rgb),0.12), transparent 62%), radial-gradient(700px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.08), transparent 60%)",
            }}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[rgba(var(--color-accent-rgb),0.3)]">
                <svg
                  className="w-5 h-5 text-white"
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
                <p className="text-sm text-[rgba(var(--color-accent-rgb),0.8)]">
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
        <div className="grid grid-cols-1 gap-6">
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
      ) : !isOwner ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[rgba(var(--color-accent-rgb),0.6)]"
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
          <p className="text-lg font-medium mb-2">No public portfolio items</p>
          <p className="text-sm">
            This user hasn&apos;t shared their portfolio yet.
          </p>
        </div>
      ) : null}
    </>
  );
}
