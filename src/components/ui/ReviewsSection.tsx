"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { Review } from "./Review";
import { CreateReview } from "./CreateReview";
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

export const ReviewsSection = memo(function ReviewsSection({ targetUserId, targetUsername, currentUserId, canReview = true }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

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

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
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
      <div className="flex items-start justify-between gap-6 mb-10">
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
            className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Write Review
          </button>
        )}
      </div>

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
              Be the first to review <span className="text-purple-400">@{targetUsername}</span>
            </p>
            {canUserReview && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Write the first review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
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
    </div>
  );
});
