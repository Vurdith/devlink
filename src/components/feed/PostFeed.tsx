"use client";
import { memo, useCallback } from "react";
import Link from "next/link";
import { Search, SquarePen, Users } from "lucide-react";
import { VirtualizedPostFeed } from "./VirtualizedPostFeed";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { surface } from "@/components/ui/design-system";
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
        <div className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
          {["Share what you shipped", "Ask for help", "Reply to active builders"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg bg-white/[0.025] px-3 py-2 text-sm text-white/58">
              <SquarePen className="h-4 w-4 text-white/38" />
              {item}
            </div>
          ))}
        </div>
      </div>
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
