"use client";
import { Avatar } from "./Avatar";
import { TimeAgo } from "./TimeAgo";
import { ProfileTooltip } from "./ProfileTooltip";

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

import { getProfileTypeConfig } from "@/lib/profile-types";

export function Review({ review, currentUserId, onEdit, onDelete }: ReviewProps) {

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < rating ? "currentColor" : "none"}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-400"}`}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ));
  };

  const canEdit = currentUserId === review.reviewer.id;

  return (
    <div className="glass rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <ProfileTooltip
          user={{
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
          }}
          currentUserId={currentUserId}
          position="top"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/u/${review.reviewer.username}`;
            }}
            className="flex-shrink-0 group relative cursor-pointer"
          >
            <div className="relative">
              <Avatar size={40} src={review.reviewer.profile?.avatarUrl || undefined} />
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[var(--accent)]/40 transition-colors duration-200"></div>
            </div>
          </button>
        </ProfileTooltip>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/u/${review.reviewer.username}`;
              }}
              className="font-medium hover:underline text-left"
            >
              {review.reviewer.name || review.reviewer.username}
            </button>
            <span className="text-sm text-[var(--muted-foreground)]">
              @{review.reviewer.username}
            </span>
            {review.reviewer.profile?.profileType && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getProfileTypeConfig(review.reviewer.profile.profileType).bgColor} ${getProfileTypeConfig(review.reviewer.profile.profileType).color}`}>
                {getProfileTypeConfig(review.reviewer.profile.profileType).label}
              </span>
            )}
            {review.reviewer.profile?.verified && (
              <span className="text-blue-400 flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
            )}
            <TimeAgo 
              date={review.createdAt} 
              className="text-sm text-[var(--muted-foreground)]"
            />
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-3">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm text-[var(--muted-foreground)]">
              {review.rating}/5
            </span>
          </div>

          {/* Review Text */}
          {review.text && (
            <div className="text-sm text-white/90 whitespace-pre-wrap mb-3">
              {review.text}
            </div>
          )}

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(review.id)}
                className="text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(review.id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
