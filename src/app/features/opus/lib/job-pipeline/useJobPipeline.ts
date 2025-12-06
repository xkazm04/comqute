/**
 * useJobPipeline Hook
 *
 * A unified hook for accessing the job pipeline state machine.
 * Provides role-specific views and state transitions for both
 * Requester and Worker perspectives.
 */

import { useCallback, useMemo } from "react";
import { useJobStore, useReviewStore } from "@/stores";
import type { Job, JobStatus } from "@/types";
import type {
  RequesterJobView,
  WorkerJobView,
  RequesterPipelineState,
  WorkerPipelineState,
  PipelineStats,
  JobPairing,
  TransitionResult,
  UseJobPipelineReturn,
} from "./types";
import {
  toRequesterView,
  toWorkerView,
  calculateStats,
  attemptTransition,
  createPairing,
  filterByRequester,
  filterByWorker,
  filterClaimable,
  filterByPhase,
  sortByCreatedAt,
  getPhase,
  isProcessing,
} from "./utils";

/**
 * Main hook for accessing the JobPipeline abstraction.
 *
 * This hook provides a unified interface for both Requester and Worker
 * perspectives on the job lifecycle, enabling:
 * - Role-specific job views
 * - Consistent state transitions
 * - Real-time pairing visibility
 * - Shared statistics computation
 */
