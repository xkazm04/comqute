/**
 * JobPipeline Types
 *
 * Unified type definitions for the job lifecycle state machine.
 * Both Requester and Worker dashboards use the same underlying job lifecycle
 * (pending → assigned → running → streaming → complete) but from opposite perspectives.
 */

import type { Job, JobStatus } from "@/types";

// ============================================================================
// JOB LIFECYCLE PHASES
// ============================================================================

/**
 * High-level phases of the job lifecycle.
 * Maps granular statuses into logical phases for UI presentation.
 */
export type JobPhase =
  | "queued"      // pending - waiting for worker
  | "processing"  // assigned, running, streaming - being worked on
  | "terminal";   // complete, failed, cancelled - finished

/**
 * Maps JobStatus to JobPhase
 */
export const STATUS_TO_PHASE: Record<JobStatus, JobPhase> = {
  pending: "queued",
  assigned: "processing",
  running: "processing",
  streaming: "processing",
  complete: "terminal",
  failed: "terminal",
  cancelled: "terminal",
};

// ============================================================================
// ROLE-SPECIFIC VIEWS
// ============================================================================

/**
 * The perspective from which a job is being viewed.
 */
export type JobRole = "requester" | "worker";

/**
 * Requester-focused job view.
 * Emphasizes status visibility, cost, and output.
 */
export interface RequesterJobView {
  id: string;
  phase: JobPhase;
  status: JobStatus;
  prompt: string;
  modelId: string;

  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  waitTime?: number;      // Time from creation to assignment
  processingTime?: number; // Time from assignment to completion

  // Cost
  estimatedCost: number;
  actualCost?: number;

  // Output
  hasOutput: boolean;
  outputPreview: string;
  outputTokens: number;

  // Worker info (when assigned)
  assignedWorker?: string;
  canReview: boolean;
  hasReview: boolean;

  // Actions available
  canCancel: boolean;
  canViewDetails: boolean;
}

/**
 * Worker-focused job view.
 * Emphasizes claim eligibility, processing status, and earnings.
 */
export interface WorkerJobView {
  id: string;
  phase: JobPhase;
  status: JobStatus;
  prompt: string;
  modelId: string;

  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  queueDuration: number;  // How long it's been pending

  // Earnings
  potentialEarnings: number;
  actualEarnings?: number;

  // Processing
  isProcessingByMe: boolean;
  outputProgress: number; // Tokens generated / estimated max

  // Requester info
  requester: string;

  // Actions available
  canClaim: boolean;
  canProcess: boolean;
  isStreaming: boolean;
}

// ============================================================================
// PIPELINE STATE
// ============================================================================

/**
 * Aggregated pipeline statistics from a specific role's perspective.
 */
export interface PipelineStats {
  totalJobs: number;

  // By phase
  queuedCount: number;
  processingCount: number;
  terminalCount: number;

  // By status
  pendingCount: number;
  assignedCount: number;
  runningCount: number;
  streamingCount: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;

  // Timing averages
  avgWaitTime: number;
  avgProcessingTime: number;

  // Financial
  totalEstimatedCost: number;
  totalActualCost: number;
}

/**
 * Requester-specific pipeline state.
 */
export interface RequesterPipelineState {
  role: "requester";
  userId: string;
  jobs: RequesterJobView[];
  stats: PipelineStats;

  // Job groupings for UI
  activeJobs: RequesterJobView[];    // queued + processing
  completedJobs: RequesterJobView[]; // complete only
  historyJobs: RequesterJobView[];   // all terminal

  // Actions
  pendingReviews: RequesterJobView[]; // completed jobs without reviews
}

/**
 * Worker-specific pipeline state.
 */
export interface WorkerPipelineState {
  role: "worker";
  workerId: string;
  jobs: WorkerJobView[];
  stats: PipelineStats;

  // Job groupings for UI
  availableJobs: WorkerJobView[];    // pending jobs claimable
  myActiveJob: WorkerJobView | null; // currently processing
  myCompletedJobs: WorkerJobView[];  // jobs I completed

  // Status
  isOnline: boolean;
  isProcessing: boolean;
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

/**
 * Valid state transitions in the job lifecycle.
 */
export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["running", "failed", "cancelled"],
  running: ["streaming", "complete", "failed"],
  streaming: ["complete", "failed"],
  complete: [], // terminal
  failed: [],   // terminal
  cancelled: [], // terminal
};

/**
 * Transition event types that can occur.
 */
export type TransitionEvent =
  | { type: "CLAIM"; workerId: string }
  | { type: "START_PROCESSING" }
  | { type: "START_STREAMING" }
  | { type: "COMPLETE"; output: string; actualCost: number }
  | { type: "FAIL"; error: string }
  | { type: "CANCEL" };

/**
 * Result of a transition attempt.
 */
export interface TransitionResult {
  success: boolean;
  fromStatus: JobStatus;
  toStatus?: JobStatus;
  error?: string;
  job?: Job;
}

// ============================================================================
// PAIRING VISIBILITY (NEW FEATURE ENABLED BY UNIFICATION)
// ============================================================================

/**
 * Real-time visibility into requester-worker pairing.
 * This feature is only possible because both perspectives share the same state.
 */
export interface JobPairing {
  jobId: string;
  requester: {
    id: string;
    address: string;
    name?: string;
  };
  worker?: {
    id: string;
    address: string;
    name?: string;
    rating?: number;
  };
  status: JobStatus;
  phase: JobPhase;
  createdAt: number;
  pairedAt?: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseJobPipelineReturn {
  // Core state access
  getJob: (jobId: string) => Job | undefined;
  getRequesterView: (job: Job) => RequesterJobView;
  getWorkerView: (job: Job, currentWorkerId?: string) => WorkerJobView;

  // Role-specific state
  getRequesterState: (requesterId: string) => RequesterPipelineState;
  getWorkerState: (workerId: string, isOnline: boolean) => WorkerPipelineState;

  // Transitions
  claimJob: (jobId: string, workerId: string) => TransitionResult;
  startProcessing: (jobId: string) => TransitionResult;
  startStreaming: (jobId: string) => TransitionResult;
  completeJob: (jobId: string, output: string, actualCost: number) => TransitionResult;
  failJob: (jobId: string, error: string) => TransitionResult;
  cancelJob: (jobId: string) => TransitionResult;

  // Pairing visibility
  getPairing: (jobId: string) => JobPairing | undefined;
  getActivePairings: () => JobPairing[];

  // Stats
  getStats: (jobs: Job[]) => PipelineStats;
}
