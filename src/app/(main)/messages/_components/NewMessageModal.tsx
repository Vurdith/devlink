"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { menuItem, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import type { MessageThread, MessageRequest } from "@/types/api";

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

interface NewMessageModalProps {
  onClose: () => void;
  onThreadCreated: (thread: MessageThread) => void;
  onRequestSent: (request: MessageRequest) => void;
}

export function NewMessageModal({ onClose, onThreadCreated, onRequestSent }: NewMessageModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [requestSentTo, setRequestSentTo] = useState<UserSearchResult | null>(null);

  // Search users with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    const timeout = setTimeout(async () => {
      setSearching(true);
      setFeedback("");
      try {
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(query.trim())}`);
        const data = await safeJson<{ users: UserSearchResult[]; error?: string }>(res);
        if (active) {
          setResults((data?.users || []).filter((u) => !u.isYou));
          if (!res.ok) setFeedback(data?.error || "People search could not load. Try a different name or try again.");
        }
      } catch {
        if (active) setFeedback("People search could not load. Check your connection, then try again.");
      } finally {
        if (active) setSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const selectUser = useCallback(async (user: UserSearchResult) => {
    setCreating(true);
    setFeedback("");
    setRequestSentTo(null);
    try {
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: user.id }),
      });
      const data = await safeJson<{ type?: string; thread?: MessageThread; request?: MessageRequest; error?: string }>(res);
      if (res.ok && data?.thread) {
        onThreadCreated(data.thread);
        onClose();
        router.push(`/messages/${data.thread.id}`);
      } else if (res.ok && data?.request) {
        onRequestSent(data.request);
        setRequestSentTo(user);
        setResults([]);
        setFeedback(`${user.name || user.username} will see your first message as a request. You can continue once they accept.`);
      } else {
        setFeedback(data?.error || "This conversation could not be started. Try again.");
      }
    } catch {
      setFeedback("This conversation could not be started. Check your connection, then try again.");
    } finally {
      setCreating(false);
    }
  }, [onClose, onRequestSent, onThreadCreated, router]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[8vh] sm:pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={surface("panelStrong", "noise-overlay relative flex max-h-[78vh] w-full max-w-[600px] flex-col overflow-hidden")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-[53px] border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={onClose}
            className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors", ui.control.ghost)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-white flex-1">New message</h2>
          <span className="hidden rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-white/45 sm:inline-flex">
            Search people
          </span>
        </div>

        {/* Search */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-2">
          <span className="text-sm text-white/40 flex-shrink-0">To:</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRequestSentTo(null);
            }}
            placeholder="Search people"
            className={cn(ui.control.field, "flex-1 py-2.5")}
            autoFocus
            disabled={creating}
          />
          {creating && (
            <div className="w-5 h-5 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin flex-shrink-0" />
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {feedback && (
            <div className="p-4 pb-0">
              <div className={surface("empty", "px-4 py-3 text-sm leading-relaxed text-white/65")} role="status">
                {feedback}
                {requestSentTo ? (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={onClose}
                      className={cn("rounded-lg px-4 py-2 text-xs font-bold", ui.control.gradient)}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setQuery("");
                        setFeedback("");
                        setRequestSentTo(null);
                      }}
                      className={cn("rounded-lg px-4 py-2 text-xs font-bold text-white", ui.control.ghost)}
                    >
                      Message someone else
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {searching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && (
            <div className="p-4">
              <div className={surface("empty", "px-5 py-8 text-center")}>
                <div className="text-sm font-semibold text-white/70">No people found</div>
                <p className="mt-1 text-xs leading-relaxed text-white/35">
                  Nothing matched &ldquo;{query}&rdquo;. Try a name or username.
                </p>
              </div>
            </div>
          )}

          {!searching && !query.trim() && (
            <div className="p-4">
              <div className={surface("empty", "px-5 py-8 text-center")}>
                <div className="text-sm font-semibold text-white/70">Find someone on DevLink</div>
                <p className="mt-1 text-xs leading-relaxed text-white/35">
                  Search by name or username to start a private thread.
                </p>
              </div>
            </div>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user)}
              disabled={creating}
              className={menuItem("w-full rounded-none border-x-0 border-t-0 px-4 py-3 text-left disabled:opacity-50")}
            >
              <Avatar size={44} src={user.avatarUrl || undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-white truncate">
                    {user.name || user.username}
                  </span>
                  {user.verified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)" className="flex-shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="text-sm text-white/40 truncate">@{user.username}</div>
                {user.bio && (
                  <div className="mt-1 line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.22)] pl-2 text-xs leading-relaxed text-white/40">{user.bio}</div>
                )}
              </div>
              {user.isFollowing && (
                <span className="text-[11px] text-white/30 flex-shrink-0">Following</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
