"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { surface } from "@/components/ui/design-system";
import type { FeedPost } from "@/types/post";
import { getPostMediaItems, PostBodyAttachments } from "./PostBodyAttachments";
import { PostEngagementBar } from "./PostEngagementBar";
import { PostDetailHeader } from "./PostDetailHeader";
import { getPostCount, getReplyCount, withPostCount } from "./post-engagement-utils";
// Lazy load heavy components - only loaded when needed
const ReplyModal = lazy(() => import("./ReplyModal").then(m => ({ default: m.ReplyModal })));
const DeletePostDialog = lazy(() => import("./DeletePostDialog").then(m => ({ default: m.DeletePostDialog })));

interface PostDetailProps {
  post: FeedPost;
  onUpdate?: (updatedPost: FeedPost) => void;
  isOnPostPage?: boolean;
  showPinnedTag?: boolean;
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  } | null;
}

export const PostDetail = memo(function PostDetail({ post, onUpdate, isOnPostPage = false, showPinnedTag = false, session }: PostDetailProps) {
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
  // Counts are always visible, but user-specific states require authentication
  const engagementState = useMemo(() => {
    const likeCount = getPostCount(post, "likes");
    const repostCount = getPostCount(post, "reposts");
    
    if (!session?.user?.id) {
      return { isLiked: false, isReposted: false, isSaved: false, likeCount, repostCount };
    }
    const userId = session.user.id;
    return {
      isLiked: post.isLiked ?? post.likes?.some(like => like.userId === userId) ?? false,
      isReposted: post.isReposted ?? post.reposts?.some(repost => repost.userId === userId) ?? false,
      isSaved: post.isSaved ?? post.savedBy?.some(saved => saved.userId === userId) ?? false,
      likeCount,
      repostCount,
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
    try {
      if (sessionStorage.getItem(viewKey)) return;
    } catch {}

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          try {
            sessionStorage.setItem(viewKey, 'true');
          } catch {}
        }
      } catch {}
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
    const userId = session?.user?.id;
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isUpdating) return;
    const newLikedState = !isLiked;
    const optimisticLikeCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
    setIsUpdating(true);
    setIsLiked(newLikedState);
    setLikeCount(optimisticLikeCount);

    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();
      if (response.ok && data.liked !== undefined) {
        const confirmedLikeCount =
          typeof data.likeCount === "number"
            ? data.likeCount
            : data.liked === newLikedState
              ? optimisticLikeCount
              : likeCount;

        setIsLiked(data.liked);
        setLikeCount(confirmedLikeCount);
        setLastUpdateTime(Date.now());
        setPendingState(prev => ({ ...prev, isLiked: data.liked }));
        
        if (onUpdate) {
          const updatedPost = withPostCount(post, "likes", confirmedLikeCount);
          if (data.liked) {
            if (!updatedPost.likes?.some(like => like.userId === userId)) {
              updatedPost.likes = [...(updatedPost.likes || []), { id: Date.now().toString(), userId }];
            }
          } else {
            updatedPost.likes = (updatedPost.likes || []).filter(like => like.userId !== userId);
          }
          onUpdate(updatedPost);
        }
        
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'like', liked: data.liked, likeCount: confirmedLikeCount }
        }));
      }
    } catch {
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isLiked, isUpdating, likeCount, post, onUpdate, router]);

  const handleRepost = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isUpdating) return;
    const newRepostedState = !isReposted;
    const optimisticRepostCount = newRepostedState ? repostCount + 1 : Math.max(0, repostCount - 1);
    setIsUpdating(true);
    setIsReposted(newRepostedState);
    setRepostCount(optimisticRepostCount);

    try {
      const response = await fetch('/api/posts/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();
      if (response.ok && data.reposted !== undefined) {
        const confirmedRepostCount =
          typeof data.repostCount === "number"
            ? data.repostCount
            : data.reposted === newRepostedState
              ? optimisticRepostCount
              : repostCount;

        setIsReposted(data.reposted);
        setRepostCount(confirmedRepostCount);
        setLastUpdateTime(Date.now());
        setPendingState(prev => ({ ...prev, isReposted: data.reposted }));
        
        if (onUpdate) {
          const updatedPost = withPostCount(post, "reposts", confirmedRepostCount);
          if (data.reposted) {
            updatedPost.reposts = [...(post.reposts || []), { id: Date.now().toString(), userId }];
          } else {
            updatedPost.reposts = (post.reposts || []).filter(repost => repost.userId !== userId);
          }
          onUpdate(updatedPost);
        }
        
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'repost', reposted: data.reposted, repostCount: confirmedRepostCount }
        }));
      } else {
        setIsReposted(!newRepostedState);
        setRepostCount(prev => newRepostedState ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch {
      setIsReposted(!newRepostedState);
      setRepostCount(prev => newRepostedState ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isReposted, isUpdating, repostCount, post, onUpdate, router]);

  const handleSave = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isUpdating) return;
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
            updatedPost.savedBy = [...(post.savedBy || []), { id: Date.now().toString(), userId }];
          } else {
            updatedPost.savedBy = (post.savedBy || []).filter(saved => saved.userId !== userId);
          }
          onUpdate(updatedPost);
        }
        
        window.dispatchEvent(new CustomEvent('postEngagementUpdate', {
          detail: { post, action: 'save', saved: data.saved }
        }));
      } else {
        setIsSaved(!newSavedState);
      }
    } catch {
      setIsSaved(!newSavedState);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, isSaved, isUpdating, post, onUpdate, router]);

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
    } catch {}
  };

  const handlePollVote = useCallback(async (optionIds: string[]) => {
    const userId = session?.user?.id;
    const pollId = post.poll?.id;
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!pollId) return;
    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIds, userId }),
      });
      if (response.ok) {
        // Use client-side refresh instead of full page reload
        router.refresh();
      }
    } catch {}
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
    } catch {
      alert('Failed to delete post. Please try again.');
    }
  }, [post.id, router]);

  const mediaItems = useMemo(() => getPostMediaItems(post.media), [post.media]);

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

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if we're already on the post page
    if (isOnPostPage) return;
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('a, button, [data-stop-propagation]')) return;
    navigateToPost();
  }, [isOnPostPage, navigateToPost]);

  return (
    <article 
      className={surface("panelMuted", "noise-overlay group relative mb-3 overflow-hidden p-3 transition-all duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.18)] hover:bg-[rgba(14,19,27,0.72)] sm:mb-5 sm:p-5")}
      onClick={handlePostClick}
      style={{ cursor: isOnPostPage ? 'default' : 'pointer' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent transition-opacity duration-200 group-hover:via-[rgba(var(--color-accent-2-rgb),0.35)]" />
      <PostDetailHeader
        post={post}
        currentUserId={session?.user?.id}
        showPinnedTag={showPinnedTag}
        avatarError={avatarError}
        displayAvatarUrl={displayAvatarUrl}
        isOwnPost={isOwnPost}
        isActionsMenuOpen={showActionsMenu}
        actionsMenuRef={actionsMenuRef}
        onAvatarError={() => setAvatarError(true)}
        onNavigateToProfile={navigateToProfile}
        onToggleActionsMenu={() => setShowActionsMenu(!showActionsMenu)}
        onPin={handlePin}
        onDelete={() => {
          setShowActionsMenu(false);
          setShowDeleteConfirm(true);
        }}
      />

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

      <PostBodyAttachments
        mediaItems={mediaItems}
        media={post.media}
        poll={post.poll}
        isSlideshow={post.isSlideshow}
        authorName={post.user.name || post.user.username}
        currentUserId={session?.user?.id}
        onPollVote={handlePollVote}
      />

      <PostEngagementBar
        isOnPostPage={isOnPostPage}
        replyCount={getReplyCount(post)}
        repostCount={repostCount}
        likeCount={likeCount}
        viewCount={post.views}
        isReposted={isReposted}
        isLiked={isLiked}
        isSaved={isSaved}
        isUpdating={isUpdating}
        onReply={openReplyModal}
        onRepost={handleRepost}
        onLike={handleLike}
        onShare={handleShare}
        onSave={handleSave}
      />


      {showDeleteConfirm && (
        <Suspense fallback={null}>
          <DeletePostDialog onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} />
        </Suspense>
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
    </article>
  );
});

export default PostDetail;
