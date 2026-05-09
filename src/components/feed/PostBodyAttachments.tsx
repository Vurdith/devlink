import { lazy, Suspense } from "react";
import type { FeedPost, FeedPostMedia, FeedPoll } from "@/types/post";

const MediaViewer = lazy(() => import("@/components/ui/MediaViewer").then((module) => ({ default: module.MediaViewer })));
const PollDisplay = lazy(() => import("@/components/polls/PollDisplay").then((module) => ({ default: module.PollDisplay })));

interface PostBodyAttachmentsProps {
  mediaItems: Array<{ id: string; url: string; type: "image" | "video" }>;
  media: FeedPostMedia[];
  poll?: FeedPoll | null;
  isSlideshow: boolean;
  authorName: string;
  currentUserId?: string;
  onPollVote: (optionIds: string[]) => Promise<void>;
}

export function getPostMediaItems(media: FeedPost["media"]) {
  if (!media || media.length === 0) return [];

  return [...media]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      url: item.mediaUrl,
      type: item.mediaType === "video" ? ("video" as const) : ("image" as const),
    }));
}

export function PostBodyAttachments({
  mediaItems,
  media,
  poll,
  isSlideshow,
  authorName,
  currentUserId,
  onPollVote,
}: PostBodyAttachmentsProps) {
  return (
    <>
      {mediaItems.length > 0 && (
        <div className="mt-4">
          <Suspense fallback={<div className="h-48 bg-white/5 rounded-xl animate-pulse" />}>
            <MediaViewer media={mediaItems} isSlideshow={isSlideshow} alt={`${authorName}'s post`} className="border border-white/[0.08]" />
          </Suspense>
        </div>
      )}

      {poll && (
        <div className={`${media.length > 0 ? "mt-6" : "mt-4"}`}>
          <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse" />}>
            <PollDisplay poll={poll} onVote={onPollVote} currentUserId={currentUserId} />
          </Suspense>
        </div>
      )}
    </>
  );
}
