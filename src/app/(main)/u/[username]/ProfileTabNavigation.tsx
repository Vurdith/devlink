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
      className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[rgba(8,11,16,0.78)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:mb-6"
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
            aria-pressed={activeTab === tab.id}
            className={`relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
              activeTab === tab.id
                ? "border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[rgba(var(--color-accent-2-rgb),0.14)] text-white shadow-[0_8px_24px_rgba(var(--color-accent-2-rgb),0.13)]"
                : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span
              className={`flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4 ${activeTab === tab.id ? "text-[var(--color-accent-2)]" : ""}`}
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
