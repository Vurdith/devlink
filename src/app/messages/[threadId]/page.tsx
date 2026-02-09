"use client";

import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import type { MessageThread, Message } from "@/types/api";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChatScroll } from "@/hooks/useChatScroll";

/* ── Lazy-loaded heavy components ── */
const EmojiPicker = lazy(() => import("emoji-picker-react"));

/* ── Helpers ── */
function isMediaUrl(text: string): boolean {
  const t = text.trim();
  if (!t.startsWith("http")) return false;
  return (
    /\.(jpg|jpeg|png|gif|webp|svg|mp4|avif)(\?.*)?$/i.test(t) ||
    t.includes("media.tenor.com") ||
    t.includes("media.giphy.com") ||
    t.includes("giphy.com/media") ||
    t.includes("cdn.devlink")
  );
}

/* ── Profile type style constants (matching ProfileTooltip) ── */
const PROFILE_GRADIENTS: Record<string, string> = {
  DEVELOPER: "from-blue-500/20 via-blue-400/10 to-cyan-500/20",
  CLIENT: "from-emerald-500/20 via-green-400/10 to-teal-500/20",
  STUDIO: "from-purple-500/20 via-fuchsia-400/10 to-indigo-500/20",
  INFLUENCER: "from-rose-500/20 via-pink-400/10 to-[var(--color-accent)]/20",
  INVESTOR: "from-amber-500/20 via-yellow-400/10 to-orange-500/20",
  DEFAULT: "from-slate-500/20 via-gray-400/10 to-zinc-500/20",
};

const PROFILE_BORDERS: Record<string, string> = {
  DEVELOPER: "border-blue-500/40 shadow-blue-500/20",
  CLIENT: "border-emerald-500/40 shadow-emerald-500/20",
  STUDIO: "border-purple-500/40 shadow-purple-500/20",
  INFLUENCER: "border-rose-500/40 shadow-rose-500/20",
  INVESTOR: "border-amber-500/40 shadow-amber-500/20",
  DEFAULT: "border-white/20 shadow-white/10",
};

const BADGE_CLASSES: Record<string, string> = {
  DEVELOPER: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-blue-500/20",
  CLIENT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20",
  STUDIO: "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-purple-500/20",
  INFLUENCER: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/20",
  INVESTOR: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/20",
  DEFAULT: "bg-slate-500/15 text-slate-300 border-slate-500/30 shadow-slate-500/20",
};

