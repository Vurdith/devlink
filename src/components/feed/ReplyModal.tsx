"use client";

import { useState, useEffect, useRef, memo, useCallback, Suspense, lazy } from "react";
import { useSession } from "next-auth/react";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { BaseModal, ModalActionButton, Tooltip } from "@/components/ui/BaseModal";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { cn } from "@/lib/cn";

// Lazy load heavy components
const EmojiPicker = lazy(() => import('emoji-picker-react'));
const CreatePoll = lazy(() => import('@/components/ui/CreatePoll').then(m => ({ default: m.CreatePoll })));

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      username: string;
      name: string | null;
      profile?: {
        avatarUrl: string | null;
        verified?: boolean;
      } | null;
    };
    media?: Array<{
      id: string;
      mediaUrl: string;
      mediaType: string;
    }>;
  };
  currentUserProfile?: {
    avatarUrl: string | null;
    name: string | null;
    username: string;
  } | null;
  onReplyPosted?: () => void;
}

// Loading placeholder
function LoadingPlaceholder({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
    </div>
  );
}

export const ReplyModal = memo(function ReplyModal({
  isOpen,
  onClose,
  post,
  currentUserProfile,
  onReplyPosted
}: ReplyModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [embedInput, setEmbedInput] = useState("");
  const [embedUrls, setEmbedUrls] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [pollData, setPollData] = useState<{
    question: string;
    options: string[];
    expiresAt?: Date;
    isMultiple: boolean;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      // Reset state when closing
      setContent("");
      setMediaUrls([]);
      setShowEmojiPicker(false);
      setShowSchedule(false);
      setShowEmbedInput(false);
      setShowPoll(false);
      setScheduledFor("");
      setEmbedInput("");
      setEmbedUrls([]);
      setPollData(null);
    }
  }, [isOpen]);

  const addEmoji = useCallback((emoji: any) => {
    const char = emoji?.emoji || "";
    if (char) setContent(prev => prev + char);
  }, []);

  const addEmbedUrl = useCallback(() => {
    if (embedInput.trim() && embedUrls.length < 3) {
      setEmbedUrls(prev => [...prev, embedInput.trim()]);
      setEmbedInput("");
    }
  }, [embedInput, embedUrls.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (mediaUrls.length >= 4) break;
      
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setMediaUrls(prev => [...prev, data.url]);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !pollData) || !session?.user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          replyToId: post.id,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          embedUrls: embedUrls.length > 0 ? embedUrls : undefined,
          scheduledFor: scheduledFor || undefined,
          pollData: pollData || undefined,
        }),
      });

      if (response.ok) {
        setContent("");
        setMediaUrls([]);
        setEmbedUrls([]);
        setScheduledFor("");
        setPollData(null);
        onClose();
        onReplyPosted?.();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerRight = (
    <Button
      onClick={handleSubmit}
      disabled={(!content.trim() && !pollData) || isSubmitting}
      isLoading={isSubmitting}
      size="sm"
    >
      Reply
    </Button>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 p-2 bg-black/30 rounded-xl border border-white/10">
        {/* Hidden file input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*,video/*,image/gif" 
          multiple 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {/* Media button */}
        <ModalActionButton 
          onClick={() => fileInputRef.current?.click()} 
          tooltip="Add media (max 4)"
          badge={mediaUrls.length || undefined}
          disabled={mediaUrls.length >= 4}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </ModalActionButton>
        
        {/* Poll button */}
        <ModalActionButton 
          onClick={() => setShowPoll(!showPoll)} 
          tooltip="Create a poll"
          active={showPoll || !!pollData}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 9h6M9 12h4M9 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ModalActionButton>
        
        {/* Embed link button */}
        <ModalActionButton 
          onClick={() => setShowEmbedInput(!showEmbedInput)} 
          tooltip="Embed a link"
          active={showEmbedInput}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ModalActionButton>
        
        {/* Emoji button */}
        <ModalActionButton 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
          tooltip="Add emoji"
          active={showEmojiPicker}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="9" r="1" fill="currentColor"/>
            <circle cx="15" cy="9" r="1" fill="currentColor"/>
          </svg>
        </ModalActionButton>
        
        {/* Schedule button */}
        <ModalActionButton 
          onClick={() => setShowSchedule(!showSchedule)} 
          tooltip="Schedule reply"
          active={showSchedule}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </ModalActionButton>
      </div>
      
      {/* Character count with progress ring */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "text-sm font-medium",
          content.length > 450 
            ? "text-amber-400" 
            : content.length > 480 
              ? "text-red-400" 
              : "text-[var(--muted-foreground)]"
        )}>
          {content.length}/500
        </div>
        
        {/* Progress ring */}
        <Tooltip content={`${500 - content.length} characters remaining`}>
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-white/10"
              />
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray={`${(content.length / 500) * 62.83} 62.83`}
                className={cn(
                  "transition-all",
                  content.length > 480 ? "text-red-400" : content.length > 450 ? "text-amber-400" : "text-purple-400"
                )}
              />
            </svg>
          </div>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerRight={headerRight}
      footer={footer}
      contentClassName="px-4 py-4"
    >
      {/* Original post preview */}
      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-white/20">
            {post.user.profile?.avatarUrl ? (
              <Image
                src={post.user.profile.avatarUrl}
                alt={post.user.username}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                {(post.user.name || post.user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Connection line */}
          <div className="w-0.5 flex-1 bg-gradient-to-b from-purple-500/50 to-transparent mt-2 mb-2 min-h-[20px]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm truncate">
              {post.user.name || post.user.username}
            </span>
            {post.user.profile?.verified && (
              <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-[var(--muted-foreground)] text-sm">@{post.user.username}</span>
            <span className="text-[var(--muted-foreground)] text-sm">·</span>
            <TimeAgo date={post.createdAt} className="text-[var(--muted-foreground)] text-sm" />
          </div>
          <p className="text-white/80 text-sm whitespace-pre-wrap break-words line-clamp-3">
            {post.content}
          </p>
          <p className="text-[var(--muted-foreground)] text-sm mt-2">
            Replying to <span className="text-purple-400">@{post.user.username}</span>
          </p>
        </div>
      </div>
      
      {/* Reply input area */}
      <div className="flex gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-purple-500/30">
          {currentUserProfile?.avatarUrl ? (
            <Image
              src={currentUserProfile.avatarUrl}
              alt={currentUserProfile.username}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
              {(currentUserProfile?.name || currentUserProfile?.username || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your reply..."
            className="w-full bg-transparent text-white text-base placeholder:text-[var(--muted-foreground)] resize-none outline-none min-h-[80px]"
            maxLength={500}
          />
          
          {/* Conditional panels */}
          {showEmojiPicker && (
            <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10 animate-slide-down">
              <Suspense fallback={<LoadingPlaceholder />}>
                <EmojiPicker 
                  onEmojiClick={addEmoji} 
                  searchDisabled 
                  skinTonesDisabled 
                  lazyLoadEmojis 
                  width="100%" 
                  height={280}
                />
              </Suspense>
            </div>
          )}

          {showSchedule && (
            <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10 animate-slide-down">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input 
                  type="datetime-local" 
                  value={scheduledFor} 
                  onChange={(e) => setScheduledFor(e.target.value)} 
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 transition-colors text-white" 
                />
                {scheduledFor && (
                  <Tooltip content="Clear scheduled time">
                    <button type="button" onClick={() => setScheduledFor("")} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">✕</button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {showEmbedInput && (
            <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10 animate-slide-down space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input 
                  value={embedInput} 
                  onChange={(e) => setEmbedInput(e.target.value)} 
                  placeholder="Paste a link to embed" 
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 transition-colors text-white placeholder:text-gray-500" 
                />
                <button 
                  type="button" 
                  onClick={addEmbedUrl} 
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
              {embedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {embedUrls.map((u, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-sm">
                      <a href={u} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate max-w-[200px]">{u}</a>
                      <Tooltip content="Remove link">
                        <button type="button" onClick={() => setEmbedUrls(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">✕</button>
                      </Tooltip>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll Creator */}
          {showPoll && (
            <div className="mt-3 animate-slide-down">
              <Suspense fallback={<LoadingPlaceholder height="h-48" />}>
                <CreatePoll 
                  onSubmit={(data) => { 
                    setPollData(data); 
                    setShowPoll(false); 
                  }} 
                  onCancel={() => { 
                    setShowPoll(false); 
                    setPollData(null); 
                  }} 
                />
              </Suspense>
            </div>
          )}

          {/* Poll Preview (after creation) */}
          {pollData && !showPoll && (
            <div className="mt-3 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl animate-pop-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">{pollData.question}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {pollData.options.length} options • {pollData.isMultiple ? "Multiple choice" : "Single choice"}
                    </div>
                  </div>
                </div>
                <Tooltip content="Remove poll">
                  <button type="button" onClick={() => setPollData(null)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
          
          {/* Media preview */}
          {mediaUrls.length > 0 && (
            <div className={cn(
              "grid gap-2 mt-3 rounded-xl overflow-hidden",
              mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group aspect-video">
                  <img 
                    src={url} 
                    alt={`Media ${index + 1}`} 
                    className="w-full h-full object-cover rounded-xl border border-white/10" 
                  />
                  <Tooltip content="Remove media">
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                <span>Uploading media...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
});

export default ReplyModal;
