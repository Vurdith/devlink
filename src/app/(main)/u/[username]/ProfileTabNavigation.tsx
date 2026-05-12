"use client";

import { SegmentedTabs, type SegmentedTabItem } from "@/components/ui/SegmentedTabs";
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
  const items: SegmentedTabItem<TabType>[] = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    hidden: Boolean(tab.private && !canSeePrivateTabs),
  }));

  return (
    <SegmentedTabs
      items={items}
      value={activeTab}
      onValueChange={onTabChange}
      ariaLabel="Profile sections"
      className="mb-4 sm:mb-6"
    />
  );
}
