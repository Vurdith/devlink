"use client";
import Link from "next/link";
import { Avatar } from "../ui/Avatar";
import { TimeAgo } from "../ui/TimeAgo";
import { ProfileTooltip } from "../profile/ProfileTooltip";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";

// Derive sentiment from rating
function getSentiment(rating: number): "positive" | "negative" | "neutral" {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

interface ReviewProps {
  review: {
    id: string;
    rating: number;
    text: string | null;
    createdAt: Date;
    reviewer: {
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
  };
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

export function Review({ review, currentUserId, onEdit, onDelete }: ReviewProps) {
  const canEdit = currentUserId === review.reviewer.id;
  const sentiment = getSentiment(review.rating);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={i < rating ? "currentColor" : "none"}
            className={i < rating ? "text-amber-400" : "text-white/15"}
          >
            <path 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
              stroke="currentColor"
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
    );
  };

  const userProfileData = {
    id: review.reviewer.id,
    username: review.reviewer.username,
    name: review.reviewer.name,
    profile: {
      avatarUrl: review.reviewer.profile?.avatarUrl || null,
      bannerUrl: review.reviewer.profile?.bannerUrl || null,
      bio: review.reviewer.profile?.bio || null,
      profileType: review.reviewer.profile?.profileType || "DEVELOPER",
      verified: review.reviewer.profile?.verified || false,
      website: review.reviewer.profile?.website || null,
      location: review.reviewer.profile?.location || null
    },
    _count: review.reviewer._count || {
      followers: 0,
      following: 0
    }
  };

  return (
    <div className={surface("panelMuted", "group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.035]")}>
      {/* User Info Row */}
      <div className="flex items-start gap-4 p-5 pb-4 sm:p-6 sm:pb-4">
        <ProfileTooltip user={userProfileData} currentUserId={currentUserId} position="top">
          <Link
            href={`/u/${review.reviewer.username}`}
            className="flex-shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(12,16,23)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar size={48} src={review.reviewer.profile?.avatarUrl || undefined} />
          </Link>
        </ProfileTooltip>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <ProfileTooltip user={userProfileData} currentUserId={currentUserId} position="top">
              <Link
                href={`/u/${review.reviewer.username}`}
                className="rounded-md font-semibold text-white outline-none transition-colors hover:text-[var(--color-accent-2)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)]"
                onClick={(e) => e.stopPropagation()}
              >
                {review.reviewer.name || review.reviewer.username}
              </Link>
            </ProfileTooltip>
            
            {review.reviewer.profile?.verified && (
              <svg className="w-4 h-4 text-[var(--color-accent-2)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/40">@{review.reviewer.username}</span>
          </div>
        </div>

        <TimeAgo
          date={review.createdAt}
          className="flex-shrink-0 text-sm text-white/30"
        />
      </div>

      {/* Rating Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.06] bg-white/[0.018] px-5 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {renderStars(review.rating)}
          <span className="text-sm font-semibold text-white">{review.rating}/5</span>
        </div>
        <span className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          sentiment === "positive"
            ? "text-emerald-300"
            : sentiment === "neutral"
              ? "text-amber-300"
              : "text-rose-300"
        )}>
          {sentiment === "positive" ? "Positive" : sentiment === "neutral" ? "Neutral" : "Critical"}
        </span>
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="whitespace-pre-wrap px-5 py-5 text-[15px] leading-relaxed text-white/70 sm:px-6">
          {review.text}
        </p>
      )}

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-4 opacity-100 transition-opacity sm:px-6 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          <button
            onClick={() => onEdit?.(review.id)}
            className={cn("flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--color-accent-2)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)]", ui.control.ghost)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete?.(review.id)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-rose-300 outline-none transition-colors hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-300/55"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
