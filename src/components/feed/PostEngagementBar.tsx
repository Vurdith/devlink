import { cn } from "@/lib/cn";
import { EngagementButton } from "./EngagementButton";

interface PostEngagementBarProps {
  isOnPostPage: boolean;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  viewCount: number;
  isReposted: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isUpdating: boolean;
  onReply: () => void;
  onRepost: () => void;
  onLike: () => void;
  onShare: () => void;
  onSave: () => void;
}

export function PostEngagementBar({
  isOnPostPage,
  replyCount,
  repostCount,
  likeCount,
  viewCount,
  isReposted,
  isLiked,
  isSaved,
  isUpdating,
  onReply,
  onRepost,
  onLike,
  onShare,
  onSave,
}: PostEngagementBarProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 sm:mt-6 sm:pt-4">
      {!isOnPostPage && (
        <EngagementButton onClick={onReply} isActive={replyCount > 0} activeColor="blue" count={replyCount} ariaLabel="Reply to this post">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </EngagementButton>
      )}

      <EngagementButton onClick={onRepost} isActive={isReposted} activeColor="green" count={repostCount} showExplosion disabled={isUpdating} ariaLabel={isReposted ? "Undo repost" : "Repost"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("transition-transform duration-500", isReposted && "rotate-180")}>
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </EngagementButton>

      <EngagementButton onClick={onLike} isActive={isLiked} activeColor="red" count={likeCount} showExplosion disabled={isUpdating} ariaLabel={isLiked ? "Unlike" : "Like"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={cn(isLiked && "animate-like")}>
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </EngagementButton>

      <EngagementButton isActive={false} activeColor="gray" count={viewCount} ariaLabel="View count">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </EngagementButton>

      <EngagementButton onClick={onShare} isActive={false} activeColor="gray" label="Share" ariaLabel="Share post">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </EngagementButton>

      <EngagementButton onClick={onSave} isActive={isSaved} activeColor="yellow" label="Save" disabled={isUpdating} ariaLabel={isSaved ? "Unsave" : "Save"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </EngagementButton>
    </div>
  );
}
