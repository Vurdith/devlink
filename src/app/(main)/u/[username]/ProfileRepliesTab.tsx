"use client";

import Image from "next/image";
import { PostFeed } from "@/components/feed/PostFeed";
import { FeedbackState, LoadMoreButton } from "@/components/ui/FeedbackState";
import { surface } from "@/components/ui/design-system";
import type { TabPost, TabType } from "./profile-types";

interface ProfileRepliesTabProps {
  posts: TabPost[];
  currentUserId?: string;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onUpdate: (post: unknown) => void;
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

export function ProfileRepliesTab({
  posts,
  currentUserId,
  hasMore,
  loading,
  onLoadMore,
  onUpdate,
  session,
}: ProfileRepliesTabProps) {
  const renderReplyWithPreview = (reply: TabPost) => {
    if (!reply.replyTo) return null;

    const originalPost = reply.replyTo;
    const originalAuthor = originalPost.user;
    const originalMediaCount = originalPost.media?.length ?? 0;

    return (
      <div
        key={reply.id}
        className={surface("panelMuted", "relative overflow-hidden transition-colors hover:border-white/[0.14]")}
      >
        <button
          onClick={() => (window.location.href = `/p/${originalPost.id}`)}
          className="w-full text-left p-4 pb-3 hover:bg-white/[0.025] transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <Image
                src={originalAuthor?.image || "/default-avatar.png"}
                alt={originalAuthor?.username || "User"}
                width={32}
                height={32}
                unoptimized={!originalAuthor?.image?.startsWith("/")}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[rgba(var(--color-accent-rgb),0.3)] transition-all"
              />
              <div className="w-0.5 h-6 bg-gradient-to-b from-[rgba(var(--color-accent-2-rgb),0.45)] to-transparent mt-2" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/90 group-hover:text-white truncate">
                  {originalAuthor?.name || originalAuthor?.username || "Unknown"}
                </span>
                <span className="text-xs text-white/40">
                  @{originalAuthor?.username || "unknown"}
                </span>
              </div>
              <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                {originalPost.content}
              </p>
              {originalMediaCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path
                      d="M21 15l-5-5L5 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    {originalMediaCount}{" "}
                    {originalMediaCount === 1 ? "image" : "images"}
                  </span>
                </div>
              )}
            </div>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white/20 group-hover:text-[rgba(var(--color-accent-rgb),0.6)] transition-colors flex-shrink-0 mt-1"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.025] border-y border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[rgba(var(--color-accent-2-rgb),0.75)]"
            >
              <path
                d="M3 10h10a5 5 0 0 1 5 5v6M3 10l6 6M3 10l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Replied</span>
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="px-0">
          <PostFeed
            posts={[reply]}
            currentUserId={currentUserId}
            showNavigationArrow={false}
            hidePinnedIndicator={true}
            onUpdate={onUpdate}
            session={session}
          />
        </div>
      </div>
    );
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        tab="replies"
        icon={
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(renderReplyWithPreview)}
      {hasMore && (
        <LoadMoreButton loading={loading} onClick={onLoadMore} className="pt-4" />
      )}
    </div>
  );
}

interface EmptyStateProps {
  tab: TabType;
  icon: React.ReactNode;
}

export function EmptyState({ tab, icon }: EmptyStateProps) {
  const messages: Record<TabType, { title: string; description: string }> = {
    about: { title: "No about info", description: "" },
    posts: {
      title: "No posts yet",
      description: "When you post, it will appear here.",
    },
    replies: {
      title: "No replies yet",
      description: "When you reply to posts, they will appear here.",
    },
    reposts: {
      title: "No reposts yet",
      description: "When you repost something, it will appear here.",
    },
    liked: {
      title: "No liked posts",
      description: "Posts you like will appear here.",
    },
    saved: {
      title: "No saved posts",
      description: "Posts you save will appear here.",
    },
    portfolio: {
      title: "No portfolio items",
      description: "This user hasn't shared their portfolio yet.",
    },
    reviews: {
      title: "No reviews yet",
      description: "Reviews will appear here.",
    },
  };

  const { title, description } = messages[tab];

  return (
    <FeedbackState
      title={title}
      description={description}
      icon={icon}
      className="px-6 py-14 [&_svg]:h-8 [&_svg]:w-8"
    />
  );
}
