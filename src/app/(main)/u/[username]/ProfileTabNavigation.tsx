"use client";

import { cn } from "@/lib/cn";
import { surface } from "@/components/ui/design-system";
import type { TabType } from "./profile-types";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  private?: boolean;
}

interface ProfileTabNavigationProps {
  tabs: Tab[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  canSeePrivateTabs: boolean;
}

export function ProfileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  canSeePrivateTabs,
}: ProfileTabNavigationProps) {
  return (
    <div
      className={surface(
        "toolbar",
        "noise-overlay relative mb-4 overflow-hidden p-1.5 sm:mb-6"
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(13,17,24,0.82), rgba(8,11,16,0.72))",
      }}
    >
      <div
        className="flex gap-1 overflow-x-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((tab) => {
          if (tab.private && !canSeePrivateTabs) return null;
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-pressed={selected}
              className={cn(
                "group relative flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm",
                selected
                  ? "border-[rgba(var(--color-accent-2-rgb),0.28)] bg-[rgba(var(--color-accent-2-rgb),0.09)] text-white"
                  : "border-transparent text-white/52 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/86"
              )}
            >
              {selected ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-px rounded-full bg-[var(--color-accent-2)]"
                />
              ) : null}
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md transition-colors [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4",
                  selected
                    ? "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)]"
                    : "text-white/45 group-hover:text-white/72"
                )}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
