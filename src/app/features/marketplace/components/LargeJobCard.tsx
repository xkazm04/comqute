"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { formatQubic, formatRelativeTime, formatDuration } from "@/lib/mock-utils";
import type { LargeInferenceJob } from "@/types";

// ============================================================================
// LARGE JOB CARD
// ============================================================================

interface LargeJobCardProps {
  job: LargeInferenceJob;
  onBid: () => void;
  canBid: boolean;
  currentTime?: number;
}

export function LargeJobCard({
  job,
  onBid,
  canBid,
  currentTime,
}: LargeJobCardProps) {
  const timeLeft = useMemo(() => job.deadline - (currentTime ?? Date.now()), [job.deadline, currentTime]);
  const isExpiringSoon = timeLeft < 1800000; // 30 minutes

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
      data-testid={`large-job-card-${job.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TierBadge tier={job.minPoolTier} size="sm" />
            <span className="text-xs text-zinc-500">minimum required</span>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-2">{job.prompt.slice(0, 100)}...</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] ${
            job.status === "open"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {job.status === "open" ? "Open" : `${job.bids.length} bids`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-xs text-zinc-500">Max Budget</p>
          <p className="text-sm font-medium text-emerald-400">{formatQubic(job.maxBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Max Tokens</p>
          <p className="text-sm font-medium text-white">{job.parameters.maxTokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Model</p>
          <p className="text-sm font-medium text-white">{job.modelId}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Deadline</p>
          <p className={`text-sm font-medium ${isExpiringSoon ? "text-red-400" : "text-white"}`}>
            {formatDuration(timeLeft)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500">
          Created {formatRelativeTime(job.createdAt)}
        </span>

        {canBid && job.status !== "assigned" && (
          <button
            onClick={onBid}
            data-testid={`bid-job-${job.id}-btn`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Place Bid
          </button>
        )}
      </div>
    </motion.div>
  );
}
