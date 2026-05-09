import { FeedbackState } from "@/components/ui/FeedbackState";
import { surface } from "@/components/ui/design-system";
import type { NotificationTab } from "./notification-types";
import { BellIcon } from "./NotificationIcons";

export function NotificationsLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={surface("empty", "p-4")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-3 w-48 bg-white/10 rounded" />
              <div className="h-3 w-64 bg-white/5 rounded mt-2" />
            </div>
            <div className="h-3 w-12 bg-white/10 rounded" />
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
          ? "You are caught up. New mentions, replies, follows, and messages will appear here when they need attention."
          : "Activity from follows, replies, mentions, messages, and profile updates will collect here."
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
      description="Notifications are private to your account. Sign in to review replies, mentions, follows, and messages."
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
