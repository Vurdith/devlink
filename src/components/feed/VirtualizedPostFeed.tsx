"use client";
import { memo, useCallback, useRef, useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
  replies?: Array<any>;
  views: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  isPinned: boolean;
  userVote?: {
    optionIds: string[];
  };
}

interface VirtualizedPostFeedProps {
  posts: Post[];
  currentUserId?: string;
  hidePinnedIndicator?: boolean;
  isLoading?: boolean;
  onUpdate?: (updatedPost: Post) => void;
  // For infinite scroll
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// Estimated post height for virtual scrolling calculations
const ESTIMATED_POST_HEIGHT = 400;

// Memoized post item with IntersectionObserver for lazy rendering
const VirtualPostItem = memo(function VirtualPostItem({ 
  post, 
  showPinnedTag, 
  onUpdate,
  onVisible
}: { 
  post: Post; 
  showPinnedTag: boolean; 
  onUpdate?: (updatedPost: Post) => void;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  
  useEffect(() => {
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
        />
      ) : (
        // Placeholder with estimated height
        <div 
          className="relative overflow-hidden glass border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6 noise-overlay"
          style={{ minHeight: ESTIMATED_POST_HEIGHT }}
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}, (prev, next) => {
  // Check all fields that affect rendering, including engagement state
  return prev.post.id === next.post.id && 
         prev.post.updatedAt === next.post.updatedAt &&
         prev.post.isLiked === next.post.isLiked &&
         prev.post.isReposted === next.post.isReposted &&
         prev.post.isSaved === next.post.isSaved &&
         prev.showPinnedTag === next.showPinnedTag;
});

export const VirtualizedPostFeed = memo(function VirtualizedPostFeed({ 
  posts, 
  hidePinnedIndicator = false, 
  isLoading = false, 
  onUpdate,
  hasMore = false,
  onLoadMore
}: VirtualizedPostFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Stable callback reference
  const handleUpdate = useCallback((updatedPost: Post) => {
    onUpdate?.(updatedPost);
  }, [onUpdate]);
  
  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore || !onLoadMore || !loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          onLoadMore();
          // Reset after a short delay
          setTimeout(() => setLoadingMore(false), 1000);
        }
      },
      { rootMargin: '400px' }
    );
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, loadingMore]);

  if (isLoading && posts.length === 0) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
        <p className="text-[var(--muted-foreground)]">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <VirtualPostItem
          key={post.id}
          post={post}
          showPinnedTag={!hidePinnedIndicator}
          onUpdate={handleUpdate}
        />
      ))}
      
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default VirtualizedPostFeed;

