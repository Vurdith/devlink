"use client";
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CreatePoll } from "@/components/ui/CreatePoll";
import { Toast } from "@/components/ui/Toast";

interface CreatePostProps {
  currentUserProfile?: {
    avatarUrl: string | null;
    name: string;
    username: string;
  };
  replyToId?: string;
  placeholder?: string;
  buttonText?: string;
  onPostCreated?: () => void;
}

export function CreatePost({ 
  currentUserProfile, 
  replyToId, 
  placeholder = "What's happening in the Roblox development world?", 
  buttonText = "Post",
  onPostCreated
}: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    mediaUrls: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [showSlideshowPrompt, setShowSlideshowPrompt] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [embedInput, setEmbedInput] = useState<string>("");
  const [embedUrls, setEmbedUrls] = useState<string[]>([]);
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  // Emoji Picker

  const addEmoji = (emoji: any) => {
    const char = emoji?.emoji || "";
    if (!char) return;
    setFormData(prev => ({ ...prev, content: (prev.content || "") + char }));
  };

  const addEmbedUrl = () => {
    const url = embedInput.trim();
    console.log("Adding embed URL:", url);
    if (!url) return;
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) {
        console.log("Invalid protocol:", u.protocol);
        return;
      }
    } catch (error) {
      console.log("Invalid URL:", error);
      return;
    }
    setEmbedUrls(prev => {
      const newUrls = Array.from(new Set([...prev, url])).slice(0, 5);
      console.log("Updated embed URLs:", newUrls);
      return newUrls;
    });
    setEmbedInput("");
  };

  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState<{
    question: string;
    options: string[];
    expiresAt?: Date;
    isMultiple: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Don't render if no user profile (user not authenticated)
  if (!currentUserProfile) {
    return null;
  }

  // Enhanced mentions and tags parsing
  const parseContent = (content: string) => {
    const mentions = content.match(/@(\w+)/g) || [];
    const tags = content.match(/#(\w+)/g) || [];
    
    return {
      content,
      mentions: mentions.map(m => m.slice(1)), // Remove @ symbol
      tags: tags.map(t => t.slice(1)) // Remove # symbol
    };
  };

  // File upload handler
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the 10 image limit
    if (uploadedFiles.length + fileArray.length > 10) {
      setToastMessage('Maximum 10 images allowed. Please remove some images first.');
      setToastType("error");
      setShowToast(true);
      return;
    }
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => 
      !file.type.startsWith('image/') && !file.type.startsWith('video/')
    );
    
    if (invalidFiles.length > 0) {
      setToastMessage('Please select only image or video files');
      setToastType("error");
      setShowToast(true);
      return;
    }
    
    // Validate file sizes (5MB limit)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setToastMessage('All files must be less than 5MB');
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Add files to state
    setUploadedFiles(prev => [...prev, ...fileArray]);
    
    // Initialize progress for each file
    const newProgress: {[key: string]: number} = {};
    fileArray.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(prev => ({ ...prev, ...newProgress }));

    // Upload each file
    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, data.url] }));
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          const errorData = await response.json();
          setToastMessage(`Upload failed for ${file.name}: ${errorData.error || 'Unknown error'}`);
          setToastType("error");
          setShowToast(true);
          setUploadedFiles(prev => prev.filter(f => f !== file));
        }
      } catch (error) {
        console.error('Upload error:', error);
        setToastMessage(`Upload failed for ${file.name}. Please try again.`);
        setToastType("error");
        setShowToast(true);
        setUploadedFiles(prev => prev.filter(f => f !== file));
      }
    }

    // Show slideshow prompt if multiple images
    if (fileArray.length > 1) {
      setShowSlideshowPrompt(true);
    }
  };

  const handleSlideshowToggle = (enabled: boolean) => {
    setIsSlideshow(enabled);
    setShowSlideshowPrompt(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeMedia = (index?: number) => {
    if (index !== undefined) {
      // Remove specific media
      setFormData(prev => ({ 
        ...prev, 
        mediaUrls: prev.mediaUrls.filter((_, i) => i !== index) 
      }));
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove all media
      setFormData(prev => ({ ...prev, mediaUrls: [] }));
      setUploadedFiles([]);
      setUploadProgress({});
      setIsSlideshow(false);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsedContent = parseContent(formData.content);
      
      const postData = {
        content: formData.content,
        mediaUrls: formData.mediaUrls,
        replyToId: replyToId || undefined,
        postType: "GENERAL", // Always general for simplicity
        pollData: pollData || undefined, // Include poll data in the same request
        isSlideshow: isSlideshow, // Include slideshow preference
        location: location.trim() || undefined,
        embedUrls: embedUrls.length ? embedUrls : undefined,
        scheduledFor: scheduledFor || undefined
      };

      console.log("Creating post with data:", postData);
      
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Post creation response:", responseData);
        
        // Show success message for all posts
        if (responseData.message) {
          console.log("Showing success toast:", responseData.message);
          setToastMessage(responseData.message);
          setToastType("success");
          setShowToast(true);
        } else {
          console.log("No message in response, showing default success");
          setToastMessage("Post created successfully!");
          setToastType("success");
          setShowToast(true);
        }
        
        setIsOpen(false);
        setFormData({
          content: "",
          mediaUrls: []
        });
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
        
        // Call callback if provided
        if (onPostCreated) {
          onPostCreated();
        } else {
          // Dispatch event to refresh the feed
          window.dispatchEvent(new CustomEvent("devlink:post-created"));
        }
      } else {
        const errorData = await response.json();
        console.log("Post creation error:", errorData);
        setToastMessage(`Failed to create post: ${errorData.error || 'Unknown error'}`);
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Post creation error:", error);
      setToastMessage("Failed to create post. Please try again.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePollSubmit = (pollData: {
    question: string;
    options: string[];
    expiresAt?: Date;
    isMultiple: boolean;
  }) => {
    setPollData(pollData);
    setShowPoll(false);
  };

  const handlePollCancel = () => {
    setShowPoll(false);
    setPollData(null);
  };

  if (!isOpen) {
    return (
      <motion.div 
        className="glass rounded-[var(--radius)] p-4 mb-6 border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer group"
        whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 255, 0.4)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Avatar src={currentUserProfile.avatarUrl} size={40} />
          <div className="flex-1">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full text-left text-[var(--muted-foreground)] group-hover:text-white transition-colors"
            >
              <div className="text-sm font-medium text-white mb-1">
                {replyToId ? "Reply to this post" : "Create a new post"}
              </div>
              <div className="text-sm opacity-70">
                {placeholder}
              </div>
            </button>
          </div>
          <motion.button
            onClick={() => setIsOpen(true)}
            className="text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence>
      <motion.div 
        className=""
        initial={{ opacity: 0, height: 0, scale: 0.9 }}
        animate={{ opacity: 1, height: "auto", scale: 1 }}
        exit={{ opacity: 0, height: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium mb-2">Content (optional)</label>
            
            {/* Icon Buttons Row */}
            <div className="flex items-center gap-4 mb-3 p-2 bg-black/20 rounded-lg border border-white/10">
              {/* Image Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors relative"
                title="Add image or video"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {formData.mediaUrls.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {formData.mediaUrls.length}
                  </span>
                )}
              </button>

              {/* GIF */}
              <button
                type="button"
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors"
                title="Add GIF"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>

              {/* Poll */}
              <button
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                className={`p-2 rounded-lg transition-colors ${
                  showPoll 
                    ? 'text-[var(--accent)] bg-[var(--accent)]/20' 
                    : 'text-[var(--accent)] hover:bg-[var(--accent)]/20'
                }`}
                title={formData.mediaUrls.length > 0 ? "Create poll (appears below media)" : "Create poll"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Link */}
              <button
                type="button"
                onClick={() => setShowEmbedInput(v => !v)}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors"
                title="Add link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Emoji */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(v => !v)}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors"
                title="Add emoji"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Schedule */}
              <button
                type="button"
                onClick={() => setShowSchedule(s => !s)}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors"
                title="Schedule post"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="14" r="1" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="16" cy="14" r="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>

              {/* Location */}
              <button
                type="button"
                onClick={() => setShowLocationInput(v => !v)}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-colors"
                title="Add location"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-6 mb-4 p-4 bg-black/20 rounded-lg border border-white/10">
                <EmojiPicker onEmojiClick={(e: any) => addEmoji(e)} searchDisabled skinTonesDisabled lazyLoadEmojis width="100%" />
              </div>
            )}

            {/* Schedule Controls */}
            {showSchedule && (
              <div className="mt-6 mb-4 p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <input 
                    type="datetime-local" 
                    value={scheduledFor} 
                    onChange={(e) => {
                      console.log("Schedule input changed:", e.target.value);
                      setScheduledFor(e.target.value);
                    }} 
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" 
                  />
                  {scheduledFor && (
                    <button type="button" onClick={() => setScheduledFor("")} className="text-xs text-red-400 px-2 py-1 hover:bg-red-400/10 rounded">Clear</button>
                  )}
                </div>
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="mt-6 mb-4 p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <input 
                    value={location} 
                    onChange={(e) => {
                      console.log("Location input changed:", e.target.value);
                      setLocation(e.target.value);
                    }} 
                    placeholder="Add location" 
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" 
                  />
                  <button type="button" onClick={() => setLocation("")} className="text-xs text-red-400 px-2 py-1 hover:bg-red-400/10 rounded">Remove</button>
                </div>
              </div>
            )}

            {/* Embed Links */}
            {showEmbedInput && (
              <div className="mt-6 mb-4 p-4 bg-black/20 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    value={embedInput} 
                    onChange={(e) => setEmbedInput(e.target.value)} 
                    placeholder="Paste a link to embed" 
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" 
                  />
                  <button type="button" onClick={addEmbedUrl} className="text-xs px-3 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded hover:bg-[var(--accent)]/30 transition-colors">Add</button>
                </div>
                {embedUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {embedUrls.map((u, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/20 bg-black/30">
                        <a href={u} target="_blank" className="underline hover:text-[var(--accent)] transition-colors" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{u}</a>
                        <button type="button" onClick={() => setEmbedUrls(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:bg-red-400/10 rounded px-1">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:border-[var(--accent)] outline-none"
              rows={4}
              placeholder={replyToId ? "Write your reply..." : "What's on your mind? Use @username to mention users and #tag for topics"}
            />
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              Content is optional if you're creating a poll. Use @username to mention users and #tag for topics
            </div>
          </motion.div>

          {/* Media Upload Progress and Display */}
          <AnimatePresence>
            {Object.keys(uploadProgress).length > 0 && Object.values(uploadProgress).some(progress => progress < 100) && (
              <motion.div 
                className="w-full bg-black/20 rounded-lg overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="mb-2">
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">{fileName}</div>
                    <motion.div 
                      className="h-2 bg-[var(--accent)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Display */}
          {formData.mediaUrls.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[var(--accent)]">Uploaded Media</h4>
                <motion.button
                  type="button"
                  onClick={() => removeMedia()}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove All
                </motion.button>
              </div>
              
              {/* X.com-style grid layout */}
              <div className={`grid gap-0.5 ${
                formData.mediaUrls.length === 1 ? 'grid-cols-1' :
                formData.mediaUrls.length === 2 ? 'grid-cols-2' :
                formData.mediaUrls.length === 3 ? 'grid-cols-3' :
                formData.mediaUrls.length === 4 ? 'grid-cols-4' :
                formData.mediaUrls.length <= 6 ? 'grid-cols-6' :
                formData.mediaUrls.length <= 9 ? 'grid-cols-6' :
                'grid-cols-8'
              }`}>
                {formData.mediaUrls.map((url, index) => (
                  <div key={index} className={`relative group ${
                    formData.mediaUrls.length === 1 ? 'col-span-1' :
                    formData.mediaUrls.length === 2 ? 'col-span-1' :
                    formData.mediaUrls.length === 3 ? 'col-span-1' :
                    formData.mediaUrls.length === 4 ? 'col-span-1' :
                    formData.mediaUrls.length <= 6 ? 'col-span-1' :
                    formData.mediaUrls.length <= 9 ? 'col-span-1' :
                    'col-span-1'
                  }`}>
                    <img 
                      src={url} 
                      alt={`Media ${index + 1}`}
                      className={`w-full h-full object-cover rounded border border-white/20 ${
                        formData.mediaUrls.length === 1 ? 'max-h-32' :
                        formData.mediaUrls.length === 2 ? 'h-12' :
                        formData.mediaUrls.length === 3 ? 'h-8' :
                        formData.mediaUrls.length === 4 ? 'h-6' :
                        formData.mediaUrls.length <= 6 ? 'h-5' :
                        formData.mediaUrls.length <= 9 ? 'h-4' :
                        'h-3'
                      }`}
                    />
                    <motion.button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className={`absolute top-0.5 right-0.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        formData.mediaUrls.length <= 3 ? 'p-0.5' :
                        formData.mediaUrls.length <= 6 ? 'p-0.5' :
                        'p-0.5'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className={`${
                        formData.mediaUrls.length <= 3 ? 'w-1.5 h-1.5' :
                        formData.mediaUrls.length <= 6 ? 'w-1 h-1' :
                        'w-1 h-1'
                      }`} viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  </div>
                ))}
              </div>
              
              {/* Image Counter */}
              <div className="flex justify-start">
                <div className="text-xs text-[var(--muted-foreground)] bg-black/20 px-2 py-1 rounded">
                  {formData.mediaUrls.length}/10
                </div>
              </div>
            </motion.div>
          )}

          {/* Slideshow Prompt */}
          <AnimatePresence>
            {showSlideshowPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--accent)]">Multiple Images Detected</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">Would you like to create a slideshow?</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleSlideshowToggle(true)}
                      className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded text-xs hover:bg-[var(--accent)]/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Yes
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleSlideshowToggle(false)}
                      className="px-3 py-1 bg-black/30 text-white rounded text-xs hover:bg-black/50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      No
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slideshow Status */}
          {formData.mediaUrls.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm text-[var(--accent)]">
                    {isSlideshow ? "Slideshow Mode" : "Grid Mode"}
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIsSlideshow(!isSlideshow)}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Toggle
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Poll Creation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <AnimatePresence>
              {showPoll && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <CreatePoll
                    onSubmit={handlePollSubmit}
                    onCancel={handlePollCancel}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {pollData && !showPoll && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Poll: {pollData.question}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {pollData.options.length} options • {pollData.isMultiple ? "Multiple choice" : "Single choice"}
                      {pollData.expiresAt && ` • Expires ${pollData.expiresAt.toLocaleDateString()}`}
                    </div>
                    {formData.mediaUrls.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ✅ Poll will appear below your media
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPollData(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            className="flex justify-end gap-3 pt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting || (!formData.content && !pollData)}
              >
                {isSubmitting ? "Creating..." : buttonText}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </AnimatePresence>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
