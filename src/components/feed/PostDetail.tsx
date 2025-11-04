"use client";

import { useState, useRef, useEffect, memo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { PollDisplay } from "@/components/ui/PollDisplay";
import { EditPostModal } from "@/components/feed/EditPostModal";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { ReportButton } from "@/components/ui/ReportButton";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { getProfileTypeConfig } from "@/lib/profile-types";

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  location?: string | null;
  embedUrls?: string | string[] | null;
  isScheduled?: boolean;
  scheduledFor?: Date | null;
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      avatarUrl: string | null;
      profileType: string;
      verified: boolean;
    };
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    order: number;
  }>;
  isSlideshow: boolean;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      isSelected?: boolean;
    }>;
    isMultiple: boolean;
    expiresAt: Date;
    totalVotes: number;
  };
  likes?: Array<{ id: string; userId: string }>;
  reposts?: Array<{ id: string; userId: string }>;
  replies?: Array<{ id: string; userId: string }>;
  views: number;
  isPinned: boolean;
  savedBy?: Array<{ id: string; userId: string }>;
  replyTo?: {
    id: string;
    user: {
      username: string;
    };
  };
}

interface PostDetailProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
  isOnPostPage?: boolean;
  showPinnedTag?: boolean;
}

const PostDetail = memo(function PostDetail({ post, onUpdate, isOnPostPage = false, showPinnedTag = false }: PostDetailProps) {
  const { data: session } = useSession();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'slideshow' | 'grid' | null;
    currentIndex: number;
  }>({
    isOpen: false,
    type: null,
    currentIndex: 0
  });
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [explosionAnimations, setExplosionAnimations] = useState<{
    like: boolean;
    repost: boolean;
    save: boolean;
  }>({ like: false, repost: false, save: false });
  
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const repostButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize saved state
  useEffect(() => {
    if (session?.user?.id && post.savedBy) {
      setIsSaved(post.savedBy.some(saved => saved.userId === session.user.id));
    }
  }, [session?.user?.id, post.savedBy]);


  // Keyboard navigation for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalState.isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          if (modalState.type === 'slideshow') {
            event.preventDefault();
            prevSlide();
          }
          break;
        case 'ArrowRight':
          if (modalState.type === 'slideshow') {
            event.preventDefault();
            nextSlide();
          }
          break;
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalState.isOpen, modalState.type, post.media]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset modal state on unmount
      setModalState({
        isOpen: false,
        type: null,
        currentIndex: 0
      });
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, []);


  // Track view when component mounts (only once per session)
  useEffect(() => {
    const trackView = async () => {
      // Check if we've already tracked this view in this session
      const viewKey = `viewed_${post.id}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      if (hasViewed) {
        return; // Already tracked this view
      }

      try {
        const response = await fetch(`/api/posts/${post.id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          // Mark as viewed in session storage
          sessionStorage.setItem(viewKey, 'true');
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Add a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(trackView, 100);
    
    return () => clearTimeout(timeoutId);
  }, [post.id]);

  // Close actions menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      setShowActionsMenu(false);
      setShowDeleteConfirm(false);
      setModalState({
        isOpen: false,
        type: null,
        currentIndex: 0
      });
    };
  }, []);

  const isLiked = post.likes?.some(like => like.userId === session?.user?.id) || false;
  const isReposted = post.reposts?.some(repost => repost.userId === session?.user?.id) || false;
  const isOwnPost = session?.user?.id === post.userId;

  const handleLike = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        // Update local state immediately
        if (isLiked) {
          post.likes = (post.likes || []).filter(like => like.userId !== session.user.id);
        } else {
          if (!post.likes) post.likes = [];
          post.likes.push({ id: Date.now().toString(), userId: session.user.id });
          triggerExplosion('like');
        }
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/posts/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        // Update local state immediately
        if (isReposted) {
          post.reposts = (post.reposts || []).filter(repost => repost.userId !== session.user.id);
        } else {
          if (!post.reposts) post.reposts = [];
          post.reposts.push({ id: Date.now().toString(), userId: session.user.id });
          triggerExplosion('repost');
        }
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error reposting post:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save: !isSaved }),
      });

      if (response.ok) {
        // Update local state immediately
        if (isSaved) {
          post.savedBy = post.savedBy?.filter(saved => saved.userId !== session.user.id) || [];
        } else {
          if (!post.savedBy) post.savedBy = [];
          post.savedBy.push({ id: Date.now().toString(), userId: session.user.id });
          triggerExplosion('save');
        }
        setIsSaved(!isSaved);
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handlePin = async () => {
    if (!session?.user?.id || !isOwnPost) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: !post.isPinned }),
      });

      if (response.ok) {
        // Update local state immediately
        post.isPinned = !post.isPinned;
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handlePollVote = async (optionIds: string[]) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId: post.poll?.id,
          optionIds,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated poll results
        window.location.reload();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const handleDelete = () => {
    if (!session?.user?.id || !isOwnPost) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        // If we're on a post page, redirect to home
        if (window.location.pathname.startsWith('/p/')) {
          window.location.href = '/home';
        } else {
          // If we're on a feed, refresh the page to remove the deleted post
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const triggerExplosion = (type: 'like' | 'repost' | 'save') => {
    setExplosionAnimations(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setExplosionAnimations(prev => ({ ...prev, [type]: false }));
    }, 800);
  };

  const openModal = (type: 'slideshow' | 'grid', index: number = 0) => {
    if (!post.media || post.media.length === 0) return;
    if (index < 0 || index >= post.media.length) return;
    
    setModalState({
      isOpen: true,
      type,
      currentIndex: index
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      currentIndex: 0
    });
  };

  const nextSlide = () => {
    if (!post.media || post.media.length === 0) return;
    setModalState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % post.media.length
    }));
  };

  const prevSlide = () => {
    if (!post.media || post.media.length === 0) return;
    setModalState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + post.media.length) % post.media.length
    }));
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const sortedMedia = [...post.media].sort((a, b) => a.order - b.order);

    if (post.isSlideshow) {
      // Slideshow view - show first image with slideshow indicator
      return (
        <div className="mt-4">
          <div className="relative rounded-2xl overflow-hidden glass shadow-lg max-w-full">
            <div 
              className="relative cursor-pointer group" 
              onClick={() => openModal('slideshow', 0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal('slideshow', 0);
                }
              }}
            >
              {sortedMedia[0]?.mediaType === "video" ? (
                <video 
                  src={sortedMedia[0].mediaUrl} 
                  className="w-full h-64 object-contain bg-gray-900/20" 
                  preload="metadata"
                />
              ) : (
                <img 
                  src={sortedMedia[0]?.mediaUrl} 
                  alt="Main image" 
                  className="w-full h-64 object-contain bg-gray-900/20"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {sortedMedia.length} images
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-black/70 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Grid view - X.com style layout with responsive grid
      const getGridConfig = (count: number) => {
        // X.com style: Container scales to image, object-contain shows full image
        if (count === 1) return { 
          layout: "single", 
          containerClass: "rounded-2xl overflow-hidden max-h-80",
          itemClass: "w-full h-auto max-h-80 object-contain"
        };
        if (count === 2) return { 
          layout: "two", 
          containerClass: "grid grid-cols-2 gap-1 rounded-2xl overflow-hidden",
          itemClass: "w-full h-auto max-h-40 object-contain"
        };
        if (count === 3) return { 
          layout: "three", 
          containerClass: "grid grid-cols-2 gap-1 rounded-2xl overflow-hidden",
          itemClass: "w-full h-auto max-h-40 object-contain"
        };
        if (count === 4) return { 
          layout: "four", 
          containerClass: "grid grid-cols-2 gap-1 rounded-2xl overflow-hidden",
          itemClass: "w-full h-auto max-h-40 object-contain"
        };
        // For 5+ images, use a compact grid
        return { 
          layout: "many", 
          containerClass: "grid grid-cols-3 gap-1 rounded-2xl overflow-hidden",
          itemClass: "w-full h-auto max-h-24 object-contain"
        };
      };

      const config = getGridConfig(sortedMedia.length);

      return (
        <div className="mt-4">
          {config.layout === "four" ? (
            // Special 4-image layout: first image larger, others in 2x2 grid
            <div className={config.containerClass}>
              <div className="relative cursor-pointer group" onClick={() => openModal('grid', 0)}>
                  {sortedMedia[0].mediaType === "video" ? (
                    <video src={sortedMedia[0].mediaUrl} className={config.itemClass} />
                  ) : (
                    <img src={sortedMedia[0].mediaUrl} alt="Image 1" className={config.itemClass} />
                  )}
                  {sortedMedia[0].mediaType === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>
              {sortedMedia.slice(1, 4).map((media, index) => (
                <div key={media.id} className="relative cursor-pointer group" onClick={() => openModal('grid', index + 1)}>
                  {media.mediaType === "video" ? (
                    <video src={media.mediaUrl} className={config.itemClass} />
                  ) : (
                    <img src={media.mediaUrl} alt={`Image ${index + 2}`} className={config.itemClass} />
                  )}
                  {media.mediaType === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                </div>
              ))}
            </div>
          ) : (
            // Standard grid layout
            <div className={config.containerClass}>
              {sortedMedia.slice(0, 10).map((media, index) => { // Limit to 10 images

                return (
                  <div key={media.id} className="relative cursor-pointer group" onClick={() => openModal('grid', index)}>
                    {media.mediaType === "video" ? (
                      <video src={media.mediaUrl} className={config.itemClass} />
                    ) : (
                      <img src={media.mediaUrl} alt={`Image ${index + 1}`} className={config.itemClass} />
                    )}
                    {media.mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Show message if there are more than 10 images */}
          {post.media.length > 10 && (
            <div className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
              +{post.media.length - 10} more images
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <motion.div 
      className="glass rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      layout
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="h-12 w-12 flex-shrink-0">
          <ProfileTooltip user={post.user as any} currentUserId={session?.user?.id}>
            <button
              onClick={() => window.location.href = `/u/${post.user.username}`}
              className="relative group cursor-pointer flex-shrink-0 pointer-events-auto w-full h-full"
              onMouseEnter={(e) => {
                const trigger = (e.currentTarget as HTMLElement).closest('[data-profile-trigger]');
                if (trigger) trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
              }}
              onMouseLeave={(e) => {
                const trigger = (e.currentTarget as HTMLElement).closest('[data-profile-trigger]');
                if (trigger) trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
              }}
            >
              <img
                src={post.user.profile?.avatarUrl || "/default-avatar.png"}
                alt={post.user.name || post.user.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20 transition-opacity group-hover:opacity-80 pointer-events-none"
              />
              {/* Hover eyeball icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-black/50 rounded-full p-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </button>
          </ProfileTooltip>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <ProfileTooltip user={post.user as any} currentUserId={session?.user?.id}>
              <a 
                href={`/u/${post.user.username}`}
                className="font-semibold text-white hover:underline transition-colors duration-200 truncate cursor-pointer"
              >
                {post.user.name || post.user.username}
              </a>
            </ProfileTooltip>
            {post.user.profile.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-400 text-sm">
              @{post.user.username}
            </span>
            <span className="text-[var(--muted-foreground)] text-sm">•</span>
            <TimeAgo 
              date={post.createdAt} 
              className="text-[var(--muted-foreground)] text-sm"
            />
            {post.updatedAt > post.createdAt && (
              <span className="text-[var(--muted-foreground)] text-sm">• Edited</span>
            )}
            {post.isPinned && showPinnedTag && (
              <span className="text-[var(--muted-foreground)] text-sm">• Pinned</span>
            )}
          </div>
          
          {/* Profile Type Label */}
          <div className="mb-2">
            {(() => {
              const type = post.user.profile.profileType;
              const classes = (() => {
                switch (type) {
                  case "DEVELOPER":
                    return "border-blue-500/40 bg-blue-500/10 text-blue-400";
                  case "CLIENT":
                    return "border-green-500/40 bg-green-500/10 text-green-400";
                  case "STUDIO":
                    return "border-purple-500/40 bg-purple-500/10 text-purple-400";
                  case "INFLUENCER":
                    return "border-red-500/40 bg-red-500/10 text-red-400";
                  case "INVESTOR":
                    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
                  case "GUEST":
                    return "border-gray-500/40 bg-gray-500/10 text-gray-400";
                  default:
                    return "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]";
                }
              })();
              const label = getProfileTypeConfig(type).label;
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] tracking-wide ${classes}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" className="currentColor"><path d="M12 3l6 3v6c0 4-6 9-6 9s-6-5-6-9V6l6-3Z" fill="currentColor"/></svg>
                  {label}
                </span>
              );
            })()}
          </div>
          
          <div className="flex items-center space-x-2">
            {post.replyTo && (
              <span className="text-[var(--muted-foreground)] text-sm">
                • Replying to @{post.replyTo.user.username}
              </span>
            )}
          </div>
        </div>

        {/* Three dots menu */}
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg shadow-lg border border-white/20 z-50">
              <div className="py-1">
                {isOwnPost && (
                  <>
                    <button
                      onClick={handlePin}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>{post.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowActionsMenu(false);
                        // Handle edit
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <a
                      href={`/p/${post.id}/analytics`}
                      onClick={() => setShowActionsMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analytics</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowActionsMenu(false);
                        handleDelete();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowActionsMenu(false);
                    // Handle report
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <ContentRenderer 
          content={post.content}
          className="text-[var(--foreground)] whitespace-pre-wrap break-words"
          currentUserId={session?.user?.id}
        />
      </div>

      {/* Location */}
      {post.location && (
        <div className="mb-3 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>{post.location}</span>
        </div>
      )}

      {/* Embed Links */}
      {post.embedUrls && (
        <div className="mb-3 space-y-2">
          {(() => {
            const urls = Array.isArray(post.embedUrls) ? post.embedUrls : [post.embedUrls];
            return urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--accent)]">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[var(--accent)] hover:text-[var(--accent)]/80 underline text-sm break-all"
                >
                  {url}
                </a>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Poll */}
      {post.poll && (
        <div className={`${post.media && post.media.length > 0 ? 'mt-6' : 'mt-4'}`}>
          <PollDisplay
            poll={post.poll}
            onVote={handlePollVote}
            currentUserId={session?.user?.id}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between w-full max-w-md">
          {/* Reply - Only show if not on post page */}
          {!isOnPostPage && (
            <div 
              className="relative group/tooltip flex-1"
            >
              <button
                onClick={() => window.open(`/p/${post.id}`, '_blank')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full ${
                  (post.replies?.length || 0) > 0 ? 'text-blue-500' : ''
                }`}
              >
                <svg className={`w-4 h-4 transition-colors duration-200 ${
                  (post.replies?.length || 0) > 0 ? 'text-blue-500' : 'text-[var(--muted-foreground)] group-hover:text-blue-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className={`text-xs transition-colors duration-200 ${
                  (post.replies?.length || 0) > 0 ? 'text-blue-500' : 'text-[var(--muted-foreground)] group-hover:text-blue-500'
                }`}>
                  {post.replies?.length || 0}
                </span>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Reply
              </div>
            </div>
          )}

          {/* Repost */}
          <div 
            className="relative group/tooltip flex-1"
          >
            {/* Repost Explosion */}
            <AnimatePresence>
              {explosionAnimations.repost && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-green-500"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 70,
                        y: (Math.random() - 0.5) * 70,
                        scale: [0, 1.2, 0],
                        rotate: Math.random() * 360
                      }}
                      exit={{ 
                        opacity: 0,
                        scale: 0
                      }}
                      transition={{ 
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <button
              ref={repostButtonRef}
              onClick={handleRepost}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full ${
                isReposted ? 'text-green-500' : ''
              }`}
            >
              <svg className={`w-4 h-4 transition-colors duration-200 ${
                isReposted ? 'text-green-500' : 'text-[var(--muted-foreground)] group-hover:text-green-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className={`text-xs transition-colors duration-200 ${
                isReposted ? 'text-green-500' : 'text-[var(--muted-foreground)] group-hover:text-green-500'
              }`}>
                {post.reposts?.length || 0}
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {isReposted ? 'Remove Repost' : 'Repost'}
            </div>
          </div>

          {/* Like */}
          <div 
            className="relative group/tooltip flex-1"
          >
            {/* Like Explosion */}
            <AnimatePresence>
              {explosionAnimations.like && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-red-500"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 80,
                        y: (Math.random() - 0.5) * 80,
                        scale: [0, 1.2, 0],
                        rotate: Math.random() * 360
                      }}
                      exit={{ 
                        opacity: 0,
                        scale: 0
                      }}
                      transition={{ 
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <button
              ref={likeButtonRef}
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <svg className={`w-4 h-4 transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-[var(--muted-foreground)] group-hover:text-red-500'
              }`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-xs transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-[var(--muted-foreground)] group-hover:text-red-500'
              }`}>
                {post.likes?.length || 0}
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {isLiked ? 'Remove Like' : 'Like'}
            </div>
          </div>

          {/* Views */}
          <div 
            className="relative group/tooltip flex-1"
          >
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full"
            >
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)]">
                {post.views}
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Views
            </div>
          </div>

          {/* Share */}
          <div 
            className="relative group/tooltip flex-1"
          >
            <button
              onClick={() => {
                const postUrl = `${window.location.origin}/p/${post.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: `${post.user.name || post.user.username}'s post`,
                    text: post.content,
                    url: postUrl,
                  });
                } else {
                  navigator.clipboard.writeText(postUrl);
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full"
            >
              <svg className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)] group-hover:text-purple-500 transition-colors duration-200">
                Share
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Share
            </div>
          </div>

          {/* Save */}
          <div 
            className="relative group/tooltip flex-1"
          >
            {/* Save Explosion */}
            <AnimatePresence>
              {explosionAnimations.save && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-500"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 60,
                        scale: [0, 1.2, 0],
                        rotate: Math.random() * 360
                      }}
                      exit={{ 
                        opacity: 0,
                        scale: 0
                      }}
                      transition={{ 
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <button
              ref={saveButtonRef}
              onClick={handleSave}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group flex-1 justify-center w-full ${
                isSaved ? 'text-yellow-500' : ''
              }`}
            >
              <svg className={`w-4 h-4 transition-colors duration-200 ${
                isSaved ? 'text-yellow-500' : 'text-[var(--muted-foreground)] group-hover:text-yellow-500'
              }`} fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className={`text-xs transition-colors duration-200 ${
                isSaved ? 'text-yellow-500' : 'text-[var(--muted-foreground)] group-hover:text-yellow-500'
              }`}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {isSaved ? 'Remove from Saved' : 'Save Post'}
            </div>
          </div>
        </div>

        {/* Go to Post Button - Only show if not on post page */}
        {!isOnPostPage && (
          <div 
            className="relative group/tooltip"
          >
            <button
              onClick={() => window.open(`/p/${post.id}`, '_blank')}
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors duration-200 group"
            >
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)]">
                Go to Post
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Go to Post
            </div>
          </div>
        )}
      </div>


      {/* Portal-based Media Modal */}
      {modalState.isOpen && post.media && post.media.length > 0 && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center"
          onClick={closeModal}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black/80 rounded-full p-3 border border-white/40 hover:border-white/60 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              {post.media[modalState.currentIndex]?.mediaType === "video" ? (
                <video
                  src={post.media[modalState.currentIndex].mediaUrl}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <img
                  src={post.media[modalState.currentIndex]?.mediaUrl}
                  alt={`Media ${modalState.currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading="eager"
                />
              )}
            </div>
            
            {/* Navigation controls for slideshow */}
            {modalState.type === 'slideshow' && post.media.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/80 rounded-full p-3 border border-white/40 hover:border-white/60 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/80 rounded-full p-3 border border-white/40 hover:border-white/60 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/80 rounded-full px-4 py-2 border border-white/40">
                  {modalState.currentIndex + 1} / {post.media.length}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" 
            onClick={cancelDelete}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="relative glass glow rounded-[var(--radius)] p-6 w-[min(92vw,480px)] mx-4" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Post</h3>
            </div>
            
            <p className="text-[var(--muted-foreground)] mb-6 leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone and will also delete all replies to this post.
            </p>
            
            <motion.div 
              className="flex gap-3 justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
              >
                Delete Post
              </button>
            </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default PostDetail;
