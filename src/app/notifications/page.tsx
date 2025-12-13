"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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

  const unreadIds = useMemo(() => items.filter((i) => !i.readAt).map((i) => i.id), [items]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/notifications?limit=60", { cache: "no-store" });
        const data = await safeJson(res);
        if (!res.ok) {
          const msg = (data as any)?.error || `Failed to load notifications (${res.status})`;
          if (!cancelled) setError(String(msg));
          if (!cancelled) setItems([]);
          return;
        }
        if (!cancelled) setItems(Array.isArray((data as any)?.notifications) ? (data as any).notifications : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
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
        <Button size="sm" variant="ghost" onClick={markAllRead} disabled={marking || unreadIds.length === 0}>
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-[var(--muted-foreground)]">Loading…</div>
        ) : error ? (
          <div className="text-[var(--muted-foreground)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-[var(--muted-foreground)]">No notifications yet.</div>
        ) : (
          items.map((n) => {
            const primary = n.actor?.name || n.actor?.username || "Someone";
            const href =
              n.post?.id ? `/p/${n.post.id}` : n.type === "FOLLOW" ? `/u/${n.actor.username}` : "#";
            return (
              <Link
                key={n.id}
                href={href}
                className={[
                  "block rounded-2xl border p-4 transition-colors",
                  n.readAt ? "border-white/10 bg-white/5 hover:bg-white/7" : "border-[rgba(var(--color-accent-rgb),0.30)] bg-[rgba(var(--color-accent-rgb),0.10)] hover:bg-[rgba(var(--color-accent-rgb),0.14)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white/90">
                      <span className="font-semibold">{primary}</span>{" "}
                      <span className="text-white/70">{labelFor(n)}.</span>
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
                  {!n.readAt ? (
                    <span className="mt-1 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
                  ) : null}
                </div>
              </Link>
            );
          })
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


