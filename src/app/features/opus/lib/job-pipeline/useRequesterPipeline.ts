/**
 * useRequesterPipeline Hook
 *
 * Convenience hook for Requester-focused access to the job pipeline.
 * Provides pre-computed requester state and actions.
 */

import { useMemo } from "react";
import { useWalletStore } from "@/stores";
import { useJobPipeline } from "./useJobPipeline";
import type { RequesterPipelineState, RequesterJobView } from "./types";

export interface UseRequesterPipelineReturn {
  // State
  state: RequesterPipelineState | null;
  isConnected: boolean;
  requesterId: string;

  // Computed views
  activeJobs: RequesterJobView[];
  completedJobs: RequesterJobView[];
  pendingReviews: RequesterJobView[];

  // Stats shortcuts
  totalJobs: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;

  // Actions
  cancelJob: (jobId: string) => { success: boolean; error?: string };

  // View helpers
  getJobView: (jobId: string) => RequesterJobView | undefined;
}

/**
 * Hook for requester-specific pipeline access.
 *
 * Usage:
 * ```tsx
 * function RequesterDashboard() {
 *   const { state, activeJobs, pendingReviews, cancelJob } = useRequesterPipeline();
 *
 *   return (
 *     <div>
 *       <h2>Active Jobs ({activeJobs.length})</h2>
 *       {activeJobs.map(job => (
 *         <JobCard key={job.id} job={job} onCancel={() => cancelJob(job.id)} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRequesterPipeline(): UseRequesterPipelineReturn {
  const { wallet } = useWalletStore();
  const pipeline = useJobPipeline();

  // Derive requester ID from wallet
  const requesterId = wallet.isConnected ? `req-${wallet.address.slice(0, 8)}` : "";

  // Get full requester state
  const state = useMemo(() => {
    if (!wallet.isConnected || !requesterId) return null;
    return pipeline.getRequesterState(requesterId);
  }, [wallet.isConnected, requesterId, pipeline]);

  // Extract commonly used values
  const activeJobs = state?.activeJobs ?? [];
  const completedJobs = state?.completedJobs ?? [];
  const pendingReviews = state?.pendingReviews ?? [];

  // Stats shortcuts
  const totalJobs = state?.stats.totalJobs ?? 0;
  const pendingCount = state?.stats.pendingCount ?? 0;
  const processingCount = state?.stats.processingCount ?? 0;
  const completedCount = state?.stats.completedCount ?? 0;

  // Actions
  const cancelJob = (jobId: string) => {
    const result = pipeline.cancelJob(jobId);
    return { success: result.success, error: result.error };
  };

  // View helper
  const getJobView = (jobId: string): RequesterJobView | undefined => {
    const job = pipeline.getJob(jobId);
    if (!job) return undefined;
    return pipeline.getRequesterView(job);
  };

  return {
    state,
    isConnected: wallet.isConnected,
    requesterId,
    activeJobs,
    completedJobs,
    pendingReviews,
    totalJobs,
    pendingCount,
    processingCount,
    completedCount,
    cancelJob,
    getJobView,
  };
}
