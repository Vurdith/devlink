"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { Button } from "@/components/ui/Button";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import { cn } from "@/lib/cn";
// Lazy load heavy components - only loaded when needed
const MediaViewer = lazy(() => import("@/components/ui/MediaViewer").then(m => ({ default: m.MediaViewer })));
const PollDisplay = lazy(() => import("@/components/ui/PollDisplay").then(m => ({ default: m.PollDisplay })));
const ReplyModal = lazy(() => import("./ReplyModal").then(m => ({ default: m.ReplyModal })));

// Pre-computed profile type styles for better performance
const PROFILE_TYPE_CLASSES: Record<string, string> = {
  DEVELOPER: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  CLIENT: "border-green-500/40 bg-green-500/10 text-green-400",
  STUDIO: "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  INFLUENCER: "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  INVESTOR: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  DEFAULT: "border-gray-500/40 bg-gray-500/10 text-gray-400",
};

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
  expiresAt: Date | null;
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
  // Pre-computed engagement flags from server
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  _count?: {
    likes: number;
    reposts: number;
    replies?: number;
  };
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
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);
  // Track updated avatar for current user's posts (instant update when they change avatar)
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
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
  const [showReplyModal, setShowReplyModal] = useState(false);
  
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Compute engagement state from post data
  const engagementState = useMemo(() => {
    if (!session?.user?.id) {
      return { isLiked: false, isReposted: false, isSaved: false, likeCount: 0, repostCount: 0 };
    }
    const userId = session.user.id;
    return {
      isLiked: post.isLiked ?? post.likes?.some(like => like.userId === userId) ?? false,
      isReposted: post.isReposted ?? post.reposts?.some(repost => repost.userId === userId) ?? false,
      isSaved: post.isSaved ?? post.savedBy?.some(saved => saved.userId === userId) ?? false,
      likeCount: post._count?.likes ?? post.likes?.length ?? 0,
      repostCount: post._count?.reposts ?? post.reposts?.length ?? 0,
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

  // Listen for profile updates to update avatar instantly for current user's posts
  useEffect(() => {
    if (!isOwnPost) return;
    
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl } = event.detail || {};
      if (avatarUrl !== undefined) {
        setCurrentUserAvatar(avatarUrl);
        setAvatarError(false); // Reset error state when avatar updates
      }
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, [isOwnPost]);

  // Determine which avatar URL to use - prioritize live updates for own posts
  const displayAvatarUrl = isOwnPost && currentUserAvatar !== null 
    ? currentUserAvatar 
    : post.user.profile?.avatarUrl;

  const handleLike = useCallback(async () => {
    if (!session?.user?.id || isUpdating) return;
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
        // Use the authoritative count from the server
        if (data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
        } else if (data.liked !== newLikedState) {
          // Fallback if server doesn't return count
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
  }, [session?.user?.id, isLiked, isUpdating, post, onUpdate]);

  const handleRepost = useCallback(async () => {
    if (!session?.user?.id || isUpdating) return;
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
        // Use the authoritative count from the server
        if (data.repostCount !== undefined) {
          setRepostCount(data.repostCount);
        } else if (data.reposted !== newRepostedState) {
          // Fallback if server doesn't return count
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
        
        // Dispatch event to notify other components (like ProfileTabs)
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'repost', reposted: data.reposted }
        }));
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
  }, [session?.user?.id, isReposted, isUpdating, post, onUpdate]);

  const handleSave = useCallback(async () => {
    if (!session?.user?.id || isUpdating) return;
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
        
        // Dispatch event to notify other components (like ProfileTabs)
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'save', saved: data.saved }
        }));
      } else {
        setIsSaved(!newSavedState);
      }
    } catch (error) {
      setIsSaved(!newSavedState);
      console.error('Error saving post:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isSaved, isUpdating, post, onUpdate]);

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

  const handlePollVote = useCallback(async (optionIds: string[]) => {
    if (!session?.user?.id || !post.poll?.id) return;
    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: post.poll.id, optionIds, userId: session.user.id }),
      });
      if (response.ok) {
        // Use client-side refresh instead of full page reload
        router.refresh();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  }, [session?.user?.id, post.poll?.id, router]);

  const confirmDelete = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, { method: 'DELETE' });
      if (response.ok) {
        setShowDeleteConfirm(false);
        // Use client-side navigation
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/p/')) {
          router.push('/home');
        } else {
          router.refresh();
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }, [post.id, router]);

  // Convert post media to MediaViewer format
  const mediaItems = useMemo(() => {
    if (!post.media || post.media.length === 0) return [];
    return [...post.media]
      .sort((a, b) => a.order - b.order)
      .map(m => ({
        id: m.id,
        url: m.mediaUrl,
        type: m.mediaType === "video" ? "video" as const : "image" as const,
      }));
  }, [post.media]);

  const renderMedia = () => {
    if (mediaItems.length === 0) return null;
    return (
      <div className="mt-4">
        <Suspense fallback={<div className="h-48 bg-white/5 rounded-xl animate-pulse" />}>
          <MediaViewer
            media={mediaItems}
            isSlideshow={post.isSlideshow}
            alt={`${post.user.name || post.user.username}'s post`}
            className="border border-white/10"
          />
        </Suspense>
      </div>
    );
  };

  // Use pre-computed lookup instead of recalculating on every render
  const profileTypeClasses = PROFILE_TYPE_CLASSES[post.user.profile?.profileType || "DEFAULT"] || PROFILE_TYPE_CLASSES.DEFAULT;
  
  // Memoized navigation handlers to prevent unnecessary re-renders
  const navigateToProfile = useCallback(() => {
    router.push(`/u/${post.user.username}`);
  }, [router, post.user.username]);
  
  const navigateToPost = useCallback(() => {
    router.push(`/p/${post.id}`);
  }, [router, post.id]);
  
  // Open reply modal (like X.com)
  const openReplyModal = useCallback(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setShowReplyModal(true);
  }, [session?.user, router]);
  
  const closeReplyModal = useCallback(() => {
    setShowReplyModal(false);
  }, []);
  
  const handleReplyPosted = useCallback(() => {
    // Refresh to show the new reply
    router.refresh();
  }, [router]);
  
  // Memoized share handler
  const handleShare = useCallback(() => {
    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${post.id}` : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ 
        title: `${post.user.name || post.user.username}'s post`, 
        text: post.content, 
        url: postUrl 
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(postUrl);
    }
  }, [post.id, post.user.name, post.user.username, post.content]);

  return (
    <div className="relative overflow-hidden glass-soft border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6 hover:border-white/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <ProfileTooltip user={post.user} currentUserId={session?.user?.id}>
          <button
            onClick={navigateToProfile}
            className="relative cursor-pointer flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12"
          >
            {!avatarError && displayAvatarUrl ? (
              // Use regular img for blob URLs (instant local preview), next/image for remote URLs
              displayAvatarUrl.startsWith('blob:') ? (
                <img
                  src={displayAvatarUrl}
                  alt={post.user.name || post.user.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white/10 hover:border-white/30 transition-all duration-300"
                />
              ) : (
                <Image
                  src={displayAvatarUrl}
                  alt={post.user.name || post.user.username}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white/10 hover:border-white/30 transition-all duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              )
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-gradient-to-br from-[var(--color-accent)] to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {getInitials(post.user.name, post.user.username)}
                </span>
              </div>
            )}
          </button>
        </ProfileTooltip>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
            <ProfileTooltip user={post.user} currentUserId={session?.user?.id}>
              <a href={`/u/${post.user.username}`} className="font-bold text-sm sm:text-base text-white hover:underline truncate tracking-tight">
                {post.user.name || post.user.username}
              </a>
            </ProfileTooltip>
            {post.user.profile?.verified && (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-[var(--muted-foreground)] text-xs sm:text-sm">@{post.user.username}</span>
            <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline opacity-50">•</span>
            <TimeAgo date={post.createdAt} className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline" />
            {post.updatedAt > post.createdAt && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline opacity-50">• Edited</span>}
            {post.isPinned && showPinnedTag && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline opacity-50">• Pinned</span>}
          </div>
          {/* Content directly under username */}
          <div className="mt-1">
            <ContentRenderer content={post.content} className="text-sm sm:text-base text-[var(--foreground)] whitespace-pre-wrap break-words leading-relaxed" currentUserId={session?.user?.id} />
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative" ref={actionsMenuRef}>
          <button onClick={() => setShowActionsMenu(!showActionsMenu)} className="p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
            <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden glass-soft rounded-xl shadow-2xl border border-white/10 z-50 animate-pop-in">
              <div className="py-1">
                {isOwnPost && (
                  <>
                    <button onClick={handlePin} className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>{post.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <a href={`/p/${post.id}/analytics`} className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analytics</span>
                    </a>
                    <button onClick={() => { setShowActionsMenu(false); setShowDeleteConfirm(true); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button className="w-full text-left px-4 py-2.5 text-sm text-amber-400/80 hover:bg-amber-500/10 transition-colors flex items-center space-x-3">
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

      {/* Poll - Lazy loaded */}
      {post.poll && (
        <div className={`${post.media && post.media.length > 0 ? 'mt-6' : 'mt-4'}`}>
          <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse" />}>
            <PollDisplay poll={post.poll} onVote={handlePollVote} currentUserId={session?.user?.id} />
          </Suspense>
        </div>
      )}

      {/* Action Buttons - Single row with equal spacing */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5">
        {/* Reply - Opens modal like X.com */}
        {!isOnPostPage ? (
          <EngagementButton
            onClick={openReplyModal}
            isActive={(post.replies?.length || 0) > 0}
            activeColor="blue"
            count={post.replies?.length || 0}
            ariaLabel="Reply to this post"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </EngagementButton>
        ) : <div className="w-10" />}

        {/* Repost */}
        <EngagementButton
          onClick={handleRepost}
          isActive={isReposted}
          activeColor="green"
          count={repostCount}
          showExplosion
          disabled={isUpdating}
          ariaLabel={isReposted ? "Undo repost" : "Repost"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("transition-transform duration-500", isReposted && "rotate-180")}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
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
          ariaLabel={isLiked ? "Unlike" : "Like"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={cn(isLiked && "animate-like")}>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </EngagementButton>

        {/* Views */}
        <EngagementButton isActive={false} activeColor="gray" count={post.views} ariaLabel="View count">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </EngagementButton>

        {/* Share */}
        <EngagementButton
          onClick={handleShare}
          isActive={false}
          activeColor="gray"
          label="Share"
          ariaLabel="Share post"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </EngagementButton>

        {/* Save */}
        <EngagementButton
          onClick={handleSave}
          isActive={isSaved}
          activeColor="yellow"
          label="Save"
          disabled={isUpdating}
          ariaLabel={isSaved ? "Unsave" : "Save"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </EngagementButton>

        {/* Go to Post */}
        {!isOnPostPage && (
          <EngagementButton
            onClick={navigateToPost}
            isActive={false}
            activeColor="gray"
            label="Open"
            ariaLabel="Open post"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </EngagementButton>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div className="relative overflow-hidden glass noise-overlay border border-white/10 rounded-xl p-6 w-[min(92vw,480px)] mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--color-accent)]/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Post</h3>
            </div>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} size="sm">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} size="sm">
                Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reply Modal - Lazy loaded */}
      {showReplyModal && (
        <Suspense fallback={null}>
          <ReplyModal
            isOpen={showReplyModal}
            onClose={closeReplyModal}
            post={post}
            currentUserProfile={session?.user ? {
              avatarUrl: session.user.image || null,
              name: session.user.name || null,
              username: session.user.username || session.user.email?.split('@')[0] || 'user'
            } : null}
            onReplyPosted={handleReplyPosted}
          />
        </Suspense>
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
  ariaLabel,
  children,
  showExplosion,
  disabled,
}: { 
  onClick?: () => void; 
  isActive: boolean; 
  activeColor: 'red' | 'green' | 'blue' | 'yellow' | 'gray';
  count?: number;
  label?: string;
  ariaLabel?: string;
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
    gray: { active: 'text-[var(--muted-foreground)]', hover: 'hover:text-white hover:bg-white/5', particle: 'bg-gray-400' },
  };
  
  const colors = colorClasses[activeColor];
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      aria-label={ariaLabel || label}
      aria-pressed={isActive}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-xl transition-all duration-200 active:scale-90",
        isActive ? colors.active : "text-[var(--muted-foreground)]",
        colors.hover,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex items-center justify-center">
        {children}
        
        {/* Particle explosion */}
        {particles.map((p, i) => (
          <div
            key={p}
            className={cn(
              "absolute w-1 h-1 rounded-full pointer-events-none",
              colors.particle
            )}
            style={{
              animation: `particle-${i % 6} 0.5s ease-out forwards`,
            }}
          />
        ))}
      </div>
      
      {(count !== undefined || label) && (
        <span className="text-xs font-bold tabular-nums tracking-tight">
          {label || (count! > 0 ? count : "")}
        </span>
      )}
    </button>
  );
}

export default PostDetail;
