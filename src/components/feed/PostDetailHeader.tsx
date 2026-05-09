import Image from "next/image";
import { RefObject } from "react";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { getInitials } from "@/lib/user-display";
import type { FeedPost } from "@/types/post";
import { PostActionsMenu } from "./PostActionsMenu";

const avatarFrameClass = "w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/[0.08] transition-all duration-300 hover:border-white/[0.18]";

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
    <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
      <ProfileTooltip user={post.user} currentUserId={currentUserId}>
        <div onClick={onNavigateToProfile} className="relative cursor-pointer flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
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
            <div className={`${avatarFrameClass} flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-pink-500 hover:opacity-90`}>
              <span className="text-white font-semibold text-xs sm:text-sm">{getInitials(post.user.name, post.user.username)}</span>
            </div>
          )}
        </div>
      </ProfileTooltip>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
          <ProfileTooltip user={post.user} currentUserId={currentUserId}>
            <a href={`/u/${post.user.username}`} className="font-bold text-sm sm:text-base text-white hover:underline truncate tracking-tight">
              {post.user.name || post.user.username}
            </a>
          </ProfileTooltip>
          {post.user.profile?.verified && (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-[var(--muted-foreground)] text-xs sm:text-sm">@{post.user.username}</span>
          <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline opacity-50">&bull;</span>
          <TimeAgo date={post.createdAt} className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden min-[400px]:inline" />
          {post.updatedAt > post.createdAt && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline opacity-50">&bull; Edited</span>}
          {post.isPinned && showPinnedTag && <span className="text-[var(--muted-foreground)] text-xs sm:text-sm hidden sm:inline opacity-50">&bull; Pinned</span>}
        </div>

        <div className="mt-1">
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
