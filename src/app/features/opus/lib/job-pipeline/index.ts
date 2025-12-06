/**
 * JobPipeline Module
 *
 * A unified abstraction for the job lifecycle state machine.
 * Both Requester and Worker dashboards use the same underlying job lifecycle
 * (pending → assigned → running → streaming → complete) but from opposite perspectives.
 *
 * This module provides:
 * - Type definitions for role-specific views
 * - Utility functions for transforming jobs
 * - Hooks for accessing pipeline state
 * - State transition management with explicit validation
 * - Pairing visibility (requester-worker matching)
 * - Complete state machine documentation and validation utilities
 *
 * ## State Machine
 *
 * See `state-machine.ts` for the complete state machine diagram and documentation.
 * The valid transitions are:
 * - pending → assigned, cancelled
 * - assigned → running, failed, cancelled
 * - running → streaming, complete, failed
 * - streaming → complete, failed
 * - complete, failed, cancelled → (terminal, no transitions)
 *
 * @example
 * ```tsx
 * // In RequesterDashboard
 * import { useRequesterPipeline } from "@/app/features/opus/lib/job-pipeline";
 *
 * function RequesterDashboard() {
 *   const { activeJobs, pendingReviews, cancelJob } = useRequesterPipeline();
 *   // ...
 * }
 *
 * // In WorkerDashboard
 * import { useWorkerPipeline } from "@/app/features/opus/lib/job-pipeline";
 *
 * function WorkerDashboard() {
 *   const { availableJobs, currentJob, claimJob } = useWorkerPipeline();
 *   // ...
 * }
 *
 * // Validating transitions
 * import { validateTransition } from "@/app/features/opus/lib/job-pipeline";
 *
 * const result = validateTransition("streaming", "failed");
 * if (!result.valid) {
 *   console.error(result.message, result.suggestion);
 * }
 * ```
 */

// Types
export type {
  JobPhase,
  JobRole,
  RequesterJobView,
  WorkerJobView,
  PipelineStats,
  RequesterPipelineState,
  WorkerPipelineState,
  TransitionEvent,
  TransitionResult,
  JobPairing,
  UseJobPipelineReturn,
} from "./types";

export { STATUS_TO_PHASE, VALID_TRANSITIONS } from "./types";

// State Machine (explicit state machine with validation)
export type { TransitionValidationResult } from "./state-machine";
export {
  JOB_STATE_MACHINE,
  validateTransition,
  isValidTransition,
  isTerminalStatus,
  getValidTransitionsFrom,
  getTransitionTrigger,
  getStatusDescription,
  TERMINAL_STATES,
  PROCESSING_STATES,
  QUEUED_STATES,
  isTerminal as isTerminalState,
  isActivelyProcessing,
  isQueuedStatus,
  canBeCancelled,
  canBeClaimed,
} from "./state-machine";

// Utilities
export {
  getPhase,
  isTerminal,
  isProcessing,
  isQueued,
  toRequesterView,
  toWorkerView,
  calculateStats,
  canTransition,
  attemptTransition,
  createPairing,
  filterByPhase,
  filterByRequester,
  filterByWorker,
  filterClaimable,
  sortByCreatedAt,
} from "./utils";

// Hooks
export { useJobPipeline } from "./useJobPipeline";
export { useRequesterPipeline } from "./useRequesterPipeline";
export type { UseRequesterPipelineReturn } from "./useRequesterPipeline";
export { useWorkerPipeline } from "./useWorkerPipeline";
export type { UseWorkerPipelineReturn } from "./useWorkerPipeline";
