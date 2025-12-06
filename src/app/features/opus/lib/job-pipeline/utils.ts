/**
 * JobPipeline Utilities
 *
 * Helper functions for transforming jobs into role-specific views
 * and computing pipeline statistics.
 */

import type { Job, JobStatus } from "@/types";
import type {
  JobPhase,
  RequesterJobView,
  WorkerJobView,
  PipelineStats,
  JobPairing,
  TransitionResult,
} from "./types";
import { STATUS_TO_PHASE, VALID_TRANSITIONS } from "./types";

// ============================================================================
// PHASE HELPERS
// ============================================================================

/**
 * Get the phase for a given status.
 */
export function getPhase(status: JobStatus): JobPhase {
  return STATUS_TO_PHASE[status];
}

/**
 * Check if a job is in a terminal state.
 */
export function isTerminal(status: JobStatus): boolean {
  return STATUS_TO_PHASE[status] === "terminal";
}

/**
 * Check if a job is actively being processed.
 */
export function isProcessing(status: JobStatus): boolean {
  return STATUS_TO_PHASE[status] === "processing";
}

/**
 * Check if a job is queued/waiting.
 */
export function isQueued(status: JobStatus): boolean {
  return STATUS_TO_PHASE[status] === "queued";
}

// ============================================================================
// VIEW TRANSFORMERS
// ============================================================================

/**
 * Transform a Job into a RequesterJobView.
 * Provides requester-centric perspective on the job.
 */
export function toRequesterView(job: Job, hasReview: boolean = false): RequesterJobView {
  const phase = getPhase(job.status);
  const now = Date.now();

  // Calculate timing metrics
  const waitTime = job.startedAt
    ? job.startedAt - job.createdAt
    : job.status === "pending"
    ? now - job.createdAt
    : undefined;

  const processingTime =
    job.completedAt && job.startedAt
      ? job.completedAt - job.startedAt
      : job.startedAt && isProcessing(job.status)
      ? now - job.startedAt
      : undefined;

  return {
    id: job.id,
    phase,
    status: job.status,
    prompt: job.prompt,
    modelId: job.modelId,

    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    waitTime,
    processingTime,

    estimatedCost: job.estimatedCost,
    actualCost: job.actualCost,

    hasOutput: job.output.length > 0,
    outputPreview: job.output.slice(0, 100),
    outputTokens: job.outputTokens,

    assignedWorker: job.assignedWorker,
    canReview: job.status === "complete" && !!job.assignedWorker && !hasReview,
    hasReview,

    canCancel: job.status === "pending",
    canViewDetails: true,
  };
}

/**
 * Transform a Job into a WorkerJobView.
 * Provides worker-centric perspective on the job.
 */
export function toWorkerView(job: Job, currentWorkerId?: string): WorkerJobView {
  const phase = getPhase(job.status);
  const now = Date.now();
  const isMyJob = currentWorkerId && job.assignedWorker === currentWorkerId;

  // Calculate queue duration
  const queueDuration = job.startedAt
    ? job.startedAt - job.createdAt
    : now - job.createdAt;

  // Estimate output progress (tokens generated vs max tokens parameter)
  const maxTokens = job.parameters?.maxTokens || 500;
  const outputProgress = Math.min((job.outputTokens / maxTokens) * 100, 100);

  return {
    id: job.id,
    phase,
    status: job.status,
    prompt: job.prompt,
    modelId: job.modelId,

    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    queueDuration,

    potentialEarnings: job.estimatedCost,
    actualEarnings: isMyJob ? job.actualCost : undefined,

    isProcessingByMe: !!isMyJob && isProcessing(job.status),
    outputProgress,

    requester: job.requester,

    canClaim: job.status === "pending",
    canProcess: job.status === "assigned" && !!isMyJob,
    isStreaming: job.status === "streaming" && !!isMyJob,
  };
}

// ============================================================================
// STATISTICS CALCULATOR
// ============================================================================

/**
 * Calculate comprehensive pipeline statistics from a set of jobs.
 */
