"use client";

import { useState, memo } from "react";
import { cn } from "@/lib/cn";

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
      <div className="rounded-2xl p-8 bg-white/[0.02] border border-white/5 text-center">
        <p className="text-white/50 text-lg">Please log in to leave a review.</p>
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
          className="p-2 transition-transform hover:scale-110 active:scale-95"
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
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Write a Review</h3>
        <p className="text-white/50">
          Share your experience with <span className="text-purple-400 font-medium">@{targetUsername}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-4">Your Rating</label>
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
            Your Review <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell others about your experience..."
            className="w-full px-5 py-4 rounded-xl resize-none bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors text-base"
            rows={5}
            maxLength={500}
          />
          <div className="text-right mt-3">
            <span className="text-sm text-white/30">{text.length}/500</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all",
              rating === 0 
                ? "bg-white/10 cursor-not-allowed" 
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            )}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-4 rounded-xl font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
});
