"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { menuPanel, skeleton, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { Avatar } from "@/components/ui/Avatar";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { NewMessageModal } from "./NewMessageModal";
import type { MessageRequest, MessageThread, MessagingSettings } from "@/types/api";

const DM_PERMISSION_OPTIONS = [
  { value: "EVERYONE", label: "Everyone", desc: "Anyone can message you directly" },
  { value: "FOLLOWERS", label: "Followers", desc: "Only your followers" },
  { value: "FOLLOWING", label: "People I follow", desc: "Only people you follow" },
  { value: "MUTUALS", label: "Mutuals only", desc: "Only mutual follows" },
  { value: "NONE", label: "No one", desc: "All messages become requests" },
] as const;

export function MessagesSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userId = session?.user?.id;
  const isThreadRoute = /^\/messages\/[^/]+/.test(pathname);

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MessageRequest[]>([]);
  const [, setOutgoingRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");
  const [showNewMessage, setShowNewMessage] = useState(false);

  // Inline settings dropdown
  const [showSettings, setShowSettings] = useState(false);
  const [msgSettings, setMsgSettings] = useState<MessagingSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Realtime: bump thread to top on new message
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

  const lastActiveLabel = useCallback((date?: Date | string | null) => {
    if (!date) return "";
    const ts = typeof date === "string" ? new Date(date) : date;
    const diffMins = Math.max(0, Math.floor((Date.now() - ts.getTime()) / 60000));
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return ts.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, []);

  // Load threads and requests
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function load() {
      setLoading(true);
      const [threadsRes, incomingRes, outgoingRes] = await Promise.all([
        fetch("/api/messages/threads"),
        fetch("/api/messages/requests?type=incoming"),
        fetch("/api/messages/requests?type=outgoing"),
      ]);
      const [threadsData, incomingData, outgoingData] = await Promise.all([
        safeJson<MessageThread[]>(threadsRes),
        safeJson<MessageRequest[]>(incomingRes),
        safeJson<MessageRequest[]>(outgoingRes),
      ]);
      if (isMounted) {
        setThreads(threadsData || []);
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

  function handleThreadCreated(thread: MessageThread) {
    setThreads((prev) => {
      const exists = prev.some((t) => t.id === thread.id);
      return exists ? prev : [thread, ...prev];
    });
  }

  function handleRequestSent(request: MessageRequest) {
    setOutgoingRequests((prev) => [request, ...prev]);
  }

  // Load messaging settings when dropdown opens
  useEffect(() => {
    if (!showSettings || !userId || msgSettings) return;
    let active = true;
    (async () => {
      const res = await fetch("/api/settings/messaging");
      const data = await safeJson<MessagingSettings & { error?: string }>(res);
      if (active && res.ok) setMsgSettings((data || { allowFrom: "FOLLOWING" }) as MessagingSettings);
    })();
    return () => { active = false; };
  }, [showSettings, userId, msgSettings]);

  // Close settings on outside click
  useEffect(() => {
    if (!showSettings) return;
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSettings]);

  async function updateMsgSetting(allowFrom: string) {
    setSavingSettings(true);
    const res = await fetch("/api/settings/messaging", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowFrom }),
    });
    const data = await safeJson<MessagingSettings & { error?: string }>(res);
    if (res.ok && data) setMsgSettings(data);
    setSavingSettings(false);
  }

  if (!userId) {
    return (
      <aside className="flex h-full w-full flex-shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(8,11,16,0.72)] md:w-[380px] lg:w-[420px]">
        <div className="flex h-full items-center justify-center p-4">
          <FeedbackState
            className="w-full px-5 py-9"
            icon={<MessageIcon />}
            title="Sign in to view messages"
            description="Your private conversations, requests, and message settings live here."
            action={{ label: "Log in", href: "/login" }}
          />
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-full flex-shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(8,11,16,0.72)] md:w-[380px] lg:w-[420px]",
          isThreadRoute && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="noise-overlay flex h-[60px] flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Inbox</div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>
          <div className="flex items-center gap-1 relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                showSettings
                  ? cn("text-[var(--color-accent-2)]", ui.active.cyan)
                  : cn("text-white/60", ui.control.ghost)
              )}
              title="Message settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setShowNewMessage(true)}
              className={cn("flex h-9 w-9 items-center justify-center text-white/60 transition-colors", ui.control.icon)}
              title="New message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Settings dropdown */}
            {showSettings && (
              <div className={menuPanel("absolute right-0 top-full z-50 mt-1 w-72 animate-in fade-in slide-in-from-top-1 duration-150")}>
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <h3 className="text-sm font-bold text-white">Who can message you</h3>
                  <p className="text-[11px] text-white/40 mt-0.5">Others will send a request instead</p>
                </div>
                <div className="py-1">
                  {DM_PERMISSION_OPTIONS.map((opt) => {
                    const isActive = (msgSettings?.allowFrom || "FOLLOWING") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => updateMsgSetting(opt.value)}
                        disabled={savingSettings}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isActive ? "bg-white/[0.055]" : "hover:bg-white/[0.035]",
                          savingSettings && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
                          isActive ? "border-[var(--color-accent-2)]" : "border-white/20"
                        )}>
                          {isActive && <div className="h-2 w-2 rounded-full bg-[var(--color-accent-2)]" />}
                        </div>
                        <div className="min-w-0">
                          <div className={cn("text-sm", isActive ? "text-white font-semibold" : "text-white/70")}>{opt.label}</div>
                          <div className="text-[11px] text-white/30">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-4 py-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              className={cn(ui.control.field, "rounded-lg py-2.5 pl-10 pr-4")}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className={surface("toolbar", "m-4 mt-0 flex flex-shrink-0 gap-1 p-1")}>
          <button
            onClick={() => setActiveTab("inbox")}
            className={cn(
              "relative flex-1 rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition-all duration-200",
              activeTab === "inbox"
                ? cn("text-white", ui.active.cyanStrong)
                : "border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/75"
            )}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "relative flex-1 rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition-all duration-200",
              activeTab === "requests"
                ? cn("text-white", ui.active.cyanStrong)
                : "border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/75"
            )}
          >
            Requests
            {requestCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-[10px] font-bold text-white">
                {requestCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === "requests" ? (
            <div className="space-y-2 p-3 pt-0">
              {incomingRequests.length === 0 ? (
                <FeedbackState
                  className="px-4 py-8"
                  icon={<RequestIcon />}
                  title="No message requests"
                  description="Requests from people outside your message permissions will appear here."
                />
              ) : (
                <>
                  {incomingRequests.map((request) => {
                    const msgPreview = request.lastMessage?.content || "Sent you a message request";
                    return (
                      <div key={request.id} className={surface("empty", "px-4 py-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]")}>
                        <div className="flex items-start gap-3">
                          <Avatar size={48} src={request.sender?.profile?.avatarUrl || request.sender?.image || undefined} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-bold text-white truncate">
                                {request.sender?.name || request.sender?.username}
                              </span>
                              <span className="text-[15px] text-white/40 truncate">
                                @{request.sender?.username}
                              </span>
                            </div>
                            <p className="text-sm text-white/40 truncate mt-0.5 leading-snug">
                              {msgPreview}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleRequest(request.id, "ACCEPTED")}
                                className={cn("rounded-lg px-4 py-1.5 text-xs font-bold transition-all", ui.control.gradient)}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRequest(request.id, "DECLINED")}
                                className={cn("rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors", ui.control.ghost)}
                              >
                                Decline
                              </button>
                              {request.conversationId && (
                                <Link
                                  href={`/messages/${request.conversationId}`}
                                  className={cn("ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-white/55 transition-colors", ui.control.ghost)}
                                >
                                  View
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={surface("empty", "flex items-center gap-3 p-3")}>
                  <div className={skeleton("h-12 w-12 rounded-full")} />
                  <div className="flex-1 space-y-2">
                    <div className={skeleton("h-3 w-24")} />
                    <div className={skeleton("h-2.5 w-40 max-w-full")} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-4 pt-0">
              {searchQuery.trim() ? (
                <FeedbackState
                  className="px-4 py-8"
                  icon={<SearchIcon />}
                  title="No matches"
                  description="Try a different name or username."
                />
              ) : (
                <FeedbackState
                  className="px-4 py-9"
                  icon={<MessageIcon />}
                  title="Your inbox is ready"
                  description="Start a private conversation, share context, or keep a collaboration moving."
                  action={{ label: "Write a message", onClick: () => setShowNewMessage(true) }}
                />
              )}
            </div>
          ) : (
            <div className="space-y-2 p-3 pt-0">
              {filteredThreads.map((thread) => {
                const other = thread.userAId === userId ? thread.userB : thread.userA;
                const isActive = pathname === `/messages/${thread.id}`;
                const lastMsg = thread.messages?.[thread.messages.length - 1];
                const lastMsgPreview = lastMsg
                  ? lastMsg.senderId === userId
                    ? `You: ${lastMsg.content}`
                    : lastMsg.content
                  : "No messages yet";

                return (
                  <Link
                    key={thread.id}
                    href={`/messages/${thread.id}`}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-3 py-3 transition-all duration-200",
                      isActive
                        ? cn("border-[rgba(var(--color-accent-2-rgb),0.32)]", ui.active.cyan)
                        : "border-white/[0.06] bg-white/[0.018] hover:border-white/[0.12] hover:bg-white/[0.04]"
                    )}
                  >
                    <Avatar size={48} src={other?.profile?.avatarUrl || undefined} />
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-bold text-white truncate">
                            {other?.name || other?.username || "User"}
                          </span>
                          <span className="text-[15px] text-white/40 truncate">
                            @{other?.username || "user"}
                          </span>
                        </div>
                        <span className="text-xs text-white/30 flex-shrink-0">
                          {lastActiveLabel(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 truncate mt-0.5 leading-snug">
                        {lastMsgPreview}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onThreadCreated={handleThreadCreated}
          onRequestSent={handleRequestSent}
        />
      )}
    </>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
