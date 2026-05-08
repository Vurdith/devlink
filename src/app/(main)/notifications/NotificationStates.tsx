import { Button } from "@/components/ui/Button";
import type { NotificationTab } from "./notification-types";

export function NotificationsLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-white/80 font-semibold">Could not load notifications</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{error}</div>
      <div className="mt-4">
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

export function NotificationsEmpty({ tab }: { tab: NotificationTab }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="text-white/80 font-semibold">You are all caught up</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">
        {tab === "unread" ? "No unread notifications." : "No notifications yet."}
      </div>
    </div>
  );
}
