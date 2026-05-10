import { Button } from "@/components/ui/Button";
import { iconBox, surface, ui } from "@/components/ui/design-system";
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
    <div className="sticky top-0 z-20 -mx-4 mb-4 bg-[rgba(5,5,8,0.94)] px-4 pb-3 pt-2 sm:-mx-6 sm:px-6">
      <div className={surface("panelStrong", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className={iconBox("cyan", "h-10 w-10 shrink-0 text-white/80")}>
              <BellIcon />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-white font-[var(--font-space-grotesk)]">Notifications</h1>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span
                  className={[
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold tabular-nums",
                    unreadCount > 0
                      ? "border-[rgba(var(--color-accent-2-rgb),0.32)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
                      : "border-white/[0.08] bg-white/[0.035] text-white/45",
                  ].join(" ")}
                >
                  {unreadCount}
                </span>
                <span>unread</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkAllRead}
            disabled={marking || unreadCount === 0}
            isLoading={marking}
            className="w-full sm:w-auto"
          >
            Mark read
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1 sm:inline-grid sm:min-w-64">
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
    ? "border-[rgba(var(--color-accent-2-rgb),0.30)] bg-[rgba(var(--color-accent-2-rgb),0.12)] text-white"
    : "border-white/[0.14] bg-white/[0.08] text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
        isActive ? activeClass : `bg-transparent text-white/55 hover:text-white/85 ${ui.control.ghost}`,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
