"use client";

import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { surface, ui } from "@/components/ui/design-system";
import { MessageList } from "../_components/MessageList";
import { ProfilePreviewCard } from "../_components/ProfilePreviewCard";
import { MessageThreadHeader } from "../_components/MessageThreadHeader";
import { MessageThreadIntro } from "../_components/MessageThreadIntro";
import { formatMessageRows } from "../_components/message-thread-format";
import type { MessageThread, Message, MessageRequest } from "@/types/api";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChatScroll } from "@/hooks/useChatScroll";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

export default function MessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false); // sender has a pending request
  const [hasSentRequestMsg, setHasSentRequestMsg] = useState(false); // already sent 1 message
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollRef = useChatScroll(thread?.messages?.length);

  const currentUser = useMemo(() => {
    if (!session?.user || !userId) return null;
    return { id: userId, username: session.user.username || session.user.name || "user" };
  }, [session, userId]);

  const { typingUsers, setTyping } = useTypingIndicator(params.threadId, currentUser);

  useMessagesRealtime(params.threadId, (newMessage) => {
    setThread((prev) => {
      if (!prev) return prev;
      const exists = prev.messages?.some((m) => m.id === newMessage.id);
      if (exists) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), { ...newMessage, threadId: prev.id } as Message],
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
      const outgoing = await safeJson<MessageRequest[]>(outgoingRes);

      if (isMounted) {
        setThread(data || null);

        // Check if there's a pending request from this user to the other user
        if (data && outgoing) {
          const otherUserId = data.userAId === userId ? data.userBId : data.userAId;
          const isPending = outgoing.some(
            (r) => r.recipientId === otherUserId && r.status === "PENDING"
          );
          setPendingRequest(isPending);

          if (isPending && data.messages) {
            const sentCount = data.messages.filter((m) => m.senderId === userId).length;
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
    return formatMessageRows(thread.messages);
  }, [thread?.messages]);

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
    const data = await safeJson<Message & { error?: string }>(res);
    if (res.ok && data) {
      setThread((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), data] } : prev
      );
      if (pendingRequest) setHasSentRequestMsg(true);
    } else {
      setContent(messageContent); // Restore on failure
      alert(data?.error || "Failed to send message");
    }
    setSending(false);
  }, [content, params.threadId, setTyping, pendingRequest]);

  /* Send a media URL (image/GIF) as a message */
  const sendMediaMessage = useCallback(async (mediaUrl: string) => {
    setSending(true);
    const res = await fetch(`/api/messages/threads/${params.threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: mediaUrl }),
    });
    const data = await safeJson<Message & { error?: string }>(res);
    if (res.ok && data) {
      setThread((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), data] } : prev
      );
      if (pendingRequest) setHasSentRequestMsg(true);
    } else {
      alert(data?.error || "Failed to send");
    }
    setSending(false);
  }, [params.threadId, pendingRequest]);

  /* Emoji handler */
  const addEmoji = useCallback((emoji: { emoji?: string }) => {
    const char = emoji?.emoji || "";
    if (char) {
      setContent((prev) => prev + char);
      textareaRef.current?.focus();
    }
  }, []);

  /* Image upload handler */
  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please select an image or video file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        await sendMediaMessage(data.url);
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (gifInputRef.current) gifInputRef.current.value = "";
    }
  }, [sendMediaMessage]);

  /* Close emoji picker on outside click */
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

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
      <MessageThreadHeader otherUser={otherUser} onShowProfile={() => setShowProfilePreview(true)} />

      {/* Profile preview modal */}
      {showProfilePreview && otherUser && (
        <ProfilePreviewCard user={otherUser} currentUserId={userId} onClose={() => setShowProfilePreview(false)} />
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex-1 overflow-y-auto px-4 py-4"
      >
        <MessageThreadIntro otherUser={otherUser} />

        <MessageList messages={formattedMessages} userId={userId} otherUser={otherUser} typingUsers={typingUsers} />
      </div>

      {/* Emoji picker panel */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="flex-shrink-0 border-t border-white/[0.06] bg-[rgba(8,11,16,0.62)] px-4 py-2">
          <Suspense fallback={<div className="h-[350px] flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" /></div>}>
            <EmojiPicker
              onEmojiClick={addEmoji}
              searchDisabled
              skinTonesDisabled
              lazyLoadEmojis
              width="100%"
              height={350}
            />
          </Suspense>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[rgba(8,11,16,0.72)] px-4 py-3 backdrop-blur-md">
        {/* Hidden file inputs for uploads */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={gifInputRef}
          type="file"
          accept="image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Pending request notice shown after 1 message sent */}
        {pendingRequest && hasSentRequestMsg && (
          <div className={surface("empty", "mb-2 px-3 py-2 text-center")}>
            <p className="text-[13px] text-white/40">
              Your message request has been sent. You can send more messages once{" "}
              <span className="text-white/60 font-medium">{otherUser?.name || otherUser?.username}</span>{" "}
              accepts your request.
            </p>
          </div>
        )}

        {/* Pending request hint shown before first message */}
        {pendingRequest && !hasSentRequestMsg && (
          <div className="mb-2 rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.18)] bg-[rgba(var(--color-accent-2-rgb),0.06)] px-3 py-2 text-center">
            <p className="text-[13px] text-white/50">
              Send a message to introduce yourself. {otherUser?.name || otherUser?.username} will see it as a request.
            </p>
          </div>
        )}

        {/* Upload progress indicator */}
        {uploading && (
          <div className={surface("empty", "mb-2 flex items-center gap-2 px-3 py-2")}>
            <div className="w-4 h-4 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <span className="text-[13px] text-white/50">Uploading...</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Action buttons */}
          {!(pendingRequest && hasSentRequestMsg) && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--color-accent-2)] transition-colors hover:border-white/[0.10] hover:bg-white/[0.045]",
                  uploading && "opacity-40 cursor-not-allowed"
                )}
                title="Attach media"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => gifInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--color-accent-2)] transition-colors hover:border-white/[0.10] hover:bg-white/[0.045]",
                  uploading && "opacity-40 cursor-not-allowed"
                )}
                title="Upload GIF"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">GIF</text>
                </svg>
              </button>
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                  showEmojiPicker
                    ? ui.active.cyan
                    : "border-transparent text-[var(--color-accent-2)] hover:border-white/[0.10] hover:bg-white/[0.045]"
                )}
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
                ui.control.field,
                "min-h-[42px] max-h-[150px] resize-none rounded-xl px-4 py-2.5 text-[15px] leading-snug scrollbar-hide",
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
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors",
                content.trim()
                  ? "border-[rgba(var(--color-accent-2-rgb),0.26)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)] hover:bg-[rgba(var(--color-accent-2-rgb),0.16)]"
                  : "cursor-not-allowed border-transparent text-white/20"
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
