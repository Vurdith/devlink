import Image from "next/image";
import { RefObject } from "react";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { getInitials } from "@/lib/user-display";
import type { FeedPost } from "@/types/post";
import { PostActionsMenu } from "./PostActionsMenu";

const avatarFrameClass = "w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/[0.10] transition-all duration-300 hover:border-[rgba(var(--color-accent-2-rgb),0.34)]";

interface PostDetailHeaderProps {
  post: FeedPost;
  currentUserId?: string;
  showPinnedTag: boolean;
  avatarError: boolean;
  displayAvatarUrl?: string | null;
  isOwnPost: boolean;
  isActionsMenuOpen: boolean;
  actionsMenuRef: RefObject<HTMLDivElement | null>;
  onAvatarError: () => void;
  onNavigateToProfile: () => void;
  onToggleActionsMenu: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export function PostDetailHeader({
  post,
  currentUserId,
  showPinnedTag,
  avatarError,
  displayAvatarUrl,
  isOwnPost,
  isActionsMenuOpen,
  actionsMenuRef,
  onAvatarError,
  onNavigateToProfile,
  onToggleActionsMenu,
  onPin,
  onDelete,
}: PostDetailHeaderProps) {
  return (
    <div className="relative mb-3 flex items-start gap-3 sm:mb-4">
      <ProfileTooltip user={post.user} currentUserId={currentUserId}>
        <button type="button" onClick={onNavigateToProfile} className="relative h-10 w-10 flex-shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.62)] sm:h-12 sm:w-12">
          <div className="absolute -inset-1 rounded-full border border-white/[0.06] bg-white/[0.025]" />
          {!avatarError && displayAvatarUrl ? (
            displayAvatarUrl.startsWith("blob:") ? (
              <img
                src={displayAvatarUrl}
                alt={post.user.name || post.user.username}
                className={`${avatarFrameClass} object-cover`}
              />
            ) : (
              <Image
                src={displayAvatarUrl}
                alt={post.user.name || post.user.username}
                width={48}
                height={48}
                className={`${avatarFrameClass} object-cover`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={onAvatarError}
              />
            )
          ) : (
            <div className={`${avatarFrameClass} flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] hover:opacity-90`}>
              <span className="text-white font-semibold text-xs sm:text-sm">{getInitials(post.user.name, post.user.username)}</span>
            </div>
          )}
        </button>
      </ProfileTooltip>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
          <ProfileTooltip user={post.user} currentUserId={currentUserId}>
            <a href={`/u/${post.user.username}`} className="truncate rounded-sm text-sm font-bold tracking-tight text-white transition-colors hover:text-[var(--color-accent-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)] sm:text-base">
              {post.user.name || post.user.username}
            </a>
          </ProfileTooltip>
          {post.user.profile?.verified && (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-accent-2)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-xs text-[var(--muted-foreground)] sm:text-sm">@{post.user.username}</span>
          <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline opacity-50">/</span>
          <TimeAgo date={post.createdAt} className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline" />
          {post.updatedAt > post.createdAt && <span className="hidden rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-xs text-[var(--muted-foreground)] opacity-70 sm:inline">Edited</span>}
          {post.isPinned && showPinnedTag && <span className="hidden rounded-full border border-[rgba(var(--color-accent-2-rgb),0.18)] bg-[rgba(var(--color-accent-2-rgb),0.07)] px-2 py-0.5 text-xs text-[var(--color-accent-2)] sm:inline">Pinned</span>}
        </div>

        <div className="mt-2 rounded-lg border border-transparent pr-1">
          <ContentRenderer content={post.content} className="text-sm sm:text-base text-[var(--foreground)] whitespace-pre-wrap break-words leading-relaxed" currentUserId={currentUserId} />
        </div>
      </div>

      <PostActionsMenu
        postId={post.id}
        isOwnPost={isOwnPost}
        isPinned={post.isPinned}
        isOpen={isActionsMenuOpen}
        menuRef={actionsMenuRef}
        onToggle={onToggleActionsMenu}
        onPin={onPin}
        onDelete={onDelete}
      />
    </div>
  );
}