/* ── Profile Preview Card (matching ProfileTooltip design) ── */
function ProfilePreviewCard({
  user,
  currentUserId,
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
      profileType?: string | null;
    };
    _count?: { followers?: number; following?: number };
  };
  currentUserId?: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [fullUser, setFullUser] = useState(user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  // Fetch full profile data on mount
  useEffect(() => {
    if (!user.username) return;
    const controller = new AbortController();
    fetch(`/api/user/${encodeURIComponent(user.username)}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json().catch(() => null)) as any;
      })
      .then((data) => {
        const next = data?.user;
        if (next?.id && next?.username) setFullUser(next);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [user.username]);

  // Fetch follow status
  useEffect(() => {
    if (!currentUserId || !fullUser.id || currentUserId === fullUser.id) return;
    setIsLoadingFollow(true);
    fetch(`/api/follow/check?targetUserId=${fullUser.id}`)
      .then((res) => res.json())
      .then((data) => setIsFollowing(data.following))
      .catch(() => setIsFollowing(false))
      .finally(() => setIsLoadingFollow(false));
  }, [currentUserId, fullUser.id]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const profileType = fullUser.profile?.profileType ?? null;
  const profileConfig = profileType ? getProfileTypeConfig(profileType) : null;
  const profileGradient = PROFILE_GRADIENTS[profileType || "DEFAULT"] || PROFILE_GRADIENTS.DEFAULT;
  const profileBorderColor = PROFILE_BORDERS[profileType || "DEFAULT"] || PROFILE_BORDERS.DEFAULT;
  const badgeClasses = BADGE_CLASSES[profileType || "DEFAULT"] || BADGE_CLASSES.DEFAULT;

  const formatCount = (count: number | undefined | null) => {
    if (count == null) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card — matches ProfileTooltip layout */}
      <div
        ref={cardRef}
        className={cn(
          "relative w-80 rounded-2xl overflow-hidden",
          "bg-[#0d1117]",
          "border",
          profileBorderColor,
          "shadow-2xl shadow-black/60"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Gradient overlay at top */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-32 opacity-40 z-0",
          `bg-gradient-to-b ${profileGradient} to-transparent`
        )} />

        {/* Banner or gradient */}
        <div className="relative h-20 overflow-hidden">
          {fullUser.profile?.bannerUrl ? (
            <>
              <Image
                src={fullUser.profile.bannerUrl}
                alt=""
                fill
                className="object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117]" />
            </>
          ) : (
            <div className={cn(
              "absolute inset-0",
              `bg-gradient-to-br ${profileGradient}`,
              "opacity-60"
            )}>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative px-4 pb-4 -mt-8">
          {/* Avatar with ring + name inline */}
          <div className="flex items-end gap-3 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${fullUser.username}`; }}
              className="relative group"
            >
              <div className={cn(
                "absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100",
                "transition-opacity duration-300",
                `bg-gradient-to-br ${profileGradient.replace('/20', '/40')}`
              )} />
              <div className={cn(
                "relative rounded-full p-0.5",
                "bg-gradient-to-br from-[#0d1117] to-[#080b10]",
                "ring-2 ring-[#0d1117]"
              )}>
                <Avatar src={fullUser.profile?.avatarUrl || fullUser.image || undefined} size={56} />
              </div>
            </button>

            <div className="flex-1 min-w-0 pb-1">
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${fullUser.username}`; }}
                className="group flex items-center gap-1.5"
              >
                <span className="font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors truncate">
                  {fullUser.name || fullUser.username}
                </span>
                {fullUser.profile?.verified && (
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-blue-400/50 rounded-full" />
                    <svg className="relative w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </button>
              <div className="text-sm text-[var(--muted-foreground)]">@{fullUser.username}</div>
            </div>
          </div>

          {/* Profile type badge */}
          {profileConfig && profileType && (
            <div className="mb-3">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                "text-xs font-medium border shadow-sm",
                badgeClasses
              )}>
                <ProfileTypeIcon profileType={profileType} size={12} />
                {profileConfig.label}
              </span>
            </div>
          )}

          {/* Bio */}
          {fullUser.profile?.bio && (
            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-relaxed">
              {fullUser.profile.bio}
            </p>
          )}

          {/* Location and Website */}
          {(fullUser.profile?.location || fullUser.profile?.website) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs text-[var(--muted-foreground)]">
              {fullUser.profile?.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[120px]">{fullUser.profile.location}</span>
                </div>
              )}
              {fullUser.profile?.website && (
                <a
                  href={fullUser.profile.website.startsWith('http') ? fullUser.profile.website : `https://${fullUser.profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="truncate max-w-[100px]">{fullUser.profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          {fullUser._count && (fullUser._count.followers != null || fullUser._count.following != null) && (
            <div className="flex gap-4 mb-4">
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${fullUser.username}/followers`; }}
                className="group flex items-center gap-1.5 text-sm hover:text-[var(--color-accent)] transition-colors"
              >
                <span className="font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                  {formatCount(fullUser._count.followers)}
                </span>
                <span className="text-[var(--muted-foreground)] text-xs">followers</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${fullUser.username}/following`; }}
                className="group flex items-center gap-1.5 text-sm hover:text-[var(--color-accent)] transition-colors"
              >
                <span className="font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                  {formatCount(fullUser._count.following)}
                </span>
                <span className="text-[var(--muted-foreground)] text-xs">following</span>
              </button>
            </div>
          )}

          {/* Follow Button */}
          {currentUserId && fullUser.id && currentUserId !== fullUser.id && (
            <div className="relative">
              {isLoadingFollow ? (
                <div className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[var(--color-accent)]/30 border-r-[var(--color-accent)] rounded-full animate-spin" />
                </div>
              ) : (
                <FollowButton
                  targetUserId={fullUser.id}
                  initialFollowing={isFollowing}
                  onToggle={(following) => setIsFollowing(following)}
                />
              )}
            </div>
          )}
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  /* Send a media URL (image/GIF) as a message */
  const sendMediaMessage = useCallback(async (mediaUrl: string) => {
    setSending(true);
    const res = await fetch(`/api/messages/threads/${params.threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: mediaUrl }),
    });
    const data = await safeJson<any>(res);
    if (res.ok && data) {
      setThread((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), data as any] } : prev
      );
      if (pendingRequest) setHasSentRequestMsg(true);
    } else {
      alert(data?.error || "Failed to send");
    }
    setSending(false);
  }, [params.threadId, pendingRequest]);

  /* Emoji handler */
  const addEmoji = useCallback((emoji: any) => {
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
        <ProfilePreviewCard user={otherUser} currentUserId={userId} onClose={() => setShowProfilePreview(false)} />
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
                          isMediaUrl(message.content)
                            ? "p-1 overflow-hidden"
                            : "px-4 py-2.5 text-[15px] leading-snug break-words",
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
                        {isMediaUrl(message.content) ? (
                          <img
                            src={message.content.trim()}
                            alt=""
                            className="rounded-lg max-w-full max-h-64 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          message.content
                        )}
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

      {/* Emoji picker panel */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="flex-shrink-0 border-t border-white/[0.06] px-4 py-2">
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
      <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-3">
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

        {/* Upload progress indicator */}
        {uploading && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
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
                  "w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors",
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
                  "w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors",
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
                  "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  showEmojiPicker
                    ? "text-[var(--color-accent)] bg-[rgba(var(--color-accent-rgb),0.15)]"
                    : "text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)]"
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
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
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
