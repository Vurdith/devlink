"use client";
import { Avatar } from "./Avatar";
import { TimeAgo } from "./TimeAgo";
import { ProfileTooltip } from "./ProfileTooltip";
import { cn } from "@/lib/cn";

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
    <div className="group bg-white/[0.02] hover:bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200 p-6">
      {/* User Info Row */}
      <div className="flex items-start gap-4 mb-4">
        <ProfileTooltip user={userProfileData} currentUserId={currentUserId} position="top">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/u/${review.reviewer.username}`;
            }}
            className="flex-shrink-0 cursor-pointer"
          >
            <Avatar size={48} src={review.reviewer.profile?.avatarUrl || undefined} />
          </button>
        </ProfileTooltip>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ProfileTooltip user={userProfileData} currentUserId={currentUserId} position="top">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/u/${review.reviewer.username}`;
                }}
                className="font-semibold text-white hover:text-red-400 transition-colors"
              >
                {review.reviewer.name || review.reviewer.username}
              </button>
            </ProfileTooltip>
            
            {review.reviewer.profile?.verified && (
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
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
          className="text-sm text-white/30 flex-shrink-0"
        />
      </div>

      {/* Rating Row */}
      <div className="flex items-center gap-3 mb-4">
        {renderStars(review.rating)}
        <span className="text-sm text-white/40">{review.rating}/5</span>
        
        {/* Sentiment Badge */}
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          sentiment === "positive" 
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            : sentiment === "neutral"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              : "bg-[var(--color-accent)]/15 text-red-400 border border-[var(--color-accent)]/30"
        )}>
          {sentiment === "positive" ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          ) : sentiment === "neutral" ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          )}
          {sentiment === "positive" ? "Positive" : sentiment === "neutral" ? "Neutral" : "Negative"}
        </span>
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="text-[15px] text-white/70 leading-relaxed whitespace-pre-wrap">
          {review.text}
        </p>
      )}

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(review.id)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-red-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete?.(review.id)}
            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
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
