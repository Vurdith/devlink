"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { NotificationList } from "./NotificationList";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationsEmpty, NotificationsError, NotificationsLoading, NotificationsSignedOut } from "./NotificationStates";
import type { NotificationItem, NotificationTab } from "./notification-types";
import { groupNotificationRows, safeJson } from "./notification-utils";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<NotificationTab>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const unreadIds = useMemo(() => items.filter((item) => !item.readAt).map((item) => item.id), [items]);
  const visible = useMemo(() => (tab === "unread" ? items.filter((item) => !item.readAt) : items), [items, tab]);
  const groupedVisible = useMemo(() => groupNotificationRows(visible, tab), [visible, tab]);

  const applyNotificationPage = useCallback((data: unknown, replace: boolean) => {
    const json = data as { notifications?: NotificationItem[]; nextCursor?: string };
    const list = Array.isArray(json?.notifications) ? json.notifications : [];
    const next = json?.nextCursor ?? null;

    setItems((prev) => (replace ? list : [...prev, ...list]));
    setCursor(typeof next === "string" ? next : null);
    setHasMore(!!next);
  }, []);

  const fetchFirstPage = useCallback(async () => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notifications?limit=40", { cache: "no-store" });
      const data = await safeJson(res);

      if (!res.ok) {
        const json = data as { error?: string };
        setError(String(json?.error || `Failed to load notifications (${res.status})`));
        setItems([]);
        setCursor(null);
        setHasMore(false);
        return;
      }

      applyNotificationPage(data, true);
    } catch {
      setError("Unable to reach notifications. Check your connection and try again.");
      setItems([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [applyNotificationPage, status]);

  const fetchMore = async () => {
    if (!cursor || loadingMore || status !== "authenticated") return;

    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?limit=40&cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      const data = await safeJson(res);
      if (res.ok) applyNotificationPage(data, false);
      else setError("Unable to load more notifications. Please try again.");
    } catch {
      setError("Unable to load more notifications. Check your connection and try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void fetchFirstPage();
      return;
    }

    if (status === "unauthenticated") {
      setItems([]);
      setCursor(null);
      setHasMore(false);
      setError("");
      setLoading(false);
    }
  }, [fetchFirstPage, status]);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0 || status !== "authenticated") return;

    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) return;

      const now = new Date().toISOString();
      setItems((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, readAt: item.readAt ?? now } : item)));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } catch {
      setError("Unable to mark notifications as read. Please try again.");
    }
  };

  const markAllRead = async () => {
    if (unreadIds.length === 0 || status !== "authenticated") return;

    setMarking(true);

    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) return;

      const now = new Date().toISOString();
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? now })));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } catch {
      setError("Unable to mark all notifications as read. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <NotificationsHeader
        unreadCount={unreadIds.length}
        tab={tab}
        marking={marking}
        onMarkAllRead={markAllRead}
        onTabChange={setTab}
      />

      <div className="space-y-2">
        {status === "unauthenticated" ? (
          <NotificationsSignedOut />
        ) : loading || status === "loading" ? (
          <NotificationsLoading />
        ) : error ? (
          <NotificationsError error={error} onRetry={fetchFirstPage} />
        ) : visible.length === 0 ? (
          <NotificationsEmpty tab={tab} />
        ) : (
          <NotificationList
            rows={groupedVisible}
            currentUserId={currentUserId}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onFetchMore={fetchMore}
            onMarkRead={(ids) => void markRead(ids)}
          />
        )}
      </div>
    </div>
  );
}
