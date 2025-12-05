"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { Review } from "./Review";
import { CreateReview } from "./CreateReview";
import { ConfirmModal } from "./BaseModal";
import { cn } from "@/lib/cn";

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
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; reviewId: string | null }>({ isOpen: false, reviewId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [targetUserId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?targetUserId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreated = () => {
    setShowCreateForm(false);
    fetchReviews();
  };

  const handleEditReview = (reviewId: string) => {
    setEditingReviewId(reviewId);
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

  const handleUpdateReview = async (reviewId: string, rating: number, text: string | null) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(prev => prev.map(review => 
          review.id === reviewId ? updatedReview : review
        ));
        setEditingReviewId(null);
      }
    } catch (error) {
      console.error("Error updating review:", error);
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
              <div key={i} className="rounded-2xl p-8 bg-white/[0.02] border border-white/5">
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
            className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-accent-hover)] to-blue-600 text-white hover:from-[var(--color-accent)] hover:to-blue-500 transition-all duration-200 hover:scale-105 active:scale-95"
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
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              sentimentFilter === "all"
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
          >
            All
            <span className="ml-1.5 text-white/40">({reviews.length})</span>
          </button>
          <button
            onClick={() => setSentimentFilter("positive")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
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
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
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
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
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
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
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
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-accent-hover)] to-blue-600 text-white hover:from-[var(--color-accent)] hover:to-blue-500 transition-all"
              >
                Write the first review
              </button>
            )}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className={cn(
              "w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center",
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
