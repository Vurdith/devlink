"use client";
import { memo, useCallback } from "react";
import { VirtualizedPostFeed } from "./VirtualizedPostFeed";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { FeedEmptyState } from "./FeedEmptyState";
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
    return <FeedEmptyState />;
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
