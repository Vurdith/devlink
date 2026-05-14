"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { BaseModal } from "@/components/ui/BaseModal";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { menuItem, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { Search } from "lucide-react";
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
          if (!res.ok) setFeedback(data?.error || "Search could not load. Try a different name or try again.");
        }
      } catch {
        if (active) setFeedback("Search could not load. Check your connection, then try again.");
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

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="New message"
      size="xl"
      className="noise-overlay"
      contentClassName="flex flex-col"
      headerRight={
        creating ? (
          <span
            className="h-5 w-5 rounded-full border-2 border-white/20 border-t-[var(--color-accent)] animate-spin"
            aria-label="Starting conversation"
          />
        ) : null
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
      <div className="flex max-h-[68dvh] min-h-[360px] flex-col">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRequestSentTo(null);
              }}
              placeholder="Search name or username"
              className={cn(ui.control.field, "py-2.5 pl-10")}
              autoFocus
              disabled={creating}
            />
          </div>
        </div>

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
                  Nothing matched &ldquo;{query}&rdquo;. Try a full handle or display name.
                </p>
              </div>
            </div>
          )}

          {!searching && !query.trim() && (
            <div className="p-4">
              <div className={surface("empty", "px-5 py-8 text-center")}>
                <div className="text-sm font-semibold text-white/70">Search for a profile</div>
                <p className="mt-1 text-xs leading-relaxed text-white/35">
                  Enter a display name or handle to start a thread.
                </p>
              </div>
            </div>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user)}
              disabled={creating}
              className={menuItem("w-full rounded-none border-x-0 border-t-0 px-4 py-3.5 text-left disabled:opacity-50")}
            >
              <Avatar size={44} src={user.avatarUrl || undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="text-[15px] font-bold text-white truncate">
                    {user.name || user.username}
                  </span>
                  {user.verified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)" className="flex-shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {user.profileType && (
                    <ProfileTypeLabel profileType={user.profileType} variant="compact" />
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
    </BaseModal>
  );
}
