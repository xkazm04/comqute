"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  CheckCircle,
  Heart,
  Eye,
  Cpu,
  TrendingUp,
  Award,
  Shield,
} from "lucide-react";
import { WorkerProfile, ReputationBadge } from "./WorkerProfile";
import { useReviewStore } from "@/stores";
import { formatDuration } from "@/lib/mock-utils";
import type { Worker } from "@/types";

// ============================================================================
// MINI STAR RATING
// ============================================================================

interface MiniStarRatingProps {
  rating: number;
}

function MiniStarRating({ rating }: MiniStarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" data-testid="mini-star-rating">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-sm font-medium text-white ml-0.5">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// ============================================================================
// WORKER STATUS DOT
// ============================================================================

interface StatusDotProps {
  status: "online" | "busy" | "offline";
}

function StatusDot({ status }: StatusDotProps) {
  const colors = {
    online: "bg-emerald-400",
    busy: "bg-amber-400",
    offline: "bg-zinc-500",
  };

  return (
    <span
      className={`w-2.5 h-2.5 rounded-full ${colors[status]} ${
        status === "online" ? "animate-pulse" : ""
      }`}
      data-testid={`status-dot-${status}`}
    />
  );
}

// ============================================================================
// WORKER LIST CARD
// ============================================================================

interface WorkerListCardProps {
  worker: Worker;
  requesterId?: string;
  requesterAddress?: string;
  onSelect?: (worker: Worker) => void;
  showActions?: boolean;
}

export function WorkerListCard({
  worker,
  requesterId,
  requesterAddress,
  onSelect,
  showActions = true,
}: WorkerListCardProps) {
  const [showProfile, setShowProfile] = useState(false);

  const { getAverageRating, getReviewsByWorker, isWorkerFavorite, toggleFavorite } =
    useReviewStore();

  const avgRating = getAverageRating(worker.id);
  const reviews = getReviewsByWorker(worker.id);
  const isFavorite = requesterId ? isWorkerFavorite(requesterId, worker.id) : false;

  const handleToggleFavorite = () => {
    if (requesterId && requesterAddress) {
      toggleFavorite(requesterId, worker.id, worker.address, worker.name);
    }
  };

  const displayRating = avgRating || worker.stats.avgRating;
  const displayReviewCount = reviews.length || worker.stats.totalReviews;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer"
        onClick={() => onSelect?.(worker)}
        data-testid={`worker-card-${worker.id}`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              {worker.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <StatusDot status={worker.status} />
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-white truncate">{worker.name}</h3>
              <ReputationBadge
                rating={displayRating}
                totalReviews={displayReviewCount}
                completionRate={worker.stats.completionRate}
                size="sm"
              />
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mt-1">
              <MiniStarRating rating={displayRating} />
              <span className="text-xs text-zinc-500">
                ({displayReviewCount} reviews)
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {worker.stats.completionRate}% completion
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                {worker.stats.avgResponseTime > 0
                  ? formatDuration(worker.stats.avgResponseTime)
                  : "—"}{" "}
                avg
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                {worker.stats.jobsCompleted} jobs
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2">
              {requesterId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite
                      ? "bg-red-500/20 text-red-400"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                  data-testid="favorite-worker-btn"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfile(true);
                }}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="view-profile-btn"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Supported Models Preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {worker.supportedModels.slice(0, 3).map((model) => (
            <span
              key={model}
              className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400"
            >
              {model}
            </span>
          ))}
          {worker.supportedModels.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400">
              +{worker.supportedModels.length - 3} more
            </span>
          )}
        </div>
      </motion.div>

      {/* Profile Modal */}
      <WorkerProfile
        worker={worker}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        isFavorite={isFavorite}
        onToggleFavorite={requesterId ? handleToggleFavorite : undefined}
      />
    </>
  );
}

// ============================================================================
// WORKER LIST
// ============================================================================

interface WorkerListProps {
  workers: Worker[];
  requesterId?: string;
  requesterAddress?: string;
  onSelectWorker?: (worker: Worker) => void;
  emptyMessage?: string;
}

export function WorkerList({
  workers,
  requesterId,
  requesterAddress,
  onSelectWorker,
  emptyMessage = "No workers available",
}: WorkerListProps) {
  if (workers.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-worker-list">
        <Cpu className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="worker-list">
      {workers.map((worker) => (
        <WorkerListCard
          key={worker.id}
          worker={worker}
          requesterId={requesterId}
          requesterAddress={requesterAddress}
          onSelect={onSelectWorker}
        />
      ))}
    </div>
  );
}

// ============================================================================
// FAVORITE WORKERS SECTION
// ============================================================================

interface FavoriteWorkersProps {
  workers: Worker[];
  requesterId: string;
  requesterAddress: string;
  onSelectWorker?: (worker: Worker) => void;
}

export function FavoriteWorkers({
  workers,
  requesterId,
  requesterAddress,
  onSelectWorker,
}: FavoriteWorkersProps) {
  const { getFavoriteWorkers } = useReviewStore();
  const favorites = getFavoriteWorkers(requesterId);

  // Filter workers that are favorited
  const favoriteWorkers = workers.filter((w) =>
    favorites.some((f) => f.workerId === w.id)
  );

  if (favoriteWorkers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6" data-testid="favorite-workers-section">
      <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-red-400" />
        Preferred Workers ({favoriteWorkers.length})
      </h3>
      <WorkerList
        workers={favoriteWorkers}
        requesterId={requesterId}
        requesterAddress={requesterAddress}
        onSelectWorker={onSelectWorker}
      />
    </div>
  );
}

export default WorkerListCard;
