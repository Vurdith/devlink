"use client";
import { memo, useCallback, useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import PostDetail from "./PostDetail";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { skeleton, surface } from "@/components/ui/design-system";
import type { FeedPost } from "@/types/post";
import { getPostCount, getReplyCount } from "./post-engagement-utils";

interface VirtualizedPostFeedProps {
  posts: FeedPost[];
  currentUserId?: string;
  hidePinnedIndicator?: boolean;
  isLoading?: boolean;
  onUpdate?: (updatedPost: FeedPost) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
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

// Estimated post height for virtual scrolling calculations
const ESTIMATED_POST_HEIGHT = 400;

function getPostRenderKey(post: FeedPost, userId?: string) {
  const likeCount = getPostCount(post, "likes");
  const repostCount = getPostCount(post, "reposts");
  const replyCount = getReplyCount(post);
  const isLiked = post.isLiked ?? (userId ? post.likes?.some(like => like.userId === userId) : false) ?? false;
  const isReposted = post.isReposted ?? (userId ? post.reposts?.some(repost => repost.userId === userId) : false) ?? false;
  const isSaved = post.isSaved ?? (userId ? post.savedBy?.some(saved => saved.userId === userId) : false) ?? false;

  return [
    post.id,
    post.updatedAt,
    post.views,
    likeCount,
    repostCount,
    replyCount,
    isLiked ? 1 : 0,
    isReposted ? 1 : 0,
    isSaved ? 1 : 0,
  ].join(":");
}

// Memoized post item with IntersectionObserver for lazy rendering
const VirtualPostItem = memo(function VirtualPostItem({ 
  post, 
  renderKey,
  showPinnedTag, 
  onUpdate,
  onVisible,
  session
}: { 
  post: FeedPost; 
  renderKey: string;
  showPinnedTag: boolean; 
  onUpdate?: (updatedPost: FeedPost) => void;
  onVisible?: () => void;
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  
  useEffect(() => {
    if (hasBeenVisible) return;
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          onVisible?.();
        }
      },
      { 
        rootMargin: '200px 0px', // Start loading 200px before entering viewport
        threshold: 0 
      }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasBeenVisible, onVisible]);
  
  return (
    <article 
      ref={ref}
      data-render-key={renderKey}
      className={hasBeenVisible ? "animate-post-in" : ""}
      style={{ 
        contain: 'layout style paint',
        contentVisibility: 'auto',
        containIntrinsicSize: `0 ${ESTIMATED_POST_HEIGHT}px`
      }}
    >
      {/* Only render full content if visible or has been visible */}
      {hasBeenVisible ? (
        <PostDetail
          post={post}
          showPinnedTag={showPinnedTag}
          onUpdate={onUpdate}
          session={session}
        />
      ) : (
        // Placeholder with estimated height
        <div 
          className={surface("panelMuted", "relative mb-4 overflow-hidden p-4 sm:mb-5 sm:p-5")}
          style={{ minHeight: ESTIMATED_POST_HEIGHT }}
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className={skeleton("h-11 w-11 shrink-0 rounded-full")} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className={skeleton("h-4 w-32")} />
                <div className={skeleton("h-3 w-24")} />
              </div>
            </div>
            <div className="space-y-2">
              <div className={skeleton("h-4 w-full")} />
              <div className={skeleton("h-4 w-5/6")} />
              <div className={skeleton("h-4 w-3/5")} />
            </div>
            <div className={skeleton("h-36 w-full rounded-xl")} />
            <div className="flex gap-3">
              <div className={skeleton("h-8 w-20 rounded-lg")} />
              <div className={skeleton("h-8 w-20 rounded-lg")} />
              <div className={skeleton("h-8 w-20 rounded-lg")} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}, (prev, next) => {
  return prev.renderKey === next.renderKey &&
         prev.showPinnedTag === next.showPinnedTag &&
         prev.session?.user?.id === next.session?.user?.id &&
         prev.onUpdate === next.onUpdate &&
         prev.onVisible === next.onVisible;
});

export const VirtualizedPostFeed = memo(function VirtualizedPostFeed({ 
  posts, 
  currentUserId,
  hidePinnedIndicator = false, 
  isLoading = false, 
  onUpdate,
  hasMore = false,
  onLoadMore,
  session
}: VirtualizedPostFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadMorePendingRef = useRef(false);
  const userId = session?.user?.id ?? currentUserId;
  
  // Stable callback reference
  const handleUpdate = useCallback((updatedPost: FeedPost) => {
    onUpdate?.(updatedPost);
  }, [onUpdate]);

  const postRenderKeys = useMemo(() => {
    return new Map(posts.map(post => [post.id, getPostRenderKey(post, userId)]));
  }, [posts, userId]);

  useEffect(() => {
    loadMorePendingRef.current = false;
  }, [posts.length]);
  
  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore || !onLoadMore || !loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadMorePendingRef.current) {
          loadMorePendingRef.current = true;
          onLoadMore();
          window.setTimeout(() => {
            loadMorePendingRef.current = false;
          }, 1000);
        }
      },
      { rootMargin: '400px' }
    );
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (isLoading && posts.length === 0) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className={surface("empty", "noise-overlay overflow-hidden p-4 sm:p-5")}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-2)]">Quiet feed</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal text-white">Follow Roblox builders and studios</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/52">
              New builds, hiring asks, launch notes, and useful replies will appear here once you follow active profiles.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:w-44">
            <Link href="/discover" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.30)] bg-[rgba(var(--color-accent-2-rgb),0.10)] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(var(--color-accent-2-rgb),0.16)]">
              <Users className="h-4 w-4" />
              Find people
            </Link>
            <Link href="/search" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2.5 text-sm font-semibold text-white/74 transition-colors hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white">
              <Search className="h-4 w-4" />
              Search tags
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <VirtualPostItem
          key={post.id}
          post={post}
          renderKey={postRenderKeys.get(post.id) ?? post.id}
          showPinnedTag={!hidePinnedIndicator}
          onUpdate={handleUpdate}
          session={session}
        />
      ))}
      
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-5">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default VirtualizedPostFeed;

