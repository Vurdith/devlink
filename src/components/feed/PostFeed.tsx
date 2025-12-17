"use client";
import { memo, useCallback } from "react";
import { VirtualizedPostFeed } from "./VirtualizedPostFeed";
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

interface PostFeedProps {
  posts: Post[];
  currentUserId?: string;
  hidePinnedIndicator?: boolean;
  showNavigationArrow?: boolean;
  isLoading?: boolean;
  onUpdate?: (updatedPost: Post) => void;
  // Infinite scroll props
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * PostFeed - Now powered by VirtualizedPostFeed
 * 
 * Uses the same virtualization technique as X, Facebook, Instagram:
 * - Only renders posts that are in/near the viewport
 * - Shows skeleton placeholders for off-screen posts
 * - Dramatically improves scroll performance on large feeds
 * - Supports infinite scroll with hasMore/onLoadMore
 */
export const PostFeed = memo(function PostFeed({ 
  posts, 
  hidePinnedIndicator = false, 
  isLoading = false, 
  onUpdate,
  hasMore = false,
  onLoadMore
}: PostFeedProps) {
  // Stable callback reference
  const handleUpdate = useCallback((updatedPost: Post) => {
    onUpdate?.(updatedPost);
  }, [onUpdate]);

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

  // Use VirtualizedPostFeed for all feeds - same as X, Facebook, Instagram
  return (
    <VirtualizedPostFeed
      posts={posts}
      hidePinnedIndicator={hidePinnedIndicator}
      isLoading={isLoading}
      onUpdate={handleUpdate}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
    />
  );
});
