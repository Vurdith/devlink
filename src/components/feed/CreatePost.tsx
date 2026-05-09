"use client";
import { useState, useRef, memo, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";
import { surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { ComposerActionButton } from "./composer/ComposerActionButton";
import { ComposerLoadingPlaceholder } from "./composer/ComposerLoadingPlaceholder";
import { ComposerMediaGrid } from "./composer/ComposerMediaGrid";
import { ComposerPollSummary } from "./composer/ComposerPollSummary";
import type { PollData } from "./composer/composer-types";

// Lazy load heavy components
const EmojiPicker = lazy(() => import("emoji-picker-react"));
const CreatePoll = lazy(() => import("@/components/polls/CreatePoll").then(m => ({ default: m.CreatePoll })));

interface CreatePostProps {
  currentUserProfile?: {
    avatarUrl: string | null;
    name: string | null;
    username: string;
  };
  replyToId?: string;
  placeholder?: string;
  buttonText?: string;
  onPostCreated?: () => void;
}

export const CreatePost = memo(function CreatePost({ 
  currentUserProfile, 
  replyToId, 
  placeholder = "What's happening in the Roblox development world?", 
  buttonText = "Post",
  onPostCreated
}: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ content: "", mediaUrls: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [embedInput, setEmbedInput] = useState("");
  const [embedUrls, setEmbedUrls] = useState<string[]>([]);
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEmoji = useCallback((emoji: { emoji?: string }) => {
    const char = emoji?.emoji || "";
    if (char) setFormData(prev => ({ ...prev, content: prev.content + char }));
  }, []);

  const addEmbedUrl = useCallback(() => {
    const url = embedInput.trim();
    if (!url) return;
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) return;
    } catch { return; }
    setEmbedUrls(prev => Array.from(new Set([...prev, url])).slice(0, 5));
    setEmbedInput("");
  }, [embedInput]);

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (uploadedFiles.length + fileArray.length > 10) {
      setToastMessage('Maximum 10 images allowed.');
      setToastType("error");
      setShowToast(true);
      return;
    }
    
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));
    if (invalidFiles.length > 0) {
      setToastMessage('Please select only image or video files');
      setToastType("error");
      setShowToast(true);
      return;
    }
    
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setToastMessage('All files must be less than 5MB');
      setToastType("error");
      setShowToast(true);
      return;
    }

    setUploadedFiles(prev => [...prev, ...fileArray]);
    const newProgress: {[key: string]: number} = {};
    fileArray.forEach(file => { newProgress[file.name] = 0; });
    setUploadProgress(prev => ({ ...prev, ...newProgress }));

    for (const file of fileArray) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, data.url] }));
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          const errorData = await response.json();
          setToastMessage(`Upload failed: ${errorData.error || 'Unknown error'}`);
          setToastType("error");
          setShowToast(true);
          setUploadedFiles(prev => prev.filter(f => f !== file));
        }
      } catch {
        setToastMessage(`Upload failed for ${file.name}`);
        setToastType("error");
        setShowToast(true);
        setUploadedFiles(prev => prev.filter(f => f !== file));
      }
    }
    if (fileArray.length > 1) setIsSlideshow(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files);
  };

  const removeMedia = (index?: number) => {
    if (index !== undefined) {
      setFormData(prev => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, i) => i !== index) }));
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({ ...prev, mediaUrls: [] }));
      setUploadedFiles([]);
      setUploadProgress({});
      setIsSlideshow(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        content: formData.content,
        mediaUrls: formData.mediaUrls,
        replyToId: replyToId || undefined,
        postType: "GENERAL",
        pollData: pollData || undefined,
        isSlideshow,
        location: location.trim() || undefined,
        embedUrls: embedUrls.length ? embedUrls : undefined,
        scheduledFor: scheduledFor || undefined
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const responseData = await response.json();
        setToastMessage(responseData.message || "Post created!");
        setToastType("success");
        setShowToast(true);
        
        // Reset all state
        setIsOpen(false);
        setFormData({ content: "", mediaUrls: [] });
        setUploadedFiles([]);
        setUploadProgress({});
        setIsSlideshow(false);
        setShowEmojiPicker(false);
        setShowSchedule(false);
        setScheduledFor("");
        setLocation("");
        setShowLocationInput(false);
        setEmbedInput("");
        setEmbedUrls([]);
        setShowEmbedInput(false);
        setPollData(null);
        setShowPoll(false);
        
        if (onPostCreated) onPostCreated();
        else window.dispatchEvent(new CustomEvent("devlink:post-created"));
      } else {
        const errorData = await response.json();
        setToastMessage(`Failed: ${errorData.error || 'Unknown error'}`);
        setToastType("error");
        setShowToast(true);
      }
    } catch {
      setToastMessage("Failed to create post.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Collapsed state - with hover animations
  if (!currentUserProfile) return null;

  if (!isOpen) {
    return (
      <div 
        className={surface("panelMuted", "create-post-collapsed group relative mb-6 cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:border-white/20")}
        onClick={() => setIsOpen(true)}
      >
        {/* Shimmer effect - covers entire cell on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
        </div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/0 via-[rgba(var(--color-accent-rgb),0.03)] to-[rgba(var(--color-accent-rgb),0)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="scale-hover">
            <Avatar src={currentUserProfile.avatarUrl} size={44} className="border border-white/[0.08]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white mb-1 group-hover:text-[var(--color-accent)] transition-colors tracking-tight">
              {replyToId ? "Reply to this post" : "Create a new post"}
            </div>
            <div className="text-sm text-[var(--muted-foreground)] opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed">
              {placeholder}
            </div>
          </div>
          <button className="icon-btn p-3 rounded-xl text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/10 transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="rotate-hover">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Expanded state - with slide animations
  return (
    <>
      <div className={surface("panel", "create-post-expanded relative mb-6 overflow-hidden p-5 animate-fade-in")}>
        <form onSubmit={handleSubmit} className="relative space-y-4">
          {/* Icon Buttons Row - with stagger animation */}
          <div className={surface("toolbar", "stagger-in flex items-center gap-2 p-2")}>
            <ComposerActionButton onClick={() => fileInputRef.current?.click()} title="Add Media" shortcut="⌘I" badge={formData.mediaUrls.length || undefined} delay={1}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/></svg>
            </ComposerActionButton>
            <ComposerActionButton onClick={() => setShowPoll(!showPoll)} active={showPoll} title="Create Poll" shortcut="⌘P" delay={2}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M9 9h6M9 12h4M9 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </ComposerActionButton>
            <ComposerActionButton onClick={() => setShowEmbedInput(v => !v)} active={showEmbedInput} title="Embed Link" shortcut="⌘L" delay={3}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </ComposerActionButton>
            <ComposerActionButton onClick={() => setShowEmojiPicker(v => !v)} active={showEmojiPicker} title="Emoji" shortcut="⌘E" delay={4}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>
            </ComposerActionButton>
            <ComposerActionButton onClick={() => setShowSchedule(s => !s)} active={showSchedule} title="Schedule Post" delay={5}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="2"/></svg>
            </ComposerActionButton>
            <ComposerActionButton onClick={() => setShowLocationInput(v => !v)} active={showLocationInput} title="Add Location" delay={6}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            </ComposerActionButton>
          </div>

          {/* Conditional panels with slide animation */}
          {showEmojiPicker && (
            <div className={surface("empty", "animate-slide-down p-4")}>
              <Suspense fallback={<ComposerLoadingPlaceholder height="h-64" />}>
                <EmojiPicker onEmojiClick={addEmoji} searchDisabled skinTonesDisabled lazyLoadEmojis width="100%" />
              </Suspense>
            </div>
          )}

          {showSchedule && (
            <div className={surface("empty", "animate-slide-down p-4")}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[rgba(var(--color-accent-rgb),0.2)] rounded-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input 
                  type="datetime-local" 
                  value={scheduledFor} 
                  onChange={(e) => setScheduledFor(e.target.value)} 
                  className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none"
                />
                {scheduledFor && <button type="button" onClick={() => setScheduledFor("")} className="icon-btn p-2 text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] rounded-lg">✕</button>}
              </div>
            </div>
          )}

          {showLocationInput && (
            <div className={surface("empty", "animate-slide-down p-4")}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Add location" className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none" />
                {location && <button type="button" onClick={() => setLocation("")} className="icon-btn p-2 text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] rounded-lg">✕</button>}
              </div>
            </div>
          )}

          {showEmbedInput && (
            <div className={surface("empty", "animate-slide-down space-y-3 p-4")}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input value={embedInput} onChange={(e) => setEmbedInput(e.target.value)} placeholder="Paste a link to embed" className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none" />
                <button type="button" onClick={addEmbedUrl} className="btn-press px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors">Add</button>
              </div>
              {embedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {embedUrls.map((u, i) => (
                    <span key={i} className="animate-pop-in inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-sm">
                      <a href={u} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate max-w-[200px]">{u}</a>
                      <button type="button" onClick={() => setEmbedUrls(prev => prev.filter((_, idx) => idx !== i))} className="text-[var(--color-accent)] hover:text-[var(--color-accent)]">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*,video/*" 
            multiple 
            onChange={handleFileChange} 
            className="hidden" 
            aria-label="Upload media files"
          />

          {/* Main textarea */}
          <div className="animate-slide-up stagger-2">
            <label htmlFor="post-content" className="sr-only">
              {replyToId ? "Write your reply" : "What's on your mind?"}
            </label>
            <textarea
              id="post-content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full resize-none rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 py-3 leading-relaxed text-white outline-none transition-all placeholder:text-white/35 focus:border-[rgba(var(--color-accent-2-rgb),0.42)]"
              rows={4}
              placeholder={replyToId ? "Write your reply..." : "What's on your mind? Share updates, ideas, or projects..."}
              aria-describedby="post-hint post-count"
            />
            <div className="flex items-center justify-between mt-2">
              <span id="post-hint" className="text-xs text-[var(--muted-foreground)] opacity-60">
                Use @username to mention • #tag for topics
              </span>
              <span id="post-count" className={cn("text-xs font-bold transition-colors", formData.content.length > 280 ? "text-[var(--color-accent)]" : "text-[var(--muted-foreground)] opacity-60")} aria-live="polite">
                {formData.content.length}/500
              </span>
            </div>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && Object.values(uploadProgress).some(p => p < 100) && (
            <div className={surface("empty", "animate-slide-up space-y-2 overflow-hidden p-3")}>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)] truncate">{fileName}</span>
                    <span className="text-[var(--color-accent)]">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media Display */}
          {formData.mediaUrls.length > 0 && (
            <div className="animate-slide-up space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-glow-pulse" />
                  <span className="text-sm font-medium text-[var(--color-accent)]">Media ({formData.mediaUrls.length}/10)</span>
                </div>
                <button type="button" onClick={() => removeMedia()} className="icon-btn text-xs text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] px-3 py-1.5 rounded-lg transition-colors">Remove All</button>
              </div>
              <ComposerMediaGrid mediaUrls={formData.mediaUrls} onRemove={removeMedia} />
            </div>
          )}

          {/* Slideshow Toggle */}
          {formData.mediaUrls.length > 1 && (
            <div className="animate-slide-up p-3 bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg transition-colors", isSlideshow ? "bg-[rgba(var(--color-accent-rgb),0.3)]" : "bg-white/10")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cn(isSlideshow ? "text-[var(--color-accent)]" : "text-gray-400")}>
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M6 4v16M18 4v16" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--color-accent)]">{isSlideshow ? "Slideshow Mode" : "Grid Mode"}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSlideshow(!isSlideshow)} 
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press",
                  isSlideshow ? "bg-[var(--color-accent)] text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                )}
              >
                {isSlideshow ? "Switch to Grid" : "Switch to Slideshow"}
              </button>
            </div>
          )}

          {/* Poll */}
          {showPoll && (
            <div className="animate-slide-down">
              <Suspense fallback={<ComposerLoadingPlaceholder height="h-48" />}>
                <CreatePoll onSubmit={(data) => { setPollData(data); setShowPoll(false); }} onCancel={() => { setShowPoll(false); setPollData(null); }} />
              </Suspense>
            </div>
          )}

          {pollData && !showPoll && <ComposerPollSummary pollData={pollData} onRemove={() => setPollData(null)} />}

          {/* Submit Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (!formData.content && !pollData)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : buttonText}
            </Button>
          </div>
        </form>
      </div>

      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </>
  );
});

