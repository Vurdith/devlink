"use client";
import { useState, useEffect } from "react";
import { Review } from "./Review";
import { CreateReview } from "./CreateReview";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

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

export function ReviewsSection({ targetUserId, targetUsername, currentUserId, canReview = true }: ReviewsSectionProps) {
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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < Math.round(rating) ? "currentColor" : "none"}
        className={`w-4 h-4 ${i < Math.round(rating) ? "text-yellow-400" : "text-gray-400"}`}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="glass rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const canUserReview = canReview && currentUserId && currentUserId !== targetUserId;

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Reviews</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(averageRating)}
              <span className="ml-2 text-lg font-medium">{averageRating}</span>
            </div>
            <span className="text-[var(--muted-foreground)]">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        
        {canUserReview && !showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Write Review
          </Button>
        )}
      </div>

      {/* Create Review Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CreateReview
              targetUserId={targetUserId}
              targetUsername={targetUsername}
              currentUserId={currentUserId}
              onReviewCreated={handleReviewCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-white/20">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to review @{targetUsername}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Review
                review={review}
                currentUserId={currentUserId}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
