"use client";

import { motion } from "framer-motion";
import type { Job } from "@/types";

// ============================================================================
// JOB DISTRIBUTION BAR
// ============================================================================

interface JobDistributionBarProps {
  jobs: Job[];
}

export function JobDistributionBar({ jobs }: JobDistributionBarProps) {
  const statusCounts = {
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => ["assigned", "running", "streaming"].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === "complete").length,
    failed: jobs.filter((j) => j.status === "failed" || j.status === "cancelled").length,
  };

  const total = jobs.length || 1;

  return (
    <div className="space-y-3">
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
        {statusCounts.completed > 0 && (
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.completed / total) * 100}%` }}
          />
        )}
        {statusCounts.processing > 0 && (
          <motion.div
            className="h-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.processing / total) * 100}%` }}
          />
        )}
        {statusCounts.pending > 0 && (
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.pending / total) * 100}%` }}
          />
        )}
        {statusCounts.failed > 0 && (
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.failed / total) * 100}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between micro">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-500">{statusCounts.completed} complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="text-zinc-500">{statusCounts.processing} processing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-zinc-500">{statusCounts.pending} pending</span>
        </div>
      </div>
    </div>
  );
}
