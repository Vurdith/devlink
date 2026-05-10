"use client";

import { useState, memo } from "react";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";

interface CreateReviewProps {
  targetUserId: string;
  targetUsername: string;
  currentUserId?: string;
  onReviewCreated?: () => void;
  onCancel?: () => void;
}

export const CreateReview = memo(function CreateReview({ targetUserId, targetUsername, currentUserId, onReviewCreated, onCancel }: CreateReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUserId) {
    return (
      <div className={surface("empty", "p-8 text-center")}>
        <p className="text-lg text-white/50">Sign in to leave feedback.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          rating,
          text: text.trim() || null
        }),
      });

      if (response.ok) {
        setRating(0);
        setText("");
        onReviewCreated?.();
      } else {
        const error = await response.text();
        console.error("Error creating review:", error);
        
        if (error.includes("Cannot review yourself")) {
          alert("You cannot review yourself.");
        } else {
          alert("Failed to create review. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error creating review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= displayRating;
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="min-h-11 min-w-11 rounded-lg p-2 transition-transform hover:scale-110 hover:bg-white/[0.035] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            className={cn(
              "transition-colors",
              isFilled ? "text-amber-400" : "text-white/20"
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
        </button>
      );
    });
  };

  return (
    <div className={surface("panel", "p-5 sm:p-6")}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-2 text-xl font-bold text-white">Write a review</h3>
        <p className="text-white/50">
          Tell others what it was like to work with <span className="font-medium text-[var(--color-accent)]">@{targetUsername}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selection */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-white/70">Rating</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars()}
            </div>
            {displayRating > 0 && (
              <span className="text-lg text-white/50 ml-3">{displayRating}/5</span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="block text-sm font-semibold text-white/70 mb-4">
            Details <span className="font-normal text-white/30">(optional)</span>
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share what went well, what changed, or what future clients should know."
            className={cn(ui.control.field, "min-h-[140px] resize-none px-5 py-4 text-base")}
            rows={5}
            maxLength={500}
          />
          <div className="text-right mt-3">
            <span className="text-sm text-white/30">{text.length}/500</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className={cn(
              "min-h-11 flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-all",
              rating === 0 
                ? "cursor-not-allowed border border-white/[0.08] bg-white/[0.045] text-white/45"
                : ui.control.gradient
            )}
          >
            {isSubmitting ? "Submitting review..." : "Submit review"}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn("min-h-11 rounded-lg px-6 py-3 font-semibold text-white/70 transition-colors", ui.control.ghost)}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
});
