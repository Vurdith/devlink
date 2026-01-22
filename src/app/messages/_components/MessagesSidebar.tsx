"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { Avatar } from "@/components/ui/Avatar";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import type { MessageRequest, MessageThread } from "@/types/api";

type UserSearchResult = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  verified: boolean;
  profileType: string | null;
  bio: string | null;
  isFollowing: boolean;
  isYou: boolean;
};

export function MessagesSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userId = (session?.user as any)?.id as string | undefined;
  const isThreadRoute = pathname.startsWith("/messages/");

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MessageRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");
  const currentUserName = session?.user?.name || session?.user?.email || "You";
  const currentUserAvatar = (session?.user as any)?.image as string | undefined;

  useMessagesRealtime(undefined, (newMessage) => {
    setThreads((prev) => {
      const index = prev.findIndex((t) => t.id === newMessage.conversationId);
      if (index === -1) return prev;
      const thread = { ...prev[index], lastMessageAt: newMessage.createdAt };
      const rest = prev.filter((_, i) => i !== index);
      return [thread, ...rest];
    });
  });

  const requestCount = incomingRequests.length;
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    return threads.filter((thread) => {
      const other = thread.userAId === userId ? thread.userB : thread.userA;
      const name = `${other?.username || ""} ${other?.name || ""}`.toLowerCase();
      return name.includes(searchQuery.trim().toLowerCase());
    });
  }, [threads, searchQuery, userId]);

  const { recentThreads, olderThreads } = useMemo(() => {
    const now = Date.now();
    const recent: MessageThread[] = [];
    const older: MessageThread[] = [];
    filteredThreads.forEach((thread) => {
      const ts = thread.lastMessageAt ? new Date(thread.lastMessageAt).getTime() : 0;
      if (ts && now - ts < 7 * 24 * 60 * 60 * 1000) {
        recent.push(thread);
      } else {
        older.push(thread);
      }
    });
    return { recentThreads: recent, olderThreads: older };
  }, [filteredThreads]);

  const presenceFor = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const score = Math.abs(hash) % 100;
    if (score < 25) return { label: "Online", tone: "bg-emerald-400" };
    if (score < 55) return { label: "Away", tone: "bg-amber-400" };
    return { label: "Offline", tone: "bg-white/30" };
  };

  const lastActiveLabel = (date?: Date | string | null) => {
    if (!date) return "No activity";
    const ts = typeof date === "string" ? new Date(date) : date;
    const diffMins = Math.max(0, Math.floor((Date.now() - ts.getTime()) / 60000));
    if (diffMins < 1) return "just now";
    if (diffMins < 5) return "Active now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/messages/threads");
      const data = await safeJson<MessageThread[]>(res);
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch("/api/messages/requests?type=incoming"),
        fetch("/api/messages/requests?type=outgoing"),
      ]);
      const incomingData = await safeJson<MessageRequest[]>(incomingRes);
      const outgoingData = await safeJson<MessageRequest[]>(outgoingRes);
      if (isMounted) {
        setThreads(data || []);
        setIncomingRequests(incomingData || []);
        setOutgoingRequests(outgoingData || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    let active = true;
    const timeout = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await safeJson<{ users: UserSearchResult[] }>(res);
      if (active) {
        setSearchResults(data?.users || []);
        setSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  async function startThread({ otherUserId, otherUsername }: { otherUserId?: string; otherUsername?: string }) {
    if (!otherUserId && !otherUsername) return;
    setCreating(true);
    const res = await fetch("/api/messages/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId, username: otherUsername }),
    });
    const data = await safeJson<{ type?: string; thread?: MessageThread; request?: MessageRequest; error?: string }>(res);
    if (res.ok && data?.type === "thread" && data.thread) {
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === data.thread!.id);
        return exists ? prev : [data.thread!, ...prev];
      });
      setSearchQuery("");
    } else if (res.ok && data?.type === "request" && data.request) {
      setOutgoingRequests((prev) => [data.request!, ...prev]);
      setSearchQuery("");
      alert("Message request sent.");
    } else {
      alert(data?.error || "Unable to start thread");
    }
    setCreating(false);
  }

  async function handleRequest(requestId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch(`/api/messages/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await safeJson<{ request?: MessageRequest; thread?: MessageThread; error?: string }>(res);
    if (!res.ok) {
      alert(data?.error || "Unable to update request");
      return;
    }

    setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));
    if (status === "ACCEPTED" && data?.thread) {
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === data.thread!.id);
        return exists ? prev : [data.thread!, ...prev];
      });
    }
  }

  return (
    <aside
      className={cn(
        "space-y-4",
        isThreadRoute ? "hidden lg:block" : "block"
      )}
    >
      {!userId ? (
        <div className="glass-soft border border-white/10 rounded-2xl p-4 text-sm text-[var(--muted-foreground)]">
          Sign in to view messages.
        </div>
      ) : (
        <>
          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Avatar size={42} src={currentUserAvatar} />
              <div>
                <div className="text-sm font-semibold text-white">{currentUserName}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">Messaging hub</div>
              </div>
            </div>
          </div>

          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">Inbox</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">Your conversations</div>
              </div>
              {requestCount > 0 && (
                <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(var(--color-accent-rgb),0.18)] text-[var(--color-accent)] border border-[rgba(var(--color-accent-rgb),0.35)]">
                  {requestCount} request{requestCount > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("inbox")}
                className={cn(
                  "flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                  activeTab === "inbox"
                    ? "bg-[rgba(var(--color-accent-rgb),0.2)] text-white border border-[rgba(var(--color-accent-rgb),0.35)]"
                    : "bg-white/5 text-[var(--muted-foreground)] border border-white/10 hover:text-white"
                )}
              >
                Threads
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={cn(
                  "flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                  activeTab === "requests"
                    ? "bg-[rgba(var(--color-accent-rgb),0.2)] text-white border border-[rgba(var(--color-accent-rgb),0.35)]"
                    : "bg-white/5 text-[var(--muted-foreground)] border border-white/10 hover:text-white"
                )}
              >
                Requests
              </button>
            </div>

            <div className="relative mb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <button
              onClick={() => startThread({ otherUsername: searchQuery.trim() })}
              disabled={creating || !searchQuery.trim()}
              className={cn(
                "w-full mb-3 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-black",
                (creating || !searchQuery.trim()) && "opacity-60 cursor-not-allowed"
              )}
            >
              {creating ? "Starting..." : "New message"}
            </button>

            {activeTab === "requests" ? (
              <div className="grid gap-2">
                {incomingRequests.length === 0 ? (
                  <div className="text-xs text-[var(--muted-foreground)]">No requests right now.</div>
                ) : (
                  incomingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-2 text-xs text-white/80">
                      <span>{request.sender?.username || "User"}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleRequest(request.id, "ACCEPTED")}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-accent)] text-black"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequest(request.id, "DECLINED")}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-white"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {outgoingRequests.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-[var(--muted-foreground)]">
                    Waiting on {outgoingRequests.length} pending request{outgoingRequests.length > 1 ? "s" : ""}.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {searching && (
                  <div className="text-xs text-[var(--muted-foreground)]">Searching...</div>
                )}
                {!searching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="text-xs text-[var(--muted-foreground)]">No users found.</div>
                )}
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startThread({ otherUserId: user.id })}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-left hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar size={30} src={user.avatarUrl || undefined} />
                      <div>
                        <div className="text-xs font-semibold text-white">@{user.username}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)]">{user.name || user.profileType || "Developer"}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/60">Start</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Threads</h2>
            {loading ? (
              <div className="text-xs text-[var(--muted-foreground)]">Loading threads...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-xs text-[var(--muted-foreground)]">No conversations yet.</div>
            ) : (
              <div className="grid gap-2">
                {recentThreads.length > 0 && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 px-1">Recent</div>
                )}
                {recentThreads.map((thread) => {
                  const other = thread.userAId === userId ? thread.userB : thread.userA;
                  const presence = presenceFor(other?.username || "user");
                  const isActive = pathname === `/messages/${thread.id}`;
                  const unread = thread.lastMessageAt
                    ? Date.now() - new Date(thread.lastMessageAt).getTime() < 6 * 60 * 60 * 1000
                    : false;
                  return (
                    <Link
                      key={thread.id}
                      href={`/messages/${thread.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors",
                        isActive
                          ? "border-[rgba(var(--color-accent-rgb),0.4)] bg-[rgba(var(--color-accent-rgb),0.12)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="relative">
                        <Avatar size={30} src={other?.profile?.avatarUrl || undefined} />
                        <span className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0b0f14]", presence.tone)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          {other?.username || "Conversation"}
                          {unread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                          {thread.messages?.[0]?.content || "No messages yet"}
                        </div>
                        <div className="text-[9px] text-white/40">
                          {presence.label} • {lastActiveLabel(thread.lastMessageAt)}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {olderThreads.length > 0 && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 px-1 pt-2">Earlier</div>
                )}
                {olderThreads.map((thread) => {
                  const other = thread.userAId === userId ? thread.userB : thread.userA;
                  const presence = presenceFor(other?.username || "user");
                  const isActive = pathname === `/messages/${thread.id}`;
                  const unread = thread.lastMessageAt
                    ? Date.now() - new Date(thread.lastMessageAt).getTime() < 6 * 60 * 60 * 1000
                    : false;
                  return (
                    <Link
                      key={thread.id}
                      href={`/messages/${thread.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors",
                        isActive
                          ? "border-[rgba(var(--color-accent-rgb),0.4)] bg-[rgba(var(--color-accent-rgb),0.12)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="relative">
                        <Avatar size={30} src={other?.profile?.avatarUrl || undefined} />
                        <span className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0b0f14]", presence.tone)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          {other?.username || "Conversation"}
                          {unread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                          {thread.messages?.[0]?.content || "No messages yet"}
                        </div>
                        <div className="text-[9px] text-white/40">
                          {presence.label} • {lastActiveLabel(thread.lastMessageAt)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
