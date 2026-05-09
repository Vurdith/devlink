"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { NotificationList } from "./NotificationList";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationsEmpty, NotificationsError, NotificationsLoading, NotificationsSignedOut } from "./NotificationStates";
import type { NotificationItem, NotificationTab } from "./notification-types";
import { groupNotificationRows, safeJson } from "./notification-utils";

const PAGE_SIZE = 40;

type NotificationsPagePayload = {
  notifications?: NotificationItem[];
  nextCursor?: string | null;
};

type NotificationErrorPayload = {
  error?: string;
};

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
  const activeFetchId = useRef(0);

  const unreadIds = useMemo(() => items.filter((item) => !item.readAt).map((item) => item.id), [items]);
  const visible = useMemo(() => (tab === "unread" ? items.filter((item) => !item.readAt) : items), [items, tab]);
  const groupedVisible = useMemo(() => groupNotificationRows(visible, tab), [visible, tab]);

  const resetNotifications = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(false);
  }, []);

  const applyNotificationPage = useCallback((data: NotificationsPagePayload | null, replace: boolean) => {
    const list = Array.isArray(data?.notifications) ? data.notifications : [];
    const next = data?.nextCursor ?? null;

    setItems((prev) => (replace ? list : [...prev, ...list]));
    setCursor(typeof next === "string" ? next : null);
    setHasMore(!!next);
  }, []);

  const fetchFirstPage = useCallback(async () => {
    if (status !== "authenticated") return;

    const fetchId = activeFetchId.current + 1;
    activeFetchId.current = fetchId;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/notifications?limit=${PAGE_SIZE}`, { cache: "no-store" });
      const data = await safeJson<NotificationsPagePayload & NotificationErrorPayload>(res);
      if (fetchId !== activeFetchId.current) return;

      if (!res.ok) {
        setError(String(data?.error || `Notifications could not load (${res.status}).`));
        resetNotifications();
        return;
      }

      applyNotificationPage(data, true);
    } catch {
      if (fetchId !== activeFetchId.current) return;
      setError("Notifications are not reachable right now. Check your connection, then try again.");
      resetNotifications();
    } finally {
      if (fetchId === activeFetchId.current) setLoading(false);
    }
  }, [applyNotificationPage, resetNotifications, status]);

  const fetchMore = async () => {
    if (!cursor || loadingMore || status !== "authenticated") return;

    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      const data = await safeJson<NotificationsPagePayload>(res);
      if (res.ok) applyNotificationPage(data, false);
      else setError("Older notifications did not load. Try the button again.");
    } catch {
      setError("Older notifications are not reachable right now. Check your connection, then try again.");
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
      activeFetchId.current += 1;
      resetNotifications();
      setError("");
      setLoading(false);
    }
  }, [fetchFirstPage, resetNotifications, status]);

  const postMarkRead = useCallback(async (body: { ids: string[] } | { all: true }) => {
    const res = await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  }, []);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0 || status !== "authenticated") return;

    try {
      const updated = await postMarkRead({ ids });
      if (!updated) return;

      const idsToMark = new Set(ids);
      const now = new Date().toISOString();
      setItems((prev) => prev.map((item) => (idsToMark.has(item.id) ? { ...item, readAt: item.readAt ?? now } : item)));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } catch {
      setError("Those notifications were not marked read. Try again.");
    }
  };

  const markAllRead = async () => {
    if (unreadIds.length === 0 || status !== "authenticated") return;

    setMarking(true);

    try {
      const updated = await postMarkRead({ all: true });
      if (!updated) return;

      const now = new Date().toISOString();
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? now })));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } catch {
      setError("Unread notifications were not marked read. Try again.");
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
