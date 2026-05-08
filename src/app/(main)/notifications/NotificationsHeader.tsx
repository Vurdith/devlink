import { Button } from "@/components/ui/Button";
import type React from "react";
import { BellIcon } from "./NotificationIcons";
import type { NotificationTab } from "./notification-types";

interface NotificationsHeaderProps {
  unreadCount: number;
  tab: NotificationTab;
  marking: boolean;
  onMarkAllRead: () => void;
  onTabChange: (tab: NotificationTab) => void;
}

export function NotificationsHeader({ unreadCount, tab, marking, onMarkAllRead, onTabChange }: NotificationsHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 mb-4">
      <div className="glass-soft border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/80">
              <BellIcon />
            </div>
            <div>
              <div className="text-xl font-bold text-white font-[var(--font-space-grotesk)]">Notifications</div>
              <div className="text-sm text-[var(--muted-foreground)]">{unreadCount} unread</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onMarkAllRead} disabled={marking || unreadCount === 0}>
            Mark all read
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <TabButton isActive={tab === "all"} onClick={() => onTabChange("all")}>
            All
          </TabButton>
          <TabButton isActive={tab === "unread"} isAccent onClick={() => onTabChange("unread")}>
            Unread
          </TabButton>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  isActive,
  isAccent = false,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  isAccent?: boolean;
  onClick: () => void;
}) {
  const activeClass = isAccent
    ? "bg-[rgba(var(--color-accent-rgb),0.12)] border-[rgba(var(--color-accent-rgb),0.30)] text-white"
    : "bg-white/10 border-white/15 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
        isActive ? activeClass : "bg-transparent border-white/10 text-white/55 hover:bg-white/5 hover:text-white/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
