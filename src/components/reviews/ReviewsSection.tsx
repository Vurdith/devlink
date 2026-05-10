"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "../ui/BaseModal";
import { Button } from "@/components/ui/Button";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { cn } from "@/lib/cn";
import { skeleton, surface, ui } from "@/components/ui/design-system";
import { CreateReview } from "./CreateReview";
import { Review } from "./Review";

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

function getSentiment(rating: number): "positive" | "negative" | "neutral" {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

function ReviewStar({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={cn("h-5 w-5", filled ? "text-amber-400" : "text-white/20")}
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EmptyReviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

export const ReviewsSection = memo(function ReviewsSection({
  targetUserId,
  targetUsername,
  currentUserId,
  canReview = true,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; reviewId: string | null }>({
    isOpen: false,
    reviewId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?targetUserId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        const nextReviews: unknown = Array.isArray(data)
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

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const sentimentCounts = useMemo(() => {
    return reviews.reduce(
      (acc, review) => {
        const sentiment = getSentiment(review.rating);
        acc[sentiment] += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (sentimentFilter === "all") return reviews;
    return reviews.filter((review) => getSentiment(review.rating) === sentimentFilter);
  }, [reviews, sentimentFilter]);

  const canUserReview = canReview && currentUserId && currentUserId !== targetUserId;

  const handleReviewCreated = () => {
    setShowCreateForm(false);
    fetchReviews();
  };

  const handleEditReview = (reviewId: string) => {
    if (!reviews.some((item) => item.id === reviewId)) return;
    setShowCreateForm(true);
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirm.reviewId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${deleteConfirm.reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((review) => review.id !== deleteConfirm.reviewId));
        setDeleteConfirm({ isOpen: false, reviewId: null });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1.5" aria-label={`${rating || 0} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <ReviewStar key={index} filled={index < Math.round(rating)} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={surface("panel", "p-5 sm:p-6")}>
          <div className={skeleton("h-4 w-24")} />
          <div className={skeleton("mt-4 h-7 w-40")} />
          <div className={skeleton("mt-4 h-5 w-56 max-w-full")} />
        </div>
        {[1, 2].map((item) => (
          <div key={item} className={surface("panelMuted", "p-5 sm:p-6")}>
            <div className="flex gap-4">
              <div className={skeleton("h-12 w-12 flex-shrink-0 rounded-full")} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className={skeleton("h-5 w-40 max-w-full")} />
                <div className={skeleton("h-4 w-28")} />
                <div className={skeleton("h-20 w-full")} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filterTabs: Array<{ id: SentimentFilter; label: string; count: number; className?: string; activeHalo?: string }> = [
    { id: "all", label: "All", count: reviews.length },
    { id: "positive", label: "Positive", count: sentimentCounts.positive, activeHalo: "accent-halo-emerald", className: "data-[active=true]:border-emerald-500/30 data-[active=true]:bg-emerald-500/16 data-[active=true]:text-emerald-300 hover:text-emerald-300" },
    { id: "neutral", label: "Neutral", count: sentimentCounts.neutral, activeHalo: "accent-halo-amber", className: "data-[active=true]:border-amber-500/30 data-[active=true]:bg-amber-500/16 data-[active=true]:text-amber-300 hover:text-amber-300" },
    { id: "negative", label: "Critical", count: sentimentCounts.negative, activeHalo: "accent-halo-rose", className: "data-[active=true]:border-rose-500/30 data-[active=true]:bg-rose-500/16 data-[active=true]:text-rose-300 hover:text-rose-300" },
  ];

  return (
    <div className="space-y-5">
      <section className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            background: "radial-gradient(700px 220px at 10% 0%, rgba(var(--color-accent-2-rgb),0.11), transparent 62%)",
          }}
        />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Peer signal</p>
            <h2 className="mt-2 font-[var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-white">Reviews</h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {renderStars(averageRating)}
              <span className="text-2xl font-semibold text-white">{averageRating || "-"}</span>
              <span className="text-sm text-white/45">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {canUserReview && !showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="glow"
              size="md"
              className="w-full whitespace-nowrap sm:w-auto"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Write Review
            </Button>
          ) : null}
        </div>
      </section>

      {reviews.length > 0 ? (
        <div className={surface("toolbar", "flex gap-1.5 overflow-x-auto p-1.5")}>
          {filterTabs.map((tab) => {
            const active = sentimentFilter === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                data-active={active}
                onClick={() => setSentimentFilter(tab.id)}
                className={cn(
                  "flex-shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)]",
                  active
                    ? tab.id === "all"
                      ? ui.active.cyanStrong
                      : "border-white/[0.10]"
                    : "border-transparent text-white/50 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/80",
                  active && tab.activeHalo,
                  tab.className
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-white/40">({tab.count})</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {showCreateForm ? (
        <CreateReview
          targetUserId={targetUserId}
          targetUsername={targetUsername}
          currentUserId={currentUserId}
          onReviewCreated={handleReviewCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <FeedbackState
            title="No reviews yet"
            description={`Be the first to review @${targetUsername}.`}
            className="py-16"
            icon={<EmptyReviewIcon />}
            action={
              canUserReview && !showCreateForm
                ? { label: "Write the first review", onClick: () => setShowCreateForm(true) }
                : undefined
            }
          />
        ) : filteredReviews.length === 0 ? (
          <FeedbackState
            title={`No ${sentimentFilter === "negative" ? "critical" : sentimentFilter} reviews`}
            description={
              sentimentFilter === "positive"
                ? "There are no positive reviews (4-5 stars) yet."
                : sentimentFilter === "neutral"
                  ? "There are no neutral reviews (3 stars) yet."
                  : "There are no critical reviews (1-2 stars) yet."
            }
            className="py-14"
            icon={<EmptyReviewIcon />}
            action={{ label: "View all reviews", onClick: () => setSentimentFilter("all") }}
          />
        ) : (
          filteredReviews.map((review) => (
            <Review
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEditReview}
              onDelete={(reviewId) => setDeleteConfirm({ isOpen: true, reviewId })}
            />
          ))
        )}
      </div>

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
