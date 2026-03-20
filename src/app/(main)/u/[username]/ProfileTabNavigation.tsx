"use client";

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
      className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto glass-soft rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-white/10"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {tabs.map((tab) => {
        if (tab.private && !canSeePrivateTabs) return null;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium transition-all duration-200 flex-shrink-0 rounded-lg sm:rounded-xl whitespace-nowrap ${
              activeTab === tab.id
                ? "text-white bg-[rgba(var(--color-accent-rgb),0.14)] border border-[rgba(var(--color-accent-rgb),0.28)]"
                : "text-[var(--muted-foreground)] hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <span
              className={`flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 ${activeTab === tab.id ? "text-[var(--color-accent)]" : ""}`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
