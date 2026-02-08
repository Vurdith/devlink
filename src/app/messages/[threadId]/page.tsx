"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { Avatar } from "@/components/ui/Avatar";
import type { MessageThread, Message } from "@/types/api";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChatScroll } from "@/hooks/useChatScroll";

/* ── Profile Preview Card (X.com-style popup) ── */
function ProfilePreviewCard({
  user,
  onClose,
}: {
  user: {
    id?: string;
    username?: string | null;
    name?: string | null;
    image?: string | null;
    createdAt?: string | Date | null;
    profile?: {
      avatarUrl?: string | null;
      bannerUrl?: string | null;
      bio?: string | null;
      verified?: boolean;
      location?: string | null;
      website?: string | null;
    };
    _count?: { followers?: number; following?: number };
  };
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const avatarSrc = user.profile?.avatarUrl || user.image || undefined;
  const bannerSrc = user.profile?.bannerUrl || undefined;
  const followerCount = user._count?.followers;
  const followingCount = user._count?.following;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[360px] rounded-2xl overflow-hidden shadow-xl border border-white/[0.08]"
        style={{ background: "linear-gradient(180deg, #1c1f26 0%, #15171c 100%)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Banner */}
        <div className="h-28 relative overflow-hidden">
          {bannerSrc ? (
            <img src={bannerSrc} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, rgba(var(--color-accent-rgb),0.3) 0%, rgba(var(--color-accent-rgb),0.05) 50%, rgba(var(--color-accent-2-rgb,99,102,241),0.15) 100%)",
              }}
            />
          )}
          {/* Banner fade to card background */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#1c1f26] to-transparent" />
        </div>

        {/* Avatar — overlapping the banner */}
        <div className="-mt-14 px-5 relative z-10">
          <div className="w-[84px] h-[84px] rounded-full border-[3px] border-[#1c1f26] overflow-hidden shadow-lg">
            <Avatar size={84} src={avatarSrc} />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-5">
          {/* Name row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-[18px] font-extrabold text-white truncate leading-tight">
                  {user.name || user.username}
                </h3>
                {user.profile?.verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-accent)" className="flex-shrink-0 mt-0.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="text-[13px] text-white/40 leading-tight mt-0.5">@{user.username}</div>
            </div>
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <p className="text-[14px] text-white/70 mt-3 leading-[1.45] line-clamp-3">
              {user.profile.bio}
            </p>
          )}

          {/* Location / Joined */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {user.profile?.location && (
              <div className="flex items-center gap-1 text-[12px] text-white/35">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>{user.profile.location}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-1 text-[12px] text-white/35">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
              </div>
            )}
          </div>

          {/* Follower counts */}
          {(followerCount !== undefined || followingCount !== undefined) && (
            <div className="flex items-center gap-4 mt-3">
              {followingCount !== undefined && (
                <Link
                  href={`/u/${user.username}/following`}
                  onClick={onClose}
                  className="text-[13px] hover:underline"
                >
                  <span className="font-bold text-white">{followingCount.toLocaleString()}</span>{" "}
                  <span className="text-white/40">Following</span>
                </Link>
              )}
              {followerCount !== undefined && (
                <Link
                  href={`/u/${user.username}/followers`}
                  onClick={onClose}
                  className="text-[13px] hover:underline"
                >
                  <span className="font-bold text-white">{followerCount.toLocaleString()}</span>{" "}
                  <span className="text-white/40">{followerCount === 1 ? "Follower" : "Followers"}</span>
                </Link>
              )}
            </div>
          )}

          {/* View profile CTA */}
          <Link
            href={`/u/${user.username || ""}`}
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[14px] font-bold border border-white/[0.15] text-white hover:bg-white/[0.06] transition-colors"
          >
            View full profile
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-50">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false); // sender has a pending request
  const [hasSentRequestMsg, setHasSentRequestMsg] = useState(false); // already sent 1 message
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollRef = useChatScroll(thread?.messages?.length);

  const currentUser = useMemo(() => {
    if (!session?.user || !userId) return null;
    return { id: userId, username: (session.user as any).username || session.user.name || "user" };
  }, [session, userId]);

  const { typingUsers, setTyping } = useTypingIndicator(params.threadId, currentUser);

  useMessagesRealtime(params.threadId, (newMessage) => {
    setThread((prev) => {
      if (!prev) return prev;
      const exists = prev.messages?.some((m) => m.id === newMessage.id);
      if (exists) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), { ...newMessage, threadId: prev.id } as any],
      };
    });
  });

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function load() {
      setLoading(true);
      const [threadRes, outgoingRes] = await Promise.all([
        fetch(`/api/messages/threads/${params.threadId}`),
        fetch("/api/messages/requests?type=outgoing"),
      ]);
      const data = await safeJson<MessageThread>(threadRes);
      const outgoing = await safeJson<any[]>(outgoingRes);

      if (isMounted) {
        setThread(data || null);

        // Check if there's a pending request from this user to the other user
        if (data && outgoing) {
          const otherUserId = data.userAId === userId ? data.userBId : data.userAId;
          const isPending = outgoing.some(
            (r: any) => r.recipientId === otherUserId && r.status === "PENDING"
          );
          setPendingRequest(isPending);

          if (isPending && data.messages) {
            const sentCount = data.messages.filter((m: any) => m.senderId === userId).length;
            setHasSentRequestMsg(sentCount >= 1);
          }
        }

        setLoading(false);
      }
    }
    if (params.threadId) load();
    return () => {
      isMounted = false;
    };
  }, [params.threadId, userId]);

  const otherUser = useMemo(() => {
    if (!thread || !userId) return null;
    return thread.userAId === userId ? thread.userB : thread.userA;
  }, [thread, userId]);

  const formattedMessages = useMemo(() => {
    if (!thread?.messages) return [];
    return thread.messages.map((message, index) => {
      const previous = thread.messages?.[index - 1];
      const previousDate = previous ? new Date(previous.createdAt) : null;
      const currentDate = new Date(message.createdAt);
      const showDate =
        !previousDate ||
        previousDate.toDateString() !== currentDate.toDateString();

      const isFirstInGroup =
        !previous ||
        previous.senderId !== message.senderId ||
        showDate ||
        currentDate.getTime() - new Date(previous.createdAt).getTime() > 5 * 60 * 1000;

      const next = thread.messages?.[index + 1];
      const isLastInGroup =
        !next ||
        next.senderId !== message.senderId ||
        new Date(next.createdAt).toDateString() !== currentDate.toDateString() ||
        new Date(next.createdAt).getTime() - currentDate.getTime() > 5 * 60 * 1000;

      return { ...message, showDate, isFirstInGroup, isLastInGroup };
    });
  }, [thread?.messages]);

  const formatDay = (value: Date) => {
    const now = new Date();
    const isToday = value.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = value.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return value.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: value.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (value: Date) => {
    return value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setTyping(e.target.value.length > 0);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const sendMessage = useCallback(async () => {
    if (!content.trim()) return;
    setSending(true);
    const messageContent = content;
    setContent("");
    setTyping(false);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const res = await fetch(`/api/messages/threads/${params.threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: messageContent }),
    });
    const data = await safeJson<{ id: string; content: string; senderId: string; error?: string }>(res);
    if (res.ok && data) {
      setThread((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), data as any] } : prev
      );
      if (pendingRequest) setHasSentRequestMsg(true);
    } else {
      setContent(messageContent); // Restore on failure
      alert(data?.error || "Failed to send message");
    }
    setSending(false);
  }, [content, params.threadId, setTyping, pendingRequest]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-white/40">
        Sign in to view messages.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="text-sm text-white/40">Conversation not found</div>
        <Link
          href="/messages"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[53px] border-b border-white/[0.06] flex-shrink-0 bg-black/40 backdrop-blur-md">
        <Link
          href="/messages"
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:bg-white/[0.08] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <button
          onClick={() => setShowProfilePreview(true)}
          className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />
          <div className="min-w-0 text-left">
            <h1 className="text-[15px] font-bold text-white truncate leading-tight">
              {otherUser?.name || otherUser?.username || "Conversation"}
            </h1>
          </div>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowProfilePreview(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:bg-white/[0.08] transition-colors"
            title="View profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profile preview modal */}
      {showProfilePreview && otherUser && (
        <ProfilePreviewCard user={otherUser} onClose={() => setShowProfilePreview(false)} />
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide"
      >
        {/* User profile card at top of conversation */}
        <div className="flex flex-col items-center py-6 mb-4">
          <Link href={`/u/${otherUser?.username || ""}`}>
            <Avatar size={64} src={otherUser?.profile?.avatarUrl || undefined} />
          </Link>
          <div className="mt-2 text-center">
            <Link href={`/u/${otherUser?.username || ""}`} className="text-lg font-bold text-white hover:underline">
              {otherUser?.name || otherUser?.username}
            </Link>
            <div className="text-sm text-white/40">@{otherUser?.username}</div>
          </div>
          {otherUser?.profile?.bio && (
            <p className="text-sm text-white/50 text-center mt-2 max-w-[280px] leading-relaxed">
              {otherUser.profile.bio}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
            <span>Joined {otherUser?.createdAt ? new Date(otherUser.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "DevLink"}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-0.5">
          {formattedMessages.map((message) => {
            const isMine = message.senderId === userId;
            return (
              <div key={message.id}>
                {message.showDate && (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-xs text-white/30 font-medium">
                      {formatDay(new Date(message.createdAt))}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "flex",
                    isMine ? "justify-end" : "justify-start",
                    message.isFirstInGroup ? "mt-3" : "mt-[2px]"
                  )}
                >
                  <div className="group flex items-end gap-1.5 max-w-[75%]">
                    {/* Avatar for other user (first in group only) */}
                    {!isMine && (
                      <div className="w-8 flex-shrink-0 self-end">
                        {message.isLastInGroup && (
                          <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />
                        )}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={cn(
                          "px-4 py-2.5 text-[15px] leading-snug break-words",
                          isMine
                            ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white"
                            : "bg-white/[0.08] text-white",
                          // Bubble shape based on position in group
                          isMine ? cn(
                            message.isFirstInGroup && message.isLastInGroup && "rounded-[22px]",
                            message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-br-[4px]",
                            !message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-r-[4px]",
                            !message.isFirstInGroup && message.isLastInGroup && "rounded-[22px] rounded-tr-[4px]",
                          ) : cn(
                            message.isFirstInGroup && message.isLastInGroup && "rounded-[22px]",
                            message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-bl-[4px]",
                            !message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-l-[4px]",
                            !message.isFirstInGroup && message.isLastInGroup && "rounded-[22px] rounded-tl-[4px]",
                          ),
                        )}
                      >
                        {message.content}
                      </div>

                      {/* Timestamp on last message in group */}
                      {message.isLastInGroup && (
                        <div
                          className={cn(
                            "text-[11px] text-white/25 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                            isMine ? "text-right" : "text-left"
                          )}
                        >
                          {formatTime(new Date(message.createdAt))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mt-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.08] rounded-[22px]">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-3">
        {/* Pending request notice — shown after 1 message sent */}
        {pendingRequest && hasSentRequestMsg && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
            <p className="text-[13px] text-white/40">
              Your message request has been sent. You can send more messages once{" "}
              <span className="text-white/60 font-medium">{otherUser?.name || otherUser?.username}</span>{" "}
              accepts your request.
            </p>
          </div>
        )}

        {/* Pending request hint — shown before first message */}
        {pendingRequest && !hasSentRequestMsg && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-[rgba(var(--color-accent-rgb),0.06)] border border-[rgba(var(--color-accent-rgb),0.12)] text-center">
            <p className="text-[13px] text-white/50">
              Send a message to introduce yourself. {otherUser?.name || otherUser?.username} will see it as a request.
            </p>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Action buttons */}
          {!(pendingRequest && hasSentRequestMsg) && (
            <div className="flex items-center gap-0.5 pb-1.5">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors"
                title="Attach media"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors"
                title="GIF"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">GIF</text>
                </svg>
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors"
                title="Emoji"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTyping(false)}
              placeholder={pendingRequest && !hasSentRequestMsg ? "Write your message request..." : "Start a new message"}
              rows={1}
              disabled={pendingRequest && hasSentRequestMsg}
              className={cn(
                "w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-[15px] text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[var(--color-accent)]/40 transition-colors min-h-[42px] max-h-[150px] scrollbar-hide leading-snug",
                pendingRequest && hasSentRequestMsg && "opacity-40 cursor-not-allowed"
              )}
            />
          </div>

          {/* Send button */}
          {!(pendingRequest && hasSentRequestMsg) && (
            <button
              onClick={sendMessage}
              disabled={sending || !content.trim()}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 mb-0.5",
                content.trim()
                  ? "text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)]"
                  : "text-white/20 cursor-not-allowed"
              )}
              title="Send"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
