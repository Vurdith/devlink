"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNowStrict } from "date-fns";

type NotificationType = "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";

type NotificationItem = {
  id: string;
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  actor: {
    id: string;
    username: string;
    name: string | null;
    profile: { avatarUrl: string | null; verified: boolean; profileType: string | null } | null;
  };
  post: { id: string; userId: string; content: string; createdAt: string } | null;
  sourcePost: { id: string; content: string; createdAt: string } | null;
};

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-accent)] text-black">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function TypeIcon({ type }: { type: NotificationType }) {
  const common = "w-4 h-4";
  switch (type) {
    case "LIKE":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.4-9.5-8.6C.8 9.3 2.6 6 6 6c1.9 0 3.1 1 4 2.1C10.9 7 12.1 6 14 6c3.4 0 5.2 3.3 3.5 6.4C19 16.6 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "REPOST":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 12l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 17H6v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 12l-2 2m2-2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "REPLY":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 9V5l-7 7 7 7v-4c7 0 10 2 11 6-1-8-4-12-11-12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "FOLLOW":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
          <path d="M19 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "MENTION":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 8a4 4 0 1 0 0 8c1.7 0 3.1-1.2 3.6-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 12v-1a8 8 0 1 0 2.3 5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

function labelFor(n: NotificationItem) {
  switch (n.type) {
    case "LIKE":
      return "liked your post";
    case "REPOST":
      return "reposted your post";
    case "REPLY":
      return "replied to your post";
    case "FOLLOW":
      return "followed you";
    case "MENTION":
      return "mentioned you";
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const unreadIds = useMemo(() => items.filter((i) => !i.readAt).map((i) => i.id), [items]);
  const visible = useMemo(() => (tab === "unread" ? items.filter((i) => !i.readAt) : items), [items, tab]);

  const fetchFirstPage = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications?limit=40", { cache: "no-store" });
      const data = await safeJson(res);
      if (!res.ok) {
        const msg = (data as any)?.error || `Failed to load notifications (${res.status})`;
        setError(String(msg));
        setItems([]);
        setCursor(null);
        setHasMore(false);
        return;
      }
      const list = Array.isArray((data as any)?.notifications) ? (data as any).notifications : [];
      setItems(list);
      const next = (data as any)?.nextCursor ?? null;
      setCursor(typeof next === "string" ? next : null);
      setHasMore(!!next);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?limit=40&cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      const data = await safeJson(res);
      if (!res.ok) return;
      const list = Array.isArray((data as any)?.notifications) ? (data as any).notifications : [];
      setItems((prev) => [...prev, ...list]);
      const next = (data as any)?.nextCursor ?? null;
      setCursor(typeof next === "string" ? next : null);
      setHasMore(!!next);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchFirstPage();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) return;
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n)));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } catch {}
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      // If it fails, don't optimistically update.
      if (!res.ok) return;
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      window.dispatchEvent(new CustomEvent("devlink:notifications-updated"));
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/80">
            <BellIcon />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-[var(--font-space-grotesk)]">Notifications</div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {unreadIds.length} unread
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={fetchFirstPage} disabled={loading || loadingMore}>
            Refresh
          </Button>
          <Button size="sm" variant="ghost" onClick={markAllRead} disabled={marking || unreadIds.length === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={[
            "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
            tab === "all"
              ? "bg-white/10 border-white/15 text-white"
              : "bg-transparent border-white/10 text-white/55 hover:bg-white/5 hover:text-white/80",
          ].join(" ")}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setTab("unread")}
          className={[
            "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
            tab === "unread"
              ? "bg-[rgba(var(--color-accent-rgb),0.12)] border-[rgba(var(--color-accent-rgb),0.30)] text-white"
              : "bg-transparent border-white/10 text-white/55 hover:bg-white/5 hover:text-white/80",
          ].join(" ")}
        >
          Unread
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
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
        ) : error ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-white/80 font-semibold">Couldn’t load notifications</div>
            <div className="mt-1 text-sm text-[var(--muted-foreground)]">{error}</div>
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={fetchFirstPage}>
                Retry
              </Button>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-white/80 font-semibold">You’re all caught up</div>
            <div className="mt-1 text-sm text-[var(--muted-foreground)]">
              {tab === "unread" ? "No unread notifications." : "No notifications yet."}
            </div>
          </div>
        ) : (
          <>
            {visible.map((n) => {
              const primary = n.actor?.name || n.actor?.username || "Someone";
              const href =
                n.post?.id ? `/p/${n.post.id}` : n.type === "FOLLOW" ? `/u/${n.actor.username}` : "#";
              const when = safeDistance(n.createdAt);
              const avatarUrl = n.actor?.profile?.avatarUrl || null;
              const verified = !!n.actor?.profile?.verified;

              return (
                <Link
                  key={n.id}
                  href={href}
                  onClick={() => {
                    if (!n.readAt) void markRead([n.id]);
                  }}
                  className={[
                    "block rounded-2xl border p-4 transition-colors",
                    n.readAt
                      ? "border-white/10 bg-white/5 hover:bg-white/7"
                      : "border-[rgba(var(--color-accent-rgb),0.30)] bg-[rgba(var(--color-accent-rgb),0.10)] hover:bg-[rgba(var(--color-accent-rgb),0.14)]",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar size={40} src={avatarUrl} alt={primary} />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-white/10 bg-[var(--color-card)] grid place-items-center text-white/80">
                        <TypeIcon type={n.type} />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-white/90 flex items-center gap-2 min-w-0">
                            <span className="font-semibold truncate">{primary}</span>
                            {verified ? <VerifiedBadge /> : null}
                            <span className="text-white/60 truncate">{labelFor(n)}.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-[11px] text-white/45 tabular-nums">{when}</div>
                          {!n.readAt ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                          ) : null}
                        </div>
                      </div>

                      {n.post?.content ? (
                        <div className="mt-2 text-sm text-white/55 line-clamp-2">
                          {n.post.content}
                        </div>
                      ) : null}
                      {n.sourcePost?.content && n.type === "REPLY" ? (
                        <div className="mt-2 text-sm text-white/55 line-clamp-2">
                          Reply: {n.sourcePost.content}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}

            {hasMore ? (
              <div className="pt-2 flex justify-center">
                <Button size="sm" variant="secondary" onClick={fetchMore} disabled={loadingMore}>
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function safeDistance(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}


