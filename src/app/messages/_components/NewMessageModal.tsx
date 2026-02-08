"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
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

  // Search users with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    const timeout = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(query.trim())}`);
      const data = await safeJson<{ users: UserSearchResult[] }>(res);
      if (active) {
        setResults((data?.users || []).filter((u) => !u.isYou));
        setSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const selectUser = useCallback(async (user: UserSearchResult) => {
    setCreating(true);
    const res = await fetch("/api/messages/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: user.id }),
    });
    const data = await safeJson<{ type?: string; thread?: MessageThread; request?: MessageRequest; error?: string }>(res);
    if (res.ok && data?.type === "thread" && data.thread) {
      onThreadCreated(data.thread);
      onClose();
      router.push(`/messages/${data.thread.id}`);
    } else if (res.ok && data?.type === "request" && data.request) {
      onRequestSent(data.request);
      onClose();
    } else {
      alert(data?.error || "Unable to start conversation");
    }
    setCreating(false);
  }, [onClose, onThreadCreated, onRequestSent, router]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] mx-4 bg-[#16181c] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-[53px] border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-white flex-1">New message</h2>
          <button
            disabled
            className="px-4 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white/40 cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-1 border-b border-white/[0.06] flex-shrink-0">
          <span className="text-sm text-white/40 flex-shrink-0">To:</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none py-3"
            autoFocus
          />
          {creating && (
            <div className="w-5 h-5 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin flex-shrink-0" />
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-white/30">
              No people found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!searching && !query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-white/30">
              Try searching for people by name or username.
            </div>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left disabled:opacity-50"
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
                  <div className="text-xs text-white/30 truncate mt-0.5">{user.bio}</div>
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
