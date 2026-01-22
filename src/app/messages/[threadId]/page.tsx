"use client";

import { useEffect, useMemo, useState } from "react";
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
  const currentUserAvatar = (session?.user as any)?.image as string | undefined;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

  const sharedMedia = useMemo(() => {
    if (!thread?.messages) return [];
    return thread.messages
      .filter((m) => m.attachmentUrl && m.attachmentType?.startsWith("image/"))
      .map((m) => ({ id: m.id, url: m.attachmentUrl! }))
      .slice(0, 6);
  }, [thread?.messages]);

  const formattedMessages = useMemo(() => {
    if (!thread?.messages) return [];
    return thread.messages.map((message, index) => {
      const previous = thread.messages?.[index - 1];
      const previousDate = previous ? new Date(previous.createdAt) : null;
      const currentDate = new Date(message.createdAt);
      const showDate =
        !previousDate ||
        previousDate.toDateString() !== currentDate.toDateString();

      // Message grouping logic: same sender and within 5 minutes
      const isFirstInGroup =
        !previous ||
        previous.senderId !== message.senderId ||
        showDate ||
        currentDate.getTime() - new Date(previous.createdAt).getTime() > 5 * 60 * 1000;

      return { ...message, showDate, isFirstInGroup };
    });
  }, [thread?.messages]);

  const formatDay = (value: Date) => {
    return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatTime = (value: Date) => {
    return value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
  };

  async function sendMessage() {
    if (!content.trim() && attachments.length === 0) return;
    setSending(true);
    const res = await fetch(`/api/messages/threads/${params.threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await safeJson<{ id: string; content: string; senderId: string; error?: string }>(res);
    if (res.ok) {
      setThread((prev) =>
        data && prev ? { ...prev, messages: [...(prev.messages || []), data as any] } : prev
      );
      setContent("");
      setAttachments([]);
    } else {
      alert(data?.error || "Failed to send message");
    }
    setSending(false);
  }

  if (!userId) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">Sign in to view messages.</div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">Loading thread...</div>
    );
  }

  if (!thread) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">Thread not found.</div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="glass-soft border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="text-xs text-[var(--muted-foreground)] hover:text-white">
              ← Back
            </Link>
            <div className="relative">
              <Avatar size={40} src={otherUser?.profile?.avatarUrl || undefined} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0b0f14]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {otherUser?.username || "Conversation"}
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Active now • @{otherUser?.username || "user"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mx-auto">
                <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mx-auto">
                <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mx-auto">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={cn(
            "glass-soft border border-white/10 rounded-2xl p-5 min-h-[320px] max-h-[600px] overflow-y-auto transition-colors scrollbar-hide",
            isDragging && "border-[rgba(var(--color-accent-rgb),0.5)] bg-[rgba(var(--color-accent-rgb),0.08)]"
          )}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <div className="space-y-3">
            {(thread.messages || []).length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No messages yet.</div>
            ) : (
              formattedMessages.map((message) => {
                const isMine = message.senderId === userId;
                return (
                  <div key={message.id} className={cn("space-y-1", message.isFirstInGroup && "mt-4")}>
                    {message.showDate && (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          {formatDay(new Date(message.createdAt))}
                        </span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex items-end gap-2",
                      isMine ? "flex-row-reverse" : "flex-row"
                    )}>
                      {!isMine && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {message.isFirstInGroup && (
                            <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />
                          )}
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                          isMine
                            ? "bg-[var(--color-accent)] text-black rounded-tr-none"
                            : "bg-white/10 text-white rounded-tl-none",
                          !message.isFirstInGroup && (isMine ? "rounded-tr-2xl" : "rounded-tl-2xl")
                        )}
                      >
                        {message.content}
                        {message.isFirstInGroup && (
                          <div className={cn("mt-1 text-[9px] font-medium opacity-50")}>
                            {formatTime(new Date(message.createdAt))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 mt-4 animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                </div>
                <span className="text-[10px] text-white/40">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].username} is typing...`
                    : "Several people are typing..."}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-soft border border-white/10 rounded-2xl p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 cursor-pointer">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <span>Attach</span>
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
              >
                Emoji
              </button>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                Drop files here to attach
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/80"
                  >
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-white/50 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <textarea
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTyping(false)}
                placeholder="Write a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white min-h-[44px] max-h-[200px] resize-none focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                style={{ height: content ? "auto" : "44px" }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || (!content.trim() && attachments.length === 0)}
                className={cn(
                  "px-5 py-2.5 h-[44px] rounded-xl text-sm font-bold bg-[var(--color-accent)] text-black transition-all hover:scale-[1.02] active:scale-[0.98]",
                  (sending || (!content.trim() && attachments.length === 0)) && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="space-y-4">
          <div className="glass-soft border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Avatar size={52} src={otherUser?.profile?.avatarUrl || undefined} />
            <div>
              <div className="text-sm font-semibold text-white">@{otherUser?.username || "user"}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {otherUser?.profile?.profileType || otherUser?.name || "DevLink member"}
              </div>
            </div>
          </div>
          {otherUser?.profile?.bio && (
            <p className="text-xs text-white/70 mt-3 leading-relaxed">
              {otherUser.profile.bio}
            </p>
          )}
          <Link
            href={`/u/${otherUser?.username || ""}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
          >
            View profile
          </Link>
        </div>
          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <div className="text-sm font-semibold text-white mb-3">Members</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Avatar size={28} src={currentUserAvatar || undefined} />
                <span>You</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Avatar size={28} src={otherUser?.profile?.avatarUrl || undefined} />
                <span>@{otherUser?.username || "user"}</span>
              </div>
            </div>
          </div>

          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <div className="text-sm font-semibold text-white mb-3">Shared</div>
            {sharedMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((media) => (
                  <div key={media.id} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden group cursor-pointer">
                    <img src={media.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--muted-foreground)]">
                Shared images will appear here.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