export function calculateStats(jobs: Job[]): PipelineStats {
  const initial: PipelineStats = {
    totalJobs: jobs.length,
    queuedCount: 0,
    processingCount: 0,
    terminalCount: 0,
    pendingCount: 0,
    assignedCount: 0,
    runningCount: 0,
    streamingCount: 0,
    completedCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    avgWaitTime: 0,
    avgProcessingTime: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
  };

  if (jobs.length === 0) return initial;

  let totalWaitTime = 0;
  let waitTimeCount = 0;
  let totalProcessingTime = 0;
  let processingTimeCount = 0;

  const stats = jobs.reduce((acc, job) => {
    // Phase counts
    const phase = getPhase(job.status);
    if (phase === "queued") acc.queuedCount++;
    else if (phase === "processing") acc.processingCount++;
    else acc.terminalCount++;

    // Status counts
    switch (job.status) {
      case "pending":
        acc.pendingCount++;
        break;
      case "assigned":
        acc.assignedCount++;
        break;
      case "running":
        acc.runningCount++;
        break;
      case "streaming":
        acc.streamingCount++;
        break;
      case "complete":
        acc.completedCount++;
        break;
      case "failed":
        acc.failedCount++;
        break;
      case "cancelled":
        acc.cancelledCount++;
        break;
    }

    // Timing
    if (job.startedAt) {
      totalWaitTime += job.startedAt - job.createdAt;
      waitTimeCount++;
    }
    if (job.completedAt && job.startedAt) {
      totalProcessingTime += job.completedAt - job.startedAt;
      processingTimeCount++;
    }

    // Costs
    acc.totalEstimatedCost += job.estimatedCost;
    acc.totalActualCost += job.actualCost || 0;

    return acc;
  }, initial);

  // Calculate averages
  stats.avgWaitTime = waitTimeCount > 0 ? totalWaitTime / waitTimeCount : 0;
  stats.avgProcessingTime = processingTimeCount > 0 ? totalProcessingTime / processingTimeCount : 0;

  return stats;
}

// ============================================================================
// TRANSITION VALIDATORS
// ============================================================================

import {
  validateTransition,
  isValidTransition,
} from "./state-machine";

/**
 * Check if a status transition is valid.
 * @deprecated Use isValidTransition or validateTransition from state-machine for more details
 */
export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return isValidTransition(from, to);
}

/**
 * Attempt to transition a job to a new status.
 * Returns a result indicating success or failure.
 *
 * Uses the state machine validation for comprehensive error messages.
 */
export function attemptTransition(
  job: Job,
  toStatus: JobStatus,
  updates: Partial<Job> = {}
): TransitionResult {
  const validation = validateTransition(job.status, toStatus);

  if (!validation.valid) {
    return {
      success: false,
      fromStatus: job.status,
      error: `${validation.message}. ${validation.suggestion || ""}`.trim(),
    };
  }

  const updatedJob: Job = {
    ...job,
    ...updates,
    status: toStatus,
  };

  return {
    success: true,
    fromStatus: job.status,
    toStatus,
    job: updatedJob,
  };
}

// ============================================================================
// PAIRING HELPERS
// ============================================================================

/**
 * Create a JobPairing object from a job.
 */
export function createPairing(
  job: Job,
  workerInfo?: { id: string; address: string; name?: string; rating?: number }
): JobPairing {
  return {
    jobId: job.id,
    requester: {
      id: job.requester,
      address: job.requester,
    },
    worker: workerInfo,
    status: job.status,
    phase: getPhase(job.status),
    createdAt: job.createdAt,
    pairedAt: job.startedAt,
  };
}

// ============================================================================
// JOB FILTERS
// ============================================================================

/**
 * Filter jobs by phase.
 */
export function filterByPhase(jobs: Job[], phase: JobPhase): Job[] {
  return jobs.filter((job) => getPhase(job.status) === phase);
}

/**
 * Filter jobs by requester.
 */
export function filterByRequester(jobs: Job[], requesterId: string): Job[] {
  return jobs.filter((job) => job.requester === requesterId);
}

/**
 * Filter jobs by assigned worker.
 */
export function filterByWorker(jobs: Job[], workerId: string): Job[] {
  return jobs.filter((job) => job.assignedWorker === workerId);
}

/**
 * Filter jobs that are claimable by workers.
 */
export function filterClaimable(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.status === "pending");
}

/**
 * Sort jobs by creation time (newest first).
 */
export function sortByCreatedAt(jobs: Job[], ascending: boolean = false): Job[] {
  return [...jobs].sort((a, b) =>
    ascending ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
  );
}