export function useJobPipeline(): UseJobPipelineReturn {
  const { jobs, getJob, updateJob, cancelJob: storeCancelJob } = useJobStore();
  const { getReviewForJob } = useReviewStore();

  // ============================================================================
  // CORE STATE ACCESS
  // ============================================================================

  /**
   * Get raw job by ID.
   */
  const getJobById = useCallback(
    (jobId: string): Job | undefined => {
      return getJob(jobId);
    },
    [getJob]
  );

  /**
   * Transform a job into a requester view.
   */
  const getRequesterView = useCallback(
    (job: Job): RequesterJobView => {
      const review = getReviewForJob(job.id);
      return toRequesterView(job, !!review);
    },
    [getReviewForJob]
  );

  /**
   * Transform a job into a worker view.
   */
  const getWorkerView = useCallback(
    (job: Job, currentWorkerId?: string): WorkerJobView => {
      return toWorkerView(job, currentWorkerId);
    },
    []
  );

  // ============================================================================
  // ROLE-SPECIFIC STATE
  // ============================================================================

  /**
   * Get complete requester pipeline state.
   */
  const getRequesterState = useCallback(
    (requesterId: string): RequesterPipelineState => {
      const myJobs = filterByRequester(jobs, requesterId);
      const sortedJobs = sortByCreatedAt(myJobs);
      const jobViews = sortedJobs.map((job) => getRequesterView(job));

      const stats = calculateStats(myJobs);

      // Group jobs for UI
      const activeJobs = jobViews.filter(
        (j) => j.phase === "queued" || j.phase === "processing"
      );
      const completedJobs = jobViews.filter((j) => j.status === "complete");
      const historyJobs = jobViews.filter((j) => j.phase === "terminal");
      const pendingReviews = jobViews.filter((j) => j.canReview);

      return {
        role: "requester",
        userId: requesterId,
        jobs: jobViews,
        stats,
        activeJobs,
        completedJobs,
        historyJobs,
        pendingReviews,
      };
    },
    [jobs, getRequesterView]
  );

  /**
   * Get complete worker pipeline state.
   */
  const getWorkerState = useCallback(
    (workerId: string, isOnline: boolean): WorkerPipelineState => {
      // Get all claimable jobs
      const claimableJobs = filterClaimable(jobs);
      const availableJobViews = sortByCreatedAt(claimableJobs).map((job) =>
        getWorkerView(job, workerId)
      );

      // Get my assigned jobs
      const myJobs = filterByWorker(jobs, workerId);
      const myActiveJob = myJobs.find((j) => isProcessing(j.status));
      const myCompletedJobs = filterByPhase(myJobs, "terminal").map((job) =>
        getWorkerView(job, workerId)
      );

      // Calculate stats from my completed jobs
      const stats = calculateStats(myJobs);

      return {
        role: "worker",
        workerId,
        jobs: availableJobViews,
        stats,
        availableJobs: availableJobViews,
        myActiveJob: myActiveJob ? getWorkerView(myActiveJob, workerId) : null,
        myCompletedJobs: sortByCreatedAt(
          myJobs.filter((j) => j.status === "complete")
        ).map((job) => getWorkerView(job, workerId)),
        isOnline,
        isProcessing: !!myActiveJob,
      };
    },
    [jobs, getWorkerView]
  );

  // ============================================================================
  // STATE TRANSITIONS
  // ============================================================================

  /**
   * Claim a job as a worker.
   */
  const claimJob = useCallback(
    (jobId: string, workerId: string): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "pending" as JobStatus,
          error: "Job not found",
        };
      }

      const result = attemptTransition(job, "assigned", {
        assignedWorker: workerId,
        startedAt: Date.now(),
      });

      if (result.success && result.job) {
        updateJob(jobId, {
          status: result.job.status,
          assignedWorker: result.job.assignedWorker,
          startedAt: result.job.startedAt,
        });
      }

      return result;
    },
    [getJob, updateJob]
  );

  /**
   * Start processing a claimed job.
   */
  const startProcessing = useCallback(
    (jobId: string): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "assigned" as JobStatus,
          error: "Job not found",
        };
      }

      const result = attemptTransition(job, "running");

      if (result.success && result.job) {
        updateJob(jobId, { status: result.job.status });
      }

      return result;
    },
    [getJob, updateJob]
  );

  /**
   * Start streaming output for a job.
   */
  const startStreaming = useCallback(
    (jobId: string): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "running" as JobStatus,
          error: "Job not found",
        };
      }

      const result = attemptTransition(job, "streaming");

      if (result.success && result.job) {
        updateJob(jobId, { status: result.job.status });
      }

      return result;
    },
    [getJob, updateJob]
  );

  /**
   * Complete a job with output and final cost.
   */
  const completeJob = useCallback(
    (jobId: string, output: string, actualCost: number): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "streaming" as JobStatus,
          error: "Job not found",
        };
      }

      const result = attemptTransition(job, "complete", {
        output,
        actualCost,
        completedAt: Date.now(),
      });

      if (result.success && result.job) {
        updateJob(jobId, {
          status: result.job.status,
          output: result.job.output,
          actualCost: result.job.actualCost,
          completedAt: result.job.completedAt,
        });
      }

      return result;
    },
    [getJob, updateJob]
  );

  /**
   * Mark a job as failed.
   */
  const failJob = useCallback(
    (jobId: string, error: string): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "running" as JobStatus,
          error: "Job not found",
        };
      }

      // Can fail from assigned, running, or streaming
      const result = attemptTransition(job, "failed", {
        error,
        completedAt: Date.now(),
      });

      if (result.success && result.job) {
        updateJob(jobId, {
          status: result.job.status,
          error: result.job.error,
          completedAt: result.job.completedAt,
        });
      }

      return result;
    },
    [getJob, updateJob]
  );

  /**
   * Cancel a pending job.
   */
  const cancelJob = useCallback(
    (jobId: string): TransitionResult => {
      const job = getJob(jobId);
      if (!job) {
        return {
          success: false,
          fromStatus: "pending" as JobStatus,
          error: "Job not found",
        };
      }

      const result = attemptTransition(job, "cancelled", {
        completedAt: Date.now(),
      });

      if (result.success) {
        storeCancelJob(jobId);
      }

      return result;
    },
    [getJob, storeCancelJob]
  );

  // ============================================================================
  // PAIRING VISIBILITY
  // ============================================================================

  /**
   * Get pairing information for a specific job.
   */
  const getPairing = useCallback(
    (jobId: string): JobPairing | undefined => {
      const job = getJob(jobId);
      if (!job) return undefined;

      // In a real implementation, we'd lookup worker details from a worker store
      const workerInfo = job.assignedWorker
        ? {
            id: job.assignedWorker,
            address: job.assignedWorker,
          }
        : undefined;

      return createPairing(job, workerInfo);
    },
    [getJob]
  );

  /**
   * Get all active pairings (jobs with assigned workers that aren't terminal).
   */
  const getActivePairings = useCallback((): JobPairing[] => {
    return jobs
      .filter((job) => job.assignedWorker && getPhase(job.status) !== "terminal")
      .map((job) =>
        createPairing(job, {
          id: job.assignedWorker!,
          address: job.assignedWorker!,
        })
      );
  }, [jobs]);

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Calculate statistics for a set of jobs.
   */
  const getStats = useCallback((jobList: Job[]): PipelineStats => {
    return calculateStats(jobList);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return useMemo(
    () => ({
      getJob: getJobById,
      getRequesterView,
      getWorkerView,
      getRequesterState,
      getWorkerState,
      claimJob,
      startProcessing,
      startStreaming,
      completeJob,
      failJob,
      cancelJob,
      getPairing,
      getActivePairings,
      getStats,
    }),
    [
      getJobById,
      getRequesterView,
      getWorkerView,
      getRequesterState,
      getWorkerState,
      claimJob,
      startProcessing,
      startStreaming,
      completeJob,
      failJob,
      cancelJob,
      getPairing,
      getActivePairings,
      getStats,
    ]
  );
}
