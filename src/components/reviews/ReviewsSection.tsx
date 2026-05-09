"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Review } from "./Review";
import { CreateReview } from "./CreateReview";
import { ConfirmModal } from "../ui/BaseModal";
import { cn } from "@/lib/cn";
import { iconBox, surface, ui } from "@/components/ui/design-system";

interface ReviewsSectionProps {
  targetUserId: string;
  targetUsername: string;
  currentUserId?: string;
  canReview?: boolean;
}

interface ReviewData {
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
}

type SentimentFilter = "all" | "positive" | "neutral" | "negative";

// Derive sentiment from rating
function getSentiment(rating: number): "positive" | "negative" | "neutral" {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

export const ReviewsSection = memo(function ReviewsSection({ targetUserId, targetUsername, currentUserId, canReview = true }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; reviewId: string | null }>({ isOpen: false, reviewId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?targetUserId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        // API returns `{ reviews, pagination }`, but keep the component resilient
        // in case the endpoint shape changes.
        const nextReviews: unknown =
          Array.isArray(data)
            ? data
            : data && typeof data === "object"
              ? (data as { reviews?: unknown }).reviews
              : null;
        setReviews(Array.isArray(nextReviews) ? nextReviews : []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewCreated = () => {
    setShowCreateForm(false);
    fetchReviews();
  };

  const handleEditReview = (reviewId: string) => {
    const review = reviews.find((item) => item.id === reviewId);
    if (!review) return;
    setShowCreateForm(true);
  };

  const handleDeleteReview = (reviewId: string) => {
    setDeleteConfirm({ isOpen: true, reviewId });
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirm.reviewId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${deleteConfirm.reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== deleteConfirm.reviewId));
        setDeleteConfirm({ isOpen: false, reviewId: null });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  // Count reviews by sentiment
  const sentimentCounts = useMemo(() => {
    return reviews.reduce(
      (acc, review) => {
        const sentiment = getSentiment(review.rating);
        if (sentiment === "positive") acc.positive++;
        else if (sentiment === "neutral") acc.neutral++;
        else if (sentiment === "negative") acc.negative++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [reviews]);

  // Filter reviews based on selected sentiment
  const filteredReviews = useMemo(() => {
    if (sentimentFilter === "all") return reviews;
    return reviews.filter((review) => getSentiment(review.rating) === sentimentFilter);
  }, [reviews, sentimentFilter]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill={i < Math.round(rating) ? "currentColor" : "none"}
            className={cn(
              "w-5 h-5",
              i < Math.round(rating) 
                ? "text-amber-400" 
                : "text-white/20"
            )}
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

  if (loading) {
    return (
      <div className="py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-white/5 rounded-lg w-1/3" />
          <div className="h-6 bg-white/5 rounded-lg w-1/4" />
          <div className="space-y-6 mt-8">
            {[1, 2].map((i) => (
              <div key={i} className={surface("panelMuted", "p-8")}>
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="h-5 bg-white/5 rounded w-1/3" />
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                    <div className="h-20 bg-white/5 rounded mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canUserReview = canReview && currentUserId && currentUserId !== targetUserId;

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Reviews</h2>
          <div className="flex items-center gap-4">
            {renderStars(averageRating)}
            <span className="text-2xl font-bold text-white">{averageRating || "—"}</span>
            <span className="text-white/40 text-lg">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        {canUserReview && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className={cn("flex flex-shrink-0 items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold transition-all", ui.control.gradient, ui.motion.press)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Write Review
          </button>
        )}
      </div>

      {/* Sentiment Filter Tabs */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setSentimentFilter("all")}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
              sentimentFilter === "all"
                ? ui.active.cyanStrong
                : "border-transparent text-white/50 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/80"
            )}
          >
            All
            <span className="ml-1.5 text-white/40">({reviews.length})</span>
          </button>
          <button
            onClick={() => setSentimentFilter("positive")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
              sentimentFilter === "positive"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Positive
            <span className={cn("ml-0.5", sentimentFilter === "positive" ? "text-emerald-400/70" : "text-white/40")}>
              ({sentimentCounts.positive})
            </span>
          </button>
          <button
            onClick={() => setSentimentFilter("neutral")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
              sentimentFilter === "neutral"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-white/50 hover:text-amber-400 hover:bg-amber-500/10"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Neutral
            <span className={cn("ml-0.5", sentimentFilter === "neutral" ? "text-amber-400/70" : "text-white/40")}>
              ({sentimentCounts.neutral})
            </span>
          </button>
          <button
            onClick={() => setSentimentFilter("negative")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
              sentimentFilter === "negative"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-white/50 hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            Negative
            <span className={cn("ml-0.5", sentimentFilter === "negative" ? "text-red-400/70" : "text-white/40")}>
              ({sentimentCounts.negative})
            </span>
          </button>
        </div>
      )}

      {/* Create Review Form */}
      {showCreateForm && (
        <div className="mb-10">
          <CreateReview
            targetUserId={targetUserId}
            targetUsername={targetUsername}
            currentUserId={currentUserId}
            onReviewCreated={handleReviewCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className={surface("empty", "px-6 py-20 text-center")}>
            <div className={iconBox("amber", "mx-auto mb-8 h-20 w-20")}>
              <svg className="w-10 h-10 text-amber-400/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No reviews yet</h3>
            <p className="text-white/50 text-lg mb-8">
              Be the first to review <span className="text-[var(--color-accent)]">@{targetUsername}</span>
            </p>
            {canUserReview && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className={cn("rounded-lg px-6 py-3 text-sm font-semibold transition-all", ui.control.gradient)}
              >
                Write the first review
              </button>
            )}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className={surface("empty", "px-6 py-16 text-center")}>
            <div className={cn(
              "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg",
              sentimentFilter === "positive" 
                ? "bg-emerald-500/10 border border-emerald-500/20" 
                : sentimentFilter === "neutral"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-red-500/10 border border-red-500/20"
            )}>
              {sentimentFilter === "positive" ? (
                <svg className="w-8 h-8 text-emerald-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              ) : sentimentFilter === "neutral" ? (
                <svg className="w-8 h-8 text-amber-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No {sentimentFilter} reviews
            </h3>
            <p className="text-white/40">
              {sentimentFilter === "positive" 
                ? "There are no positive reviews (4-5 stars) yet." 
                : sentimentFilter === "neutral"
                  ? "There are no neutral reviews (3 stars) yet."
                  : "There are no negative reviews (1-2 stars) yet."}
            </p>
            <button
              onClick={() => setSentimentFilter("all")}
              className="mt-4 text-sm text-[var(--color-accent)] hover:text-white transition-colors"
            >
              View all reviews →
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Review
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, reviewId: null })}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
});
