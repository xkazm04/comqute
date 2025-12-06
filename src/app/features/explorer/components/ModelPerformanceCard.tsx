"use client";

import { Cpu } from "lucide-react";
import { ModelBar } from "./ModelBar";
import { GlassCard } from "../../opus/shared";
import { SUPPORTED_MODELS } from "@/lib/models";
import type { Job } from "@/types";

// ============================================================================
// MODEL PERFORMANCE CARD
// ============================================================================

interface ModelPerformanceCardProps {
  jobs: Job[];
  maxJobsPerModel: number;
}

export function ModelPerformanceCard({ jobs, maxJobsPerModel }: ModelPerformanceCardProps) {
  return (
    <GlassCard>
      <h3 className="heading-tertiary text-white mb-[var(--space-4)] flex items-center gap-[var(--space-2)]">
        <Cpu className="w-4 h-4 text-purple-400" />
        Model Performance
      </h3>
      <div className="space-y-[var(--space-4)]">
        {SUPPORTED_MODELS.map((model) => (
          <ModelBar key={model.id} model={model} jobs={jobs} maxJobs={maxJobsPerModel} />
        ))}
      </div>
    </GlassCard>
  );
}
