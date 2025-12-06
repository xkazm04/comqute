"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, Loader2 } from "lucide-react";
import { useReviewStore } from "@/stores";
import type { Job, Worker } from "@/types";

// ============================================================================
// STAR RATING INPUT
// ============================================================================

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

function StarRatingInput({ rating, onRatingChange, disabled }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-2" data-testid="star-rating-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(star)}
          className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-not-allowed"
          data-testid={`star-input-${star}`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoverRating || rating)
                ? "text-amber-400 fill-amber-400"
                : "text-zinc-600 hover:text-zinc-500"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-lg font-medium text-white">
        {rating > 0 ? rating : "—"}
      </span>
    </div>
  );
}

// ============================================================================
// WRITE REVIEW MODAL
// ============================================================================

interface WriteReviewProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  worker: Worker;
  requesterId: string;
  requesterAddress: string;
  onSuccess?: () => void;
}

export function WriteReview({
  isOpen,
  onClose,
  job,
  worker,
  requesterId,
  requesterAddress,
  onSuccess,
}: WriteReviewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createReview, getReviewForJob } = useReviewStore();
  const existingReview = getReviewForJob(job.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    createReview({
      workerId: worker.id,
      requesterId,
      requesterAddress,
      jobId: job.id,
      rating,
      comment: comment.trim(),
      responseTime: job.completedAt && job.startedAt ? job.completedAt - job.startedAt : 0,
    });

    setIsSubmitting(false);
    setRating(0);
    setComment("");
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  // Already reviewed
  if (existingReview) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="write-review-modal"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Already Reviewed</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="close-review-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-zinc-400">
              You have already submitted a review for this job.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= existingReview.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-zinc-300">{existingReview.comment}</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="write-review-modal"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800"
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Leave a Review</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Rate your experience with {worker.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  data-testid="close-review-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Worker Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                  {worker.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{worker.name}</p>
                  <p className="text-xs text-zinc-500">
                    {worker.address.slice(0, 8)}...{worker.address.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">
                  Rating
                </label>
                <StarRatingInput
                  rating={rating}
                  onRatingChange={setRating}
                  disabled={isSubmitting}
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Share your experience working with this worker..."
                  className="w-full h-32 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none disabled:opacity-50"
                  data-testid="review-comment-input"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                data-testid="cancel-review-btn"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={rating === 0 || !comment.trim() || isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-review-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Review
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WriteReview;
