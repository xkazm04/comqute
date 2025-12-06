"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap } from "lucide-react";
import { LiveJobRow } from "./LiveJobRow";
import { GlassCard, EmptyStateIllustration } from "../../opus/shared";
import type { Job } from "@/types";

// ============================================================================
// LIVE ACTIVITY CARD
// ============================================================================

interface LiveActivityCardProps {
  jobs: Job[];
}

export function LiveActivityCard({ jobs }: LiveActivityCardProps) {
  return (
    <GlassCard data-testid="live-activity-card">
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <h3 className="heading-tertiary text-white flex items-center gap-[var(--space-2)]">
          <Activity className="w-4 h-4 text-cyan-400" />
          Live Activity
        </h3>
        <motion.div
          className="w-2 h-2 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {jobs.length === 0 ? (
        <EmptyStateIllustration
          variant="radar"
          title="No recent activity"
          description="The network is ready and waiting. Submit your first job to see real-time activity flow through the distributed compute network."
          ctaLabel="Submit Your First Job"
          ctaHref="/opus"
          ctaIcon={Zap}
          data-testid="network-empty-state"
        />
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {jobs.slice(0, 8).map((job) => (
              <LiveJobRow key={job.id} job={job} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  );
}
