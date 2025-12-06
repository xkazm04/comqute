/**
 * useWorkerPipeline Hook
 *
 * Convenience hook for Worker-focused access to the job pipeline.
 * Provides pre-computed worker state and actions.
 */

import { useMemo, useCallback } from "react";
import { useWorkerStore } from "@/stores";
import { useJobPipeline } from "./useJobPipeline";
import type { WorkerPipelineState, WorkerJobView, TransitionResult } from "./types";

export interface UseWorkerPipelineReturn {
  // State
  state: WorkerPipelineState | null;
  isOnline: boolean;
  workerId: string;

  // Computed views
  availableJobs: WorkerJobView[];
  currentJob: WorkerJobView | null;
  myCompletedJobs: WorkerJobView[];

  // Stats shortcuts
  totalCompleted: number;
  totalEarnings: number;
  avgProcessingTime: number;

  // Actions
  claimJob: (jobId: string) => TransitionResult;
  startProcessing: (jobId: string) => TransitionResult;
  startStreaming: (jobId: string) => TransitionResult;
  completeJob: (jobId: string, output: string, actualCost: number) => TransitionResult;
  failJob: (jobId: string, error: string) => TransitionResult;

  // View helpers
  getJobView: (jobId: string) => WorkerJobView | undefined;

  // Pairing visibility
  getActivePairings: () => Array<{
    jobId: string;
    requester: { id: string; address: string };
    status: string;
  }>;
}

/**
 * Hook for worker-specific pipeline access.
 *
 * Usage:
 * ```tsx
 * function WorkerDashboard() {
 *   const { state, availableJobs, currentJob, claimJob } = useWorkerPipeline();
 *
 *   return (
 *     <div>
 *       {currentJob ? (
 *         <ProcessingCard job={currentJob} />
 *       ) : (
 *         <div>
 *           <h2>Available Jobs ({availableJobs.length})</h2>
 *           {availableJobs.map(job => (
 *             <JobCard
 *               key={job.id}
 *               job={job}
 *               onClaim={() => claimJob(job.id)}
 *             />
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkerPipeline(): UseWorkerPipelineReturn {
  const { worker } = useWorkerStore();
  const pipeline = useJobPipeline();

  // Derive worker state
  const workerId = worker?.id ?? "";
  const isOnline = worker?.status !== "offline";

  // Get full worker state
  const state = useMemo(() => {
    if (!worker || !workerId) return null;
    return pipeline.getWorkerState(workerId, isOnline);
  }, [worker, workerId, isOnline, pipeline]);

  // Extract commonly used values
  const availableJobs = state?.availableJobs ?? [];
  const currentJob = state?.myActiveJob ?? null;
  const myCompletedJobs = state?.myCompletedJobs ?? [];

  // Stats shortcuts
  const totalCompleted = state?.stats.completedCount ?? 0;
  const totalEarnings = state?.stats.totalActualCost ?? 0;
  const avgProcessingTime = state?.stats.avgProcessingTime ?? 0;

  // Actions with worker ID pre-bound
  const claimJob = useCallback(
    (jobId: string): TransitionResult => {
      if (!workerId) {
        return {
          success: false,
          fromStatus: "pending",
          error: "Worker not initialized",
        };
      }
      return pipeline.claimJob(jobId, workerId);
    },
    [workerId, pipeline]
  );

  const startProcessing = useCallback(
    (jobId: string): TransitionResult => {
      return pipeline.startProcessing(jobId);
    },
    [pipeline]
  );

  const startStreaming = useCallback(
    (jobId: string): TransitionResult => {
      return pipeline.startStreaming(jobId);
    },
    [pipeline]
  );

  const completeJob = useCallback(
    (jobId: string, output: string, actualCost: number): TransitionResult => {
      return pipeline.completeJob(jobId, output, actualCost);
    },
    [pipeline]
  );

  const failJob = useCallback(
    (jobId: string, error: string): TransitionResult => {
      return pipeline.failJob(jobId, error);
    },
    [pipeline]
  );

  // View helper
  const getJobView = useCallback(
    (jobId: string): WorkerJobView | undefined => {
      const job = pipeline.getJob(jobId);
      if (!job) return undefined;
      return pipeline.getWorkerView(job, workerId);
    },
    [pipeline, workerId]
  );

  // Pairing visibility
  const getActivePairings = useCallback(() => {
    return pipeline.getActivePairings().map((p) => ({
      jobId: p.jobId,
      requester: p.requester,
      status: p.status,
    }));
  }, [pipeline]);

  return {
    state,
    isOnline,
    workerId,
    availableJobs,
    currentJob,
    myCompletedJobs,
    totalCompleted,
    totalEarnings,
    avgProcessingTime,
    claimJob,
    startProcessing,
    startStreaming,
    completeJob,
    failJob,
    getJobView,
    getActivePairings,
  };
}
