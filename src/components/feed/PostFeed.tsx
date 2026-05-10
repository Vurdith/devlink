"use client";
import { memo, useCallback } from "react";
import { VirtualizedPostFeed } from "./VirtualizedPostFeed";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { FeedbackState } from "@/components/ui/FeedbackState";
import type { FeedPost } from "@/types/post";

interface PostFeedProps {
  posts: FeedPost[];
  currentUserId?: string;
  hidePinnedIndicator?: boolean;
  showNavigationArrow?: boolean;
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

/**
 * Feed list wrapper for loading, empty, and virtualized post states.
 */
export const PostFeed = memo(function PostFeed({ 
  posts, 
  currentUserId,
  hidePinnedIndicator = false, 
  isLoading = false, 
  onUpdate,
  hasMore = false,
  onLoadMore,
  session
}: PostFeedProps) {
  // Stable callback reference
  const handleUpdate = useCallback((updatedPost: FeedPost) => {
    onUpdate?.(updatedPost);
  }, [onUpdate]);

  if (isLoading && posts.length === 0) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <FeedbackState
        title="No posts found"
        description="Fresh posts will appear here as the community shares updates."
        className="py-14"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        }
      />
    );
  }

  return (
    <VirtualizedPostFeed
      posts={posts}
      currentUserId={currentUserId}
      hidePinnedIndicator={hidePinnedIndicator}
      isLoading={isLoading}
      onUpdate={handleUpdate}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      session={session}
    />
  );
});
