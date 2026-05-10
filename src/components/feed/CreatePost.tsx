"use client";
import { useState, useRef, memo, useCallback, lazy, Suspense, useMemo } from "react";
import { BarChart3, CalendarClock, Clock3, Film, ImagePlus, Link2, MapPin, Plus, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";
import { iconBox, surface } from "@/components/ui/design-system";
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
  placeholder = "Share a build note, blocker, clip, or hiring ask.", 
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

  const uploadEntries = useMemo(() => Object.entries(uploadProgress), [uploadProgress]);
  const hasActiveUpload = useMemo(() => uploadEntries.some(([, progress]) => progress < 100), [uploadEntries]);
  const isSubmitDisabled = isSubmitting || (!formData.content && !pollData);

  const openComposer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const openMediaPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const togglePoll = useCallback(() => {
    setShowPoll(prev => !prev);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  const toggleSchedule = useCallback(() => {
    setShowSchedule(prev => !prev);
  }, []);

  const toggleLocationInput = useCallback(() => {
    setShowLocationInput(prev => !prev);
  }, []);

  const toggleEmbedInput = useCallback(() => {
    setShowEmbedInput(prev => !prev);
  }, []);

  const closeComposer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearSchedule = useCallback(() => {
    setScheduledFor("");
  }, []);

  const clearLocation = useCallback(() => {
    setLocation("");
  }, []);

  const clearPoll = useCallback(() => {
    setPollData(null);
  }, []);

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

  const removeEmbedUrl = useCallback((index: number) => {
    setEmbedUrls(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleFileUpload = useCallback(async (files: FileList) => {
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
  }, [uploadedFiles.length]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files);
  }, [handleFileUpload]);

  const removeMedia = useCallback((index?: number) => {
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
  }, []);

  const removeAllMedia = useCallback(() => {
    removeMedia();
  }, [removeMedia]);

  const submitPoll = useCallback((data: PollData) => {
    setPollData(data);
    setShowPoll(false);
  }, []);

  const cancelPoll = useCallback(() => {
    setShowPoll(false);
    setPollData(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [embedUrls, formData.content, formData.mediaUrls, isSlideshow, location, onPostCreated, pollData, replyToId, scheduledFor]);

  // Collapsed state - with hover animations
  if (!currentUserProfile) return null;

  if (!isOpen) {
    return (
      <div 
        className={surface("panelMuted", "create-post-collapsed group relative mb-6 cursor-pointer overflow-hidden p-4 transition-colors duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-[rgba(13,18,26,0.76)] sm:p-5")}
        onClick={openComposer}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.5)] to-transparent opacity-60" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full border border-[rgba(var(--color-accent-2-rgb),0.16)] bg-[rgba(var(--color-accent-2-rgb),0.05)]" />
            <Avatar src={currentUserProfile.avatarUrl} size={46} className="relative border border-white/[0.10]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-white tracking-tight">
              <span>{replyToId ? "Write a reply" : "Share an update"}</span>
            </div>
            <div className="truncate text-sm leading-relaxed text-[var(--muted-foreground)] transition-colors group-hover:text-white/72">
              {placeholder}
            </div>
          </div>
          <button
            type="button"
            aria-label={replyToId ? "Open reply composer" : "Open post composer"}
            className="rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.08)] p-3 text-[var(--color-accent-2)] transition-all duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.4)] hover:bg-[rgba(var(--color-accent-2-rgb),0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded state - with slide animations
  return (
    <>
      <div className={surface("panel", "create-post-expanded relative mb-6 overflow-hidden p-4 animate-fade-in sm:p-5")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.46)] to-transparent" />
        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="flex items-start gap-3">
            <Avatar src={currentUserProfile.avatarUrl} size={42} className="border border-white/[0.10]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">{replyToId ? "Replying" : "New post"}</div>
              <div className="text-xs text-[var(--muted-foreground)]">@{currentUserProfile.username}</div>
            </div>
          </div>

          <div className={surface("toolbar", "stagger-in flex flex-wrap items-center gap-2 p-2")}>
            <ComposerActionButton onClick={openMediaPicker} title="Add media" shortcut="Ctrl I" badge={formData.mediaUrls.length || undefined} delay={1}>
              <ImagePlus className="h-5 w-5" />
            </ComposerActionButton>
            <ComposerActionButton onClick={togglePoll} active={showPoll} title="Add poll" shortcut="Ctrl P" delay={2}>
              <BarChart3 className="h-5 w-5" />
            </ComposerActionButton>
            <ComposerActionButton onClick={toggleEmbedInput} active={showEmbedInput} title="Add link" shortcut="Ctrl L" delay={3}>
              <Link2 className="h-5 w-5" />
            </ComposerActionButton>
            <ComposerActionButton onClick={toggleEmojiPicker} active={showEmojiPicker} title="Emoji" shortcut="Ctrl E" delay={4}>
              <Smile className="h-5 w-5" />
            </ComposerActionButton>
            <ComposerActionButton onClick={toggleSchedule} active={showSchedule} title="Schedule" delay={5}>
              <CalendarClock className="h-5 w-5" />
            </ComposerActionButton>
            <ComposerActionButton onClick={toggleLocationInput} active={showLocationInput} title="Add location" delay={6}>
              <MapPin className="h-5 w-5" />
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
                <div className={iconBox("cyan", "h-9 w-9")}>
                  <Clock3 className="h-4.5 w-4.5 text-[var(--color-accent)]" />
                </div>
                <input 
                  type="datetime-local" 
                  value={scheduledFor} 
                  onChange={(e) => setScheduledFor(e.target.value)} 
                  className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none"
                />
                {scheduledFor && <button type="button" onClick={clearSchedule} className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]" aria-label="Clear schedule"><X className="h-4 w-4" /></button>}
              </div>
            </div>
          )}

          {showLocationInput && (
            <div className={surface("empty", "animate-slide-down p-4")}>
              <div className="flex items-center gap-3">
                <div className={iconBox("cyan", "h-9 w-9")}>
                  <MapPin className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Add location" className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none" />
                {location && <button type="button" onClick={clearLocation} className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]" aria-label="Clear location"><X className="h-4 w-4" /></button>}
              </div>
            </div>
          )}

          {showEmbedInput && (
            <div className={surface("empty", "animate-slide-down space-y-3 p-4")}>
              <div className="flex items-center gap-3">
                <div className={iconBox("cyan", "h-9 w-9")}>
                  <Link2 className="h-4.5 w-4.5 text-[var(--color-accent-2)]" />
                </div>
                <input value={embedInput} onChange={(e) => setEmbedInput(e.target.value)} placeholder="Paste a link to embed" className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none" />
                <button type="button" onClick={addEmbedUrl} className="rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.26)] bg-[rgba(var(--color-accent-2-rgb),0.10)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-2)] transition-colors hover:bg-[rgba(var(--color-accent-2-rgb),0.16)]">Add</button>
              </div>
              {embedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {embedUrls.map((u, i) => (
                    <span key={i} className="animate-pop-in inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.30)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-sm">
                      <a href={u} target="_blank" rel="noreferrer" className="text-[var(--color-accent-2)] hover:underline truncate max-w-[200px]">{u}</a>
                      <button type="button" onClick={() => removeEmbedUrl(i)} className="text-[var(--muted-foreground)] transition-colors hover:text-white" aria-label="Remove embed"><X className="h-3.5 w-3.5" /></button>
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
              {replyToId ? "Write your reply" : "Write a post"}
            </label>
            <textarea
              id="post-content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full resize-none rounded-lg border border-white/[0.10] bg-white/[0.035] px-4 py-3 leading-relaxed text-white outline-none transition-colors placeholder:text-white/35 focus:border-[rgba(var(--color-accent-2-rgb),0.42)]"
              rows={4}
              placeholder={replyToId ? "Add a useful reply..." : "Share a shipped change, blocker, hiring ask, or build note..."}
              aria-describedby="post-hint post-count"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span id="post-hint" className="text-xs text-[var(--muted-foreground)] opacity-60">
                Mention @username or add #topics
              </span>
              <span id="post-count" className={cn("text-xs font-bold transition-colors", formData.content.length > 280 ? "text-[var(--color-accent)]" : "text-[var(--muted-foreground)] opacity-60")} aria-live="polite">
                {formData.content.length}/500
              </span>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadEntries.length > 0 && hasActiveUpload && (
            <div className={surface("empty", "animate-slide-up space-y-2 overflow-hidden p-3")}>
              {uploadEntries.map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)] truncate">{fileName}</span>
                    <span className="text-[var(--color-accent)]">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
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
                <button type="button" onClick={removeAllMedia} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.055] hover:text-white">Remove all</button>
              </div>
              <ComposerMediaGrid mediaUrls={formData.mediaUrls} onRemove={removeMedia} />
            </div>
          )}

          {/* Slideshow Toggle */}
          {formData.mediaUrls.length > 1 && (
            <div className="animate-slide-up flex items-center justify-between rounded-lg border border-[rgba(var(--color-accent-rgb),0.18)] bg-[rgba(var(--color-accent-rgb),0.08)] p-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg transition-colors", isSlideshow ? "bg-[rgba(var(--color-accent-rgb),0.3)]" : "bg-white/10")}>
                  <Film className={cn("h-4.5 w-4.5", isSlideshow ? "text-[var(--color-accent)]" : "text-gray-400")} />
                </div>
                <span className="text-sm font-medium text-[var(--color-accent)]">{isSlideshow ? "Swipeable media" : "Media grid"}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSlideshow(prev => !prev)}
                className={cn(
                  "btn-press rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
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
                <CreatePoll onSubmit={submitPoll} onCancel={cancelPoll} />
              </Suspense>
            </div>
          )}

          {pollData && !showPoll && <ComposerPollSummary pollData={pollData} onRemove={clearPoll} />}

          {/* Submit Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={closeComposer}
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-[var(--muted-foreground)] transition-colors hover:text-white"
            >
              Cancel
            </button>
            <Button 
              type="submit" 
              disabled={isSubmitDisabled}
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

