import { FeedbackState } from "@/components/ui/FeedbackState";
import { skeleton, surface } from "@/components/ui/design-system";
import type { NotificationTab } from "./notification-types";
import { BellIcon } from "./NotificationIcons";

export function NotificationsLoading() {
  return (
    <div className="space-y-2" aria-label="Loading notifications">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={surface("panelMuted", "relative overflow-hidden p-4 sm:p-5")}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={skeleton("h-10 w-10 shrink-0 rounded-full")} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className={skeleton("h-4 w-44 max-w-full")} />
                <div className={skeleton("h-3 w-20")} />
              </div>
              <div className={skeleton("mt-3 h-3 w-full")} />
              <div className={skeleton("mt-2 h-3 w-4/5")} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <FeedbackState
      tone="danger"
      icon={<WarningIcon />}
      title="Could not load notifications"
      description={error}
      action={{ label: "Retry", onClick: onRetry }}
      className="py-10"
    />
  );
}

export function NotificationsEmpty({ tab }: { tab: NotificationTab }) {
  return (
    <FeedbackState
      icon={<BellIcon />}
      title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
      description={
        tab === "unread"
          ? "You are caught up. New replies, follows, messages, and job updates will appear here."
          : "Replies, follows, reviews, messages, and job updates will appear here."
      }
      className="py-12"
    />
  );
}

export function NotificationsSignedOut() {
  return (
    <FeedbackState
      icon={<BellIcon />}
      title="Sign in to see notifications"
      description="Sign in to review replies, follows, messages, reviews, and job updates."
      action={{ label: "Sign in", href: "/login?callbackUrl=/notifications" }}
      className="py-12"
    />
  );
}

function WarningIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
