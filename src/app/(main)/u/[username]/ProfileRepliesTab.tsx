"use client";

import Image from "next/image";
import Link from "next/link";
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
      {posts.map((reply) => (
        <ReplyWithPreview
          key={reply.id}
          reply={reply}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          session={session}
        />
      ))}
      {hasMore && (
        <LoadMoreButton loading={loading} onClick={onLoadMore} className="pt-4" />
      )}
    </div>
  );
}

function ReplyWithPreview({
  reply,
  currentUserId,
  onUpdate,
  session,
}: {
  reply: TabPost;
  currentUserId?: string;
  onUpdate: (post: unknown) => void;
  session?: ProfileRepliesTabProps["session"];
}) {
  if (!reply.replyTo) return null;

  const originalPost = reply.replyTo;
  const originalAuthor = originalPost.user;
  const originalMediaCount = originalPost.media?.length ?? 0;

  return (
    <div className={surface("panelMuted", "relative overflow-hidden transition-colors hover:border-white/[0.14]")}>
      <Link
        href={`/p/${originalPost.id}`}
        className="group block w-full p-4 pb-3 text-left transition-colors hover:bg-white/[0.025]"
      >
        <div className="flex items-start gap-3">
          <div className="relative flex flex-col items-center">
            <Image
              src={originalAuthor?.image || "/default-avatar.png"}
              alt={originalAuthor?.username || "User"}
              width={32}
              height={32}
              unoptimized={!originalAuthor?.image?.startsWith("/")}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10 transition-all group-hover:ring-[rgba(var(--color-accent-rgb),0.3)]"
            />
            <div className="mt-2 h-6 w-0.5 bg-gradient-to-b from-[rgba(var(--color-accent-2-rgb),0.45)] to-transparent" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="truncate text-sm font-medium text-white/90 group-hover:text-white">
                {originalAuthor?.name || originalAuthor?.username || "Unknown"}
              </span>
              <span className="text-xs text-white/40">@{originalAuthor?.username || "unknown"}</span>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-white/60">{originalPost.content}</p>
            {originalMediaCount > 0 ? <OriginalMediaCount count={originalMediaCount} /> : null}
          </div>

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="mt-1 flex-shrink-0 text-white/20 transition-colors group-hover:text-[rgba(var(--color-accent-rgb),0.6)]"
          >
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      <div className="flex items-center gap-3 border-y border-white/[0.05] bg-white/[0.025] px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[rgba(var(--color-accent-2-rgb),0.75)]">
            <path d="M3 10h10a5 5 0 0 1 5 5v6M3 10l6 6M3 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Replied</span>
        </div>
        <div className="h-px flex-1 bg-white/5" />
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
}

function OriginalMediaCount({ count }: { count: number }) {
  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        {count} {count === 1 ? "image" : "images"}
      </span>
    </div>
  );
}

interface EmptyStateProps {
  tab: TabType;
  icon: React.ReactNode;
}

export function EmptyState({ tab, icon }: EmptyStateProps) {
  const messages: Record<TabType, { title: string; description: string }> = {
    about: { title: "No profile context yet", description: "Skills, links, and work details will appear here once this profile is filled out." },
    posts: {
      title: "No original posts yet",
      description: "Project updates, technical notes, and public work logs from this profile will appear here.",
    },
    replies: {
      title: "No replies in view",
      description: "Replies will show how this profile contributes to discussions and answers other developers.",
    },
    reposts: {
      title: "No reposts yet",
      description: "When this profile shares useful posts from others, they will collect here.",
    },
    liked: {
      title: "No liked posts yet",
      description: "Liked posts can reveal tools, ideas, and references this profile finds useful.",
    },
    saved: {
      title: "No saved references yet",
      description: "Saved posts are private to you and work best as a lightweight technical library.",
    },
    portfolio: {
      title: "No public case studies",
      description: "Portfolio work will appear here once this profile publishes selected projects.",
    },
    reviews: {
      title: "No reviews yet",
      description: "Peer feedback will appear here after collaborators or clients leave reviews.",
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
