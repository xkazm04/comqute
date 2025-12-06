"use client";

import { motion } from "framer-motion";
import type { SUPPORTED_MODELS } from "@/lib/models";
import type { Job } from "@/types";

// ============================================================================
// MODEL BAR
// ============================================================================

interface ModelBarProps {
  model: typeof SUPPORTED_MODELS[0];
  jobs: Job[];
  maxJobs: number;
}

export function ModelBar({ model, jobs, maxJobs }: ModelBarProps) {
  const modelJobs = jobs.filter((j) => j.modelId === model.id);
  const completed = modelJobs.filter((j) => j.status === "complete").length;
  const percentage = maxJobs > 0 ? (completed / maxJobs) * 100 : 0;

  return (
    <div className="space-y-2" data-testid={`model-bar-${model.id}`}>
      <div className="flex items-center justify-between">
        <span className="body-default text-zinc-400" data-testid={`model-bar-${model.id}-name`}>{model.displayName}</span>
        <span className="micro text-zinc-500" data-testid={`model-bar-${model.id}-completed`}>{completed} completed</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          data-testid={`model-bar-${model.id}-progress`}
        />
      </div>
    </div>
  );
}
