"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JobStatusIndicator } from "../../opus/shared";
import { getModelById } from "@/lib/models";
import { formatQubic, formatRelativeTime } from "@/lib/mock-utils";
import type { Job } from "@/types";

// ============================================================================
// LIVE JOB ROW
// ============================================================================

interface LiveJobRowProps {
  job: Job;
}

export function LiveJobRow({ job }: LiveJobRowProps) {
  return (
    <Link href={`/app/job/${job.id}`} data-testid={`live-job-row-${job.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all group cursor-pointer"
      >
        <JobStatusIndicator status={job.status} variant="dot" />
        <div className="flex-1 min-w-0">
          <p className="body-default text-zinc-300 truncate">
            {job.prompt.slice(0, 40)}{job.prompt.length > 40 ? "..." : ""}
          </p>
        </div>
        <span className="micro text-zinc-500 hidden sm:block">
          {getModelById(job.modelId)?.displayName}
        </span>
        <span className="micro text-zinc-500">{formatRelativeTime(job.createdAt)}</span>
        {job.actualCost && (
          <span className="micro text-emerald-400">{formatQubic(job.actualCost)}</span>
        )}
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </motion.div>
    </Link>
  );
}
