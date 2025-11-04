"use client";
import { useState } from "react";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

interface CreateReviewProps {
  targetUserId: string;
  targetUsername: string;
  currentUserId?: string;
  onReviewCreated?: () => void;
  onCancel?: () => void;
}

export function CreateReview({ targetUserId, targetUsername, currentUserId, onReviewCreated, onCancel }: CreateReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUserId) {
    return (
      <div className="glass rounded-lg p-4 text-center">
        <p className="text-[var(--muted-foreground)]">Please log in to leave a review.</p>
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
        
        // Show user-friendly error message
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

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <motion.button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 transition-transform hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            className={`w-6 h-6 ${isFilled ? "text-yellow-400" : "text-gray-400"}`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-lg p-4 border border-white/10"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Share your experience with <span className="text-[var(--accent)]">@{targetUsername}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-3 text-sm text-[var(--muted-foreground)]">
              {hoveredRating || rating}/5
            </span>
          </div>
          {rating === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 mt-1"
            >
              Please select a rating
            </motion.p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="block text-sm font-medium mb-2">
            Review (optional)
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about working with this user..."
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:border-[var(--accent)] outline-none resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-[var(--muted-foreground)]">
              {text.length}/500 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
