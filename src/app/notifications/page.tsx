"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import { useSession } from "next-auth/react";

type NotificationType = "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";

type NotificationItem = {
  id: string;
  groupIds?: string[];
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  actor: {
    id: string;
    username: string;
    name: string | null;
    profile: { avatarUrl: string | null; verified: boolean; profileType: string | null } | null;
  };
  actors?: Array<{
    actor: {
      id: string;
      username: string;
      name: string | null;
      profile: { avatarUrl: string | null; verified: boolean; profileType: string | null } | null;
    };
    createdAt: string;
  }>;
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
  const common = "w-[18px] h-[18px]";
  const small = "w-[16px] h-[16px]";
  switch (type) {
    case "LIKE":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.4-9.5-8.6C.8 9.3 2.6 6 6 6c1.9 0 3.1 1 4 2.1C10.9 7 12.1 6 14 6c3.4 0 5.2 3.3 3.5 6.4C19 16.6 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "REPOST":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h11v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18 12l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M17 17H6v-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M6 12l-2 2m2-2l2 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "REPLY":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 9V5l-7 7 7 7v-4c7 0 10 2 11 6-1-8-4-12-11-12Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
    case "FOLLOW":
      return (
        <svg className={small} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
          <path d="M19 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "MENTION":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 8a4 4 0 1 0 0 8c1.7 0 3.1-1.2 3.6-2.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M20 12v-1a8 8 0 1 0 2.3 5.7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
  }
}

function typeBadgeClasses(type: NotificationType) {
  switch (type) {
    case "LIKE":
      return "text-rose-300 border-rose-400/50";
    case "REPOST":
      return "text-emerald-300 border-emerald-400/50";
    case "REPLY":
      return "text-blue-300 border-blue-400/50";
    case "FOLLOW":
      return "text-violet-300 border-violet-400/50";
    case "MENTION":
      return "text-amber-300 border-amber-400/50";
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

function stackedActors(n: NotificationItem) {
  const list = (n.actors ?? [])
    .map((x) => x?.actor)
    .filter(Boolean) as NonNullable<NotificationItem["actor"]>[];

  // Fallback to single actor when API doesn't include actors.
  if (list.length === 0 && n.actor) return [n.actor];
  return list;
}

function stackedLabel(n: NotificationItem) {
  const a = stackedActors(n);
  const names = a
    .map((x) => x.name || x.username)
    .filter(Boolean) as string[];
  const first = names[0] || "Someone";
  if (names.length <= 1) return { who: first, rest: "" };
  const second = names[1];
  const remaining = names.length - 2;
  if (remaining <= 0) return { who: `${first} and ${second}`, rest: "" };
  return { who: `${first}, ${second}`, rest: `and ${remaining} others` };
}

function compactPreviewText(s: string) {
  // Notifications should read like X: compact, single-paragraph snippets.
  return s.replace(/\s+/g, " ").trim();
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id as string | undefined;
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

  const groupedVisible = useMemo(() => {
    type Row =
      | { kind: "header"; label: string; key: string }
      | { kind: "section"; label: string; key: string }
      | { kind: "item"; n: NotificationItem; key: string };
    const rows: Row[] = [];

    const pushByDay = (list: NotificationItem[], prefix: string) => {
      let lastKey = "";
      for (const n of list) {
        const d = new Date(n.createdAt);
        const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (dayKey !== lastKey) {
          lastKey = dayKey;
          const label = isToday(d)
            ? "Today"
            : isYesterday(d)
              ? "Yesterday"
              : format(d, d.getFullYear() === new Date().getFullYear() ? "MMM d" : "MMM d, yyyy");
          rows.push({ kind: "header", label, key: `${prefix}:h:${dayKey}` });
        }
        rows.push({ kind: "item", n, key: `${prefix}:n:${n.id}` });
      }
    };

    if (tab === "all") {
      const unread = visible.filter((n) => !n.readAt);
      const read = visible.filter((n) => n.readAt);
      if (unread.length) {
        rows.push({ kind: "section", label: "Unread", key: "section:unread" });
        pushByDay(unread, "u");
      }
      if (read.length) {
        rows.push({ kind: "section", label: "Earlier", key: "section:read" });
        pushByDay(read, "r");
      }
      return rows;
    }

    pushByDay(visible, "all");
    return rows;
  }, [visible, tab]);

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
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 mb-4">
        <div className="glass-soft border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/80">
                <BellIcon />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-[var(--font-space-grotesk)]">Notifications</div>
                <div className="text-sm text-[var(--muted-foreground)]">{unreadIds.length} unread</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={markAllRead} disabled={marking || unreadIds.length === 0}>
                Mark all read
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
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
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                tab === "unread"
                  ? "bg-[rgba(var(--color-accent-rgb),0.12)] border-[rgba(var(--color-accent-rgb),0.30)] text-white"
                  : "bg-transparent border-white/10 text-white/55 hover:bg-white/5 hover:text-white/80",
              ].join(" ")}
            >
              Unread
            </button>
          </div>
        </div>
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
            {groupedVisible.map((row, index) => {
              if (row.kind === "section") {
                return (
                  <div key={row.key} className="pt-6 pb-2">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 tracking-wide uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      {row.label}
                    </div>
                  </div>
                );
              }

              if (row.kind === "header") {
                return (
                  <div key={row.key} className="pt-4 pb-2">
                    <div className="text-xs font-semibold text-white/45 tracking-wide uppercase">{row.label}</div>
                  </div>
                );
              }

              const n = row.n;
              const who = stackedLabel(n);
              const primary = who.who;
              const href = n.post?.id ? `/p/${n.post.id}` : n.type === "FOLLOW" ? `/u/${n.actor.username}` : "#";
              const when = safeDistance(n.createdAt);
              const a = stackedActors(n);
              const verified = !!a[0]?.profile?.verified;
              const avatarStack = a.slice(0, 3).map((x) => ({
                id: x.id,
                username: x.username,
                name: x.name || x.username,
                avatarUrl: x.profile?.avatarUrl || null,
                verified: !!x.profile?.verified,
                profileType: x.profile?.profileType || null,
              }));
              const markIds = Array.isArray(n.groupIds) && n.groupIds.length ? n.groupIds : [n.id];
              const prevIsItem = groupedVisible[index - 1]?.kind === "item";
              const nextIsItem = groupedVisible[index + 1]?.kind === "item";

              const go = () => {
                if (!n.readAt) void markRead(markIds);
                if (href !== "#") router.push(href);
              };

              return (
                <div
                  key={row.key}
                  role="button"
                  tabIndex={0}
                  onClick={go}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      go();
                    }
                  }}
                  className={[
                    "group relative rounded-2xl p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-rgb),0.45)] border border-white/10 hover:border-white/20",
                    n.readAt
                      ? "glass-soft"
                      : "glass-soft bg-[rgba(var(--color-accent-rgb),0.10)] border-[rgba(var(--color-accent-rgb),0.35)] shadow-[0_0_35px_rgba(var(--color-accent-rgb),0.18)]",
                  ].join(" ")}
                  aria-label="Notification"
                >
                  {!n.readAt ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent-2)] to-[var(--color-accent-3)]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-2xl border border-[rgba(var(--color-accent-rgb),0.45)] pointer-events-none"
                      />
                    </>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 w-px bg-white/10"
                        style={{
                          top: prevIsItem ? "-10px" : "38px",
                          bottom: nextIsItem ? "-10px" : "38px",
                        }}
                      />
                      <div className="flex items-center -space-x-3">
                        {avatarStack.map((av, idx) => (
                          <div
                            key={av.id}
                            className={[
                              "rounded-full overflow-hidden flex items-center justify-center ring-2 ring-[var(--color-background)]",
                              idx === 0 ? "w-10 h-10" : "w-9 h-9",
                            ].join(" ")}
                          >
                            <ProfileTooltip
                              user={{
                                id: av.id,
                                username: av.username,
                                name: av.name,
                                profile: {
                                  avatarUrl: av.avatarUrl,
                                  profileType: av.profileType,
                                  verified: av.verified,
                                },
                              }}
                              currentUserId={currentUserId}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!n.readAt) void markRead(markIds);
                                  router.push(`/u/${av.username}`);
                                }}
                                className="block w-10 h-10 leading-none"
                                aria-label={`Open profile for ${av.name}`}
                              >
                                <Avatar src={av.avatarUrl} alt={av.name} className="w-full h-full border-0" />
                              </div>
                            </ProfileTooltip>
                          </div>
                        ))}
                      </div>
                      {a.length > 1 ? (
                        <span className="absolute -top-2 -right-2 rounded-full bg-white/10 border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                          +{a.length - 1}
                        </span>
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-white/90 flex items-center gap-2 min-w-0">
                            <span className="font-semibold truncate">{primary}</span>
                            {verified ? <VerifiedBadge /> : null}
                            <span className="text-white/60 truncate">
                              {who.rest ? `${who.rest} ` : ""}
                              {labelFor(n)}.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={[
                              "w-7 h-7 rounded-full border bg-white/5 flex items-center justify-center",
                              typeBadgeClasses(n.type),
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <TypeIcon type={n.type} />
                          </span>
                          <div className="text-[11px] text-white/45 tabular-nums">{when}</div>
                          {!n.readAt ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void markRead(markIds);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-white/10 text-white/65 hover:text-white"
                              aria-label="Mark as read"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M20 6L9 17l-5-5"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Post / reply preview (X-style: compact snippets, threaded for replies) */}
                      {n.type === "REPLY" && (n.sourcePost?.content || n.post?.content) ? (
                        <div className="mt-2 relative rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 pl-5 text-sm text-white/60">
                          <span className="absolute left-2 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
                          <span className="absolute left-1.5 top-2 w-2 h-2 rounded-full bg-white/25" aria-hidden="true" />
                          {n.sourcePost?.content ? (
                            <div className="line-clamp-3 break-words">
                              {compactPreviewText(n.sourcePost.content)}
                            </div>
                          ) : null}

                          {n.post?.content ? (
                            <div className="mt-2 pl-3 border-l border-white/10">
                              <div className="line-clamp-3 break-words text-white/70">
                                {compactPreviewText(n.post.content)}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : n.post?.content ? (
                        <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-white/60 line-clamp-2 break-words">
                          {compactPreviewText(n.post.content)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
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


