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

export default function MessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
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
      const res = await fetch(`/api/messages/threads/${params.threadId}`);
      const data = await safeJson<MessageThread>(res);
      if (isMounted) {
        setThread(data || null);
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
    } else {
      setContent(messageContent); // Restore on failure
      alert(data?.error || "Failed to send message");
    }
    setSending(false);
  }, [content, params.threadId, setTyping]);

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
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate leading-tight">
              {otherUser?.name || otherUser?.username || "Conversation"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/u/${otherUser?.username || ""}`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:bg-white/[0.08] transition-colors"
            title="View profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:bg-white/[0.08] transition-colors"
            title="More options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide"
      >
        {/* User profile card at top of conversation */}
        <div className="flex flex-col items-center py-6 mb-4">
          <Avatar size={64} src={otherUser?.profile?.avatarUrl || undefined} />
          <div className="mt-2 text-center">
            <div className="text-lg font-bold text-white">
              {otherUser?.name || otherUser?.username}
            </div>
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
          <Link
            href={`/u/${otherUser?.username || ""}`}
            className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
          >
            View profile
          </Link>
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
                            ? "bg-[var(--color-accent)] text-black"
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
        <div className="flex items-end gap-2">
          {/* Action buttons */}
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

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTyping(false)}
              placeholder="Start a new message"
              rows={1}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-[15px] text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[var(--color-accent)]/40 transition-colors min-h-[42px] max-h-[150px] scrollbar-hide leading-snug"
            />
          </div>

          {/* Send button */}
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
        </div>
      </div>
    </div>
  );
}
