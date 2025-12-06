"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Calendar,
  Shield,
  Award,
  X,
  Heart,
  MessageSquare,
} from "lucide-react";
import { GlassCard } from "../shared";
import { useReviewStore } from "@/stores";
import { formatQubic, formatDuration, formatRelativeTime } from "@/lib/mock-utils";
import type { Worker, WorkerReview } from "@/types";

// ============================================================================
// STAR RATING DISPLAY
// ============================================================================

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({ rating, size = "md", showValue = true }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1" data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= fullStars
              ? "text-amber-400 fill-amber-400"
              : star === fullStars + 1 && hasHalfStar
              ? "text-amber-400 fill-amber-400/50"
              : "text-zinc-600"
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-white font-medium">
          {rating > 0 ? rating.toFixed(1) : "—"}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// RATING DISTRIBUTION BAR
// ============================================================================

interface RatingDistributionProps {
  distribution: { [key: number]: number };
  totalReviews: number;
}

function RatingDistribution({ distribution, totalReviews }: RatingDistributionProps) {
  return (
    <div className="space-y-2" data-testid="rating-distribution">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 w-6">{rating}★</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                className="h-full bg-amber-400 rounded-full"
              />
            </div>
            <span className="text-xs text-zinc-500 w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

interface ReviewCardProps {
  review: WorkerReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50"
      data-testid={`review-card-${review.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            {review.requesterAddress.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-zinc-300">
              {review.requesterAddress.slice(0, 6)}...{review.requesterAddress.slice(-4)}
            </p>
            <p className="text-[10px] text-zinc-500">{formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" showValue={false} />
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{review.comment}</p>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Response: {formatDuration(review.responseTime)}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// WORKER STATS GRID
// ============================================================================

interface WorkerStatsGridProps {
  worker: Worker;
}

function WorkerStatsGrid({ worker }: WorkerStatsGridProps) {
  const stats = worker.stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="worker-stats-grid">
      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <p className="text-lg font-bold text-white">{stats.completionRate}%</p>
        <p className="text-xs text-zinc-500">Completion Rate</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <p className="text-lg font-bold text-white">
          {stats.avgResponseTime > 0 ? formatDuration(stats.avgResponseTime) : "—"}
        </p>
        <p className="text-xs text-zinc-500">Avg Response Time</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <p className="text-lg font-bold text-white">{stats.repeatClients}</p>
        <p className="text-xs text-zinc-500">Repeat Clients</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <p className="text-lg font-bold text-white">{stats.jobsLast30Days}</p>
        <p className="text-xs text-zinc-500">Jobs (30 days)</p>
      </div>
    </div>
  );
}

// ============================================================================
// REPUTATION BADGE
// ============================================================================

interface ReputationBadgeProps {
  rating: number;
  totalReviews: number;
  completionRate: number;
  size?: "sm" | "md" | "lg";
}

export function ReputationBadge({
  rating,
  totalReviews,
  completionRate,
  size = "md",
}: ReputationBadgeProps) {
  // Determine badge tier based on metrics
  const getTier = () => {
    if (rating >= 4.8 && totalReviews >= 10 && completionRate >= 98) {
      return { label: "Top Rated", color: "bg-amber-500/20 border-amber-500/30 text-amber-400", icon: Award };
    }
    if (rating >= 4.5 && totalReviews >= 5 && completionRate >= 95) {
      return { label: "Rising Talent", color: "bg-purple-500/20 border-purple-500/30 text-purple-400", icon: TrendingUp };
    }
    if (rating >= 4.0 && completionRate >= 90) {
      return { label: "Verified", color: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400", icon: Shield };
    }
    return null;
  };

  const tier = getTier();
  if (!tier) return null;

  const Icon = tier.icon;
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border ${tier.color} ${sizeClasses[size]}`}
      data-testid="reputation-badge"
    >
      <Icon className="w-3 h-3" />
      <span className="font-medium">{tier.label}</span>
    </div>
  );
}

// ============================================================================
// MAIN WORKER PROFILE MODAL
// ============================================================================

interface WorkerProfileProps {
  worker: Worker;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function WorkerProfile({
  worker,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: WorkerProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const { getReviewsByWorker, getAverageRating, getRatingDistribution } = useReviewStore();

  const reviews = getReviewsByWorker(worker.id);
  const avgRating = getAverageRating(worker.id);
  const distribution = getRatingDistribution(worker.id);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="worker-profile-modal"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {worker.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{worker.name}</h2>
                    <ReputationBadge
                      rating={avgRating || worker.stats.avgRating}
                      totalReviews={reviews.length || worker.stats.totalReviews}
                      completionRate={worker.stats.completionRate}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {worker.address.slice(0, 8)}...{worker.address.slice(-6)}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <StarRating rating={avgRating || worker.stats.avgRating} size="sm" />
                    <span className="text-xs text-zinc-500">
                      ({reviews.length || worker.stats.totalReviews} reviews)
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Member since {new Date(worker.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onToggleFavorite && (
                  <button
                    onClick={onToggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite
                        ? "bg-red-500/20 text-red-400"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                    data-testid="toggle-favorite-btn"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  data-testid="close-profile-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                data-testid="tab-overview-btn"
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "reviews"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                data-testid="tab-reviews-btn"
              >
                <MessageSquare className="w-4 h-4" />
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <AnimatePresence mode="wait">
              {activeTab === "overview" ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <WorkerStatsGrid worker={worker} />

                  {/* Rating Distribution */}
                  <GlassCard>
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      Rating Breakdown
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">
                          {(avgRating || worker.stats.avgRating).toFixed(1)}
                        </p>
                        <StarRating rating={avgRating || worker.stats.avgRating} size="lg" showValue={false} />
                        <p className="text-xs text-zinc-500 mt-1">
                          {reviews.length || worker.stats.totalReviews} total reviews
                        </p>
                      </div>
                      <RatingDistribution
                        distribution={distribution || worker.stats.ratingDistribution}
                        totalReviews={reviews.length || worker.stats.totalReviews}
                      />
                    </div>
                  </GlassCard>

                  {/* Hardware & Supported Models */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                      <h3 className="text-sm font-medium text-zinc-400 mb-3">Hardware</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">GPU</span>
                          <span className="text-zinc-300">{worker.hardware.gpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">VRAM</span>
                          <span className="text-zinc-300">{worker.hardware.vram} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">CPU</span>
                          <span className="text-zinc-300">{worker.hardware.cpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">RAM</span>
                          <span className="text-zinc-300">{worker.hardware.ram} GB</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                      <h3 className="text-sm font-medium text-zinc-400 mb-3">Supported Models</h3>
                      <div className="flex flex-wrap gap-2">
                        {worker.supportedModels.map((model) => (
                          <span
                            key={model}
                            className="px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-300"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">No reviews yet</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Reviews will appear after completed jobs
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WorkerProfile;
