"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { createPortal } from "react-dom";
import { PollDisplay } from "@/components/ui/PollDisplay";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import { cn } from "@/lib/cn";

interface PollOption {
  id: string;
  text: string;
  votes: number;
  isSelected?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isMultiple: boolean;
  expiresAt: Date;
  totalVotes: number;
}

interface Engagement {
  id: string;
  userId: string;
}

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
      bannerUrl: string | null;
      profileType: string;
      verified: boolean;
      bio: string | null;
      website: string | null;
      location: string | null;
    } | null;
    _count?: {
      followers: number;
      following: number;
    };
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    order: number;
  }>;
  isSlideshow: boolean;
  poll?: Poll;
  likes?: Engagement[];
  reposts?: Engagement[];
  replies?: Engagement[];
  views: number;
  isPinned: boolean;
  savedBy?: Engagement[];
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

// Generate initials from name or username
function getInitials(name: string | null, username: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
}

const PostDetail = memo(function PostDetail({ post, onUpdate, isOnPostPage = false, showPinnedTag = false }: PostDetailProps) {
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState(false);
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
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [pendingState, setPendingState] = useState<{
    isLiked?: boolean;
    isReposted?: boolean;
    isSaved?: boolean;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Compute engagement state from post data
  const engagementState = useMemo(() => {
    if (!session?.user?.id) {
      return { isLiked: false, isReposted: false, isSaved: false, likeCount: 0, repostCount: 0 };
    }
    const userId = session.user.id;
    const postAny = post as any;
    return {
      isLiked: postAny.isLiked ?? post.likes?.some(like => like.userId === userId) ?? false,
      isReposted: postAny.isReposted ?? post.reposts?.some(repost => repost.userId === userId) ?? false,
      isSaved: postAny.isSaved ?? post.savedBy?.some(saved => saved.userId === userId) ?? false,
      likeCount: postAny._count?.likes ?? post.likes?.length ?? 0,
      repostCount: postAny._count?.reposts ?? post.reposts?.length ?? 0,
    };
  }, [session?.user?.id, post]);

  useEffect(() => {
    if (isUpdating || Date.now() - lastUpdateTime < 2000) return;
    if (pendingState) {
      const matchesPending = 
        (pendingState.isLiked === undefined || engagementState.isLiked === pendingState.isLiked) &&
        (pendingState.isReposted === undefined || engagementState.isReposted === pendingState.isReposted) &&
        (pendingState.isSaved === undefined || engagementState.isSaved === pendingState.isSaved);
      if (matchesPending) {
        setPendingState(null);
      } else {
        return;
      }
    }
    setIsLiked(engagementState.isLiked);
    setIsReposted(engagementState.isReposted);
    setIsSaved(engagementState.isSaved);
    setLikeCount(engagementState.likeCount);
    setRepostCount(engagementState.repostCount);
  }, [engagementState, isUpdating, lastUpdateTime, pendingState]);

  // Keyboard navigation for modals
  useEffect(() => {
    if (!modalState.isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
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

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalState.isOpen, modalState.type, post.media?.length]);

  // Track view - debounced, unique per user
  useEffect(() => {
    // Include user ID in key so switching accounts still tracks views
    const userId = session?.user?.id || 'anon';
    const viewKey = `viewed_${post.id}_${userId}`;
    if (sessionStorage.getItem(viewKey)) return;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          sessionStorage.setItem(viewKey, 'true');
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [post.id, session?.user?.id]);

  // Close actions menu on outside click
  useEffect(() => {
    if (!showActionsMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowActionsMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showActionsMenu]);

  const isOwnPost = session?.user?.id === post.userId;

  const handleLike = useCallback(async () => {
    if (!session?.user?.id) return;
    const newLikedState = !isLiked;
    setIsUpdating(true);
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) throw new Error('Failed to like post');
      const data = await response.json();

      if (data.liked !== undefined) {
        setIsLiked(data.liked);
        if (data.liked !== newLikedState) {
          setLikeCount(prev => data.liked ? prev + 1 : Math.max(0, prev - 1));
        }
        setLastUpdateTime(Date.now());
        setPendingState(prev => ({ ...prev, isLiked: data.liked }));
        
        if (onUpdate) {
          const updatedPost = { ...post };
          if (data.liked) {
            if (!updatedPost.likes?.some(like => like.userId === session.user!.id)) {
              updatedPost.likes = [...(updatedPost.likes || []), { id: Date.now().toString(), userId: session.user!.id }];
            }
          } else {
            updatedPost.likes = (updatedPost.likes || []).filter(like => like.userId !== session.user!.id);
          }
          onUpdate(updatedPost);
        }
        
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'like', liked: data.liked }
        }));
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
      console.error('Error liking post:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isLiked, post, onUpdate]);

  const handleRepost = useCallback(async () => {
    if (!session?.user?.id) return;
    const newRepostedState = !isReposted;
    setIsUpdating(true);
    setIsReposted(newRepostedState);
    setRepostCount(prev => newRepostedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/posts/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();
      if (response.ok && data.reposted !== undefined) {
        setIsReposted(data.reposted);
        if (data.reposted !== newRepostedState) {
          setRepostCount(prev => data.reposted ? prev + 1 : Math.max(0, prev - 1));
        }
        setLastUpdateTime(Date.now());
        setPendingState(prev => ({ ...prev, isReposted: data.reposted }));
        
        if (onUpdate) {
          const updatedPost = { ...post };
          if (data.reposted) {
            updatedPost.reposts = [...(post.reposts || []), { id: Date.now().toString(), userId: session.user!.id }];
          } else {
            updatedPost.reposts = (post.reposts || []).filter(repost => repost.userId !== session.user!.id);
          }
          onUpdate(updatedPost);
        }
      } else {
        setIsReposted(!newRepostedState);
        setRepostCount(prev => newRepostedState ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      setIsReposted(!newRepostedState);
      setRepostCount(prev => newRepostedState ? Math.max(0, prev - 1) : prev + 1);
      console.error('Error reposting:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isReposted, post, onUpdate]);

  const handleSave = useCallback(async () => {
    if (!session?.user?.id) return;
    const newSavedState = !isSaved;
    setIsUpdating(true);
    setIsSaved(newSavedState);

    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok && data.saved !== undefined) {
        setIsSaved(data.saved);
        setLastUpdateTime(Date.now());
        setPendingState(prev => ({ ...prev, isSaved: data.saved }));
        
        if (onUpdate) {
          const updatedPost = { ...post };
          if (data.saved) {
            updatedPost.savedBy = [...(post.savedBy || []), { id: Date.now().toString(), userId: session.user!.id }];
          } else {
            updatedPost.savedBy = (post.savedBy || []).filter(saved => saved.userId !== session.user!.id);
          }
          onUpdate(updatedPost);
        }
      } else {
        setIsSaved(!newSavedState);
      }
    } catch (error) {
      setIsSaved(!newSavedState);
      console.error('Error saving post:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isSaved, post, onUpdate]);

  const handlePin = async () => {
    if (!session?.user?.id || !isOwnPost) return;
    try {
      const response = await fetch(`/api/posts/${post.id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: !post.isPinned }),
      });
      if (response.ok && onUpdate) {
        const data = await response.json();
        onUpdate({ ...post, isPinned: data.isPinned });
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
        body: JSON.stringify({ pollId: post.poll?.id, optionIds, userId: session.user.id }),
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, { method: 'DELETE' });
      if (response.ok) {
        setShowDeleteConfirm(false);
        if (window.location.pathname.startsWith('/p/')) {
          window.location.href = '/home';
        } else {
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

  const openModal = (type: 'slideshow' | 'grid', index: number = 0) => {
    if (!post.media || post.media.length === 0 || index < 0 || index >= post.media.length) return;
    setModalState({ isOpen: true, type, currentIndex: index });
  };

  const closeModal = () => setModalState({ isOpen: false, type: null, currentIndex: 0 });
  const nextSlide = () => {
    if (!post.media?.length) return;
    setModalState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % post.media.length }));
  };
  const prevSlide = () => {
    if (!post.media?.length) return;
    setModalState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + post.media.length) % post.media.length }));
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;
    const sortedMedia = [...post.media].sort((a, b) => a.order - b.order);

    if (post.isSlideshow) {
      return (
        <div className="mt-4">
          <div className="relative rounded-2xl overflow-hidden glass shadow-lg max-w-full">
            <div className="relative cursor-pointer group" onClick={() => openModal('slideshow', 0)}>
              {sortedMedia[0]?.mediaType === "video" ? (
                <video src={sortedMedia[0].mediaUrl} className="w-full h-64 object-contain bg-gray-900/20" preload="metadata" />
              ) : (
                <img src={sortedMedia[0]?.mediaUrl} alt="Main image" className="w-full h-64 object-contain bg-gray-900/20" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150" />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {sortedMedia.length} images
              </div>
            </div>
          </div>
        </div>
      );
    }

    const getGridConfig = (count: number) => {
      if (count === 1) return { containerClass: "rounded-2xl overflow-hidden max-h-80", itemClass: "w-full h-auto max-h-80 object-contain" };
      if (count === 2) return { containerClass: "grid grid-cols-2 gap-1 rounded-2xl overflow-hidden", itemClass: "w-full h-auto max-h-40 object-contain" };
      if (count <= 4) return { containerClass: "grid grid-cols-2 gap-1 rounded-2xl overflow-hidden", itemClass: "w-full h-auto max-h-40 object-contain" };
      return { containerClass: "grid grid-cols-3 gap-1 rounded-2xl overflow-hidden", itemClass: "w-full h-auto max-h-24 object-contain" };
    };

    const config = getGridConfig(sortedMedia.length);

    return (
      <div className="mt-4">
        <div className={config.containerClass}>
          {sortedMedia.slice(0, 10).map((media, index) => (
            <div key={media.id} className="relative cursor-pointer group" onClick={() => openModal('grid', index)}>
              {media.mediaType === "video" ? (
                <video src={media.mediaUrl} className={config.itemClass} preload="metadata" />
              ) : (
                <img src={media.mediaUrl} alt={`Image ${index + 1}`} className={config.itemClass} loading="lazy" />
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150" />
            </div>
          ))}
        </div>
        {post.media.length > 10 && (
          <div className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
            +{post.media.length - 10} more images
          </div>
        )}
      </div>
    );
  };

  const profileTypeClasses = (() => {
    const type = post.user.profile?.profileType;
    switch (type) {
      case "DEVELOPER": return "border-blue-500/40 bg-blue-500/10 text-blue-400";
      case "CLIENT": return "border-green-500/40 bg-green-500/10 text-green-400";
      case "STUDIO": return "border-purple-500/40 bg-purple-500/10 text-purple-400";
      case "INFLUENCER": return "border-red-500/40 bg-red-500/10 text-red-400";
      case "INVESTOR": return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
      default: return "border-gray-500/40 bg-gray-500/10 text-gray-400";
    }
  })();

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <ProfileTooltip user={post.user as any} currentUserId={session?.user?.id}>
          <button
            onClick={() => window.location.href = `/u/${post.user.username}`}
            className="relative group cursor-pointer flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12"
          >
            {!avatarError && post.user.profile?.avatarUrl ? (
              <img
                src={post.user.profile.avatarUrl}
                alt={post.user.name || post.user.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/20 group-hover:opacity-80 transition-opacity"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {getInitials(post.user.name, post.user.username)}
                </span>
              </div>
            )}
          </button>
        </ProfileTooltip>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5 sm:mb-1 flex-wrap">
            <ProfileTooltip user={post.user as any} currentUserId={session?.user?.id}>
              <a href={`/u/${post.user.username}`} className="font-semibold text-sm sm:text-base text-white hover:underline truncate">
                {post.user.name || post.user.username}
              </a>
            </ProfileTooltip>
            {post.user.profile?.verified && (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-400 text-xs sm:text-sm">@{post.user.username}</span>
            <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline">•</span>
            <TimeAgo date={post.createdAt} className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline" />
            {post.updatedAt > post.createdAt && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline">• Edited</span>}
            {post.isPinned && showPinnedTag && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline">• Pinned</span>}
          </div>
          
          {post.user.profile && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] tracking-wide ${profileTypeClasses}`}>
              <ProfileTypeIcon profileType={post.user.profile.profileType} size={12} />
              {getProfileTypeConfig(post.user.profile.profileType).label}
            </span>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative" ref={actionsMenuRef}>
          <button onClick={() => setShowActionsMenu(!showActionsMenu)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg shadow-lg border border-white/20 z-50">
              <div className="py-1">
                {isOwnPost && (
                  <>
                    <button onClick={handlePin} className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>{post.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <a href={`/p/${post.id}/analytics`} className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analytics</span>
                    </a>
                    <button onClick={() => { setShowActionsMenu(false); setShowDeleteConfirm(true); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-3">
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
      <div className="mb-3 sm:mb-4">
        <ContentRenderer content={post.content} className="text-sm sm:text-base text-[var(--foreground)] whitespace-pre-wrap break-words" currentUserId={session?.user?.id} />
      </div>

      {/* Location */}
      {post.location && (
        <div className="mb-3 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>{post.location}</span>
        </div>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Poll */}
      {post.poll && (
        <div className={`${post.media && post.media.length > 0 ? 'mt-6' : 'mt-4'}`}>
          <PollDisplay poll={post.poll} onVote={handlePollVote} currentUserId={session?.user?.id} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
        <div className="flex items-center justify-between w-full max-w-md gap-1 sm:gap-2">
          {/* Reply */}
          {!isOnPostPage && (
            <EngagementButton
              onClick={() => window.open(`/p/${post.id}`, '_blank')}
              isActive={(post.replies?.length || 0) > 0}
              activeColor="blue"
              count={post.replies?.length || 0}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </EngagementButton>
          )}

          {/* Repost */}
          <EngagementButton
            onClick={handleRepost}
            isActive={isReposted}
            activeColor="green"
            count={repostCount}
            showExplosion
            disabled={isUpdating}
          >
            <svg className={cn("w-[18px] h-[18px] transition-transform", isReposted && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </EngagementButton>

          {/* Like */}
          <EngagementButton
            onClick={handleLike}
            isActive={isLiked}
            activeColor="red"
            count={likeCount}
            showExplosion
            disabled={isUpdating}
          >
            <svg className="w-[18px] h-[18px]" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </EngagementButton>

          {/* Views */}
          <EngagementButton isActive={false} activeColor="gray" count={post.views}>
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </EngagementButton>

          {/* Share */}
          <EngagementButton
            onClick={() => {
              const postUrl = `${window.location.origin}/p/${post.id}`;
              if (navigator.share) {
                navigator.share({ title: `${post.user.name || post.user.username}'s post`, text: post.content, url: postUrl });
              } else {
                navigator.clipboard.writeText(postUrl);
              }
            }}
            isActive={false}
            activeColor="purple"
            label="Share"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </EngagementButton>

          {/* Save */}
          <EngagementButton
            onClick={handleSave}
            isActive={isSaved}
            activeColor="yellow"
            label={isSaved ? "Saved" : "Save"}
            showExplosion
            disabled={isUpdating}
          >
            <svg className="w-[18px] h-[18px]" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </EngagementButton>
        </div>

        {/* Go to Post */}
        {!isOnPostPage && (
          <button 
            onClick={() => window.open(`/p/${post.id}`, '_blank')} 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-xs hidden sm:inline">Open</span>
          </button>
        )}
      </div>

      {/* Media Modal */}
      {modalState.isOpen && post.media && post.media.length > 0 && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999]"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black/80 rounded-full p-3 border border-white/40">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              {post.media[modalState.currentIndex]?.mediaType === "video" ? (
                <video src={post.media[modalState.currentIndex].mediaUrl} className="max-w-full max-h-full object-contain" controls autoPlay />
              ) : (
                <img src={post.media[modalState.currentIndex]?.mediaUrl} alt={`Media ${modalState.currentIndex + 1}`} className="max-w-full max-h-full object-contain" />
              )}
            </div>
            
            {modalState.type === 'slideshow' && post.media.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/80 rounded-full p-3 border border-white/40">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/80 rounded-full p-3 border border-white/40">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/80 rounded-full px-4 py-2 border border-white/40">
                  {modalState.currentIndex + 1} / {post.media.length}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div className="relative glass glow rounded-xl p-6 w-[min(92vw,480px)] mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Post</h3>
            </div>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Simple engagement button with explosion effect
function EngagementButton({ 
  onClick, 
  isActive, 
  activeColor, 
  count, 
  label,
  children,
  showExplosion,
  disabled,
}: { 
  onClick?: () => void; 
  isActive: boolean; 
  activeColor: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'gray';
  count?: number;
  label?: string;
  children: React.ReactNode;
  showExplosion?: boolean;
  disabled?: boolean;
}) {
  const [particles, setParticles] = useState<number[]>([]);
  
  const colorClasses = {
    red: { active: 'text-red-500', hover: 'hover:text-red-500 hover:bg-red-500/10', particle: 'bg-red-500' },
    green: { active: 'text-green-500', hover: 'hover:text-green-500 hover:bg-green-500/10', particle: 'bg-green-500' },
    blue: { active: 'text-blue-500', hover: 'hover:text-blue-500 hover:bg-blue-500/10', particle: 'bg-blue-500' },
    yellow: { active: 'text-yellow-500', hover: 'hover:text-yellow-500 hover:bg-yellow-500/10', particle: 'bg-yellow-500' },
    purple: { active: 'text-purple-500', hover: 'hover:text-purple-500 hover:bg-purple-500/10', particle: 'bg-purple-500' },
    gray: { active: 'text-gray-400', hover: 'hover:text-gray-300 hover:bg-white/5', particle: 'bg-gray-400' },
  };
  
  const colors = colorClasses[activeColor];
  
  const handleClick = () => {
    if (disabled) return;
    
    // Trigger explosion
    if (showExplosion) {
      const now = Date.now();
      setParticles(Array.from({ length: 6 }, (_, i) => now + i));
      setTimeout(() => setParticles([]), 500);
    }
    
    onClick?.();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-colors flex-1 justify-center min-w-0",
        disabled ? "opacity-60 cursor-not-allowed" : cn(colors.hover, "active:scale-95"),
        isActive ? colors.active : "text-[var(--muted-foreground)]"
      )}
    >
      {/* Explosion particles */}
      {particles.map((id, i) => (
        <span
          key={id}
          className={cn("absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full pointer-events-none", colors.particle)}
          style={{ animation: `particle-${i % 6} 0.5s ease-out forwards` }}
        />
      ))}
      
      <span className={cn("relative transition-transform [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5", !disabled && "active:scale-125")}>
        {children}
      </span>
      {count !== undefined && (
        <span className={cn("text-[10px] sm:text-xs font-medium tabular-nums", isActive && colors.active)}>
          {count}
        </span>
      )}
      {label && (
        <span className="text-[10px] sm:text-xs hidden sm:inline">{label}</span>
      )}
    </button>
  );
}

export default PostDetail;
