/**
 * JobStatus State Machine
 *
 * Explicit definition of the JobStatus state machine with:
 * - All valid transitions documented
 * - Transition validation utility
 * - State machine diagram (ASCII)
 * - Descriptive error messages
 *
 * @module job-pipeline/state-machine
 *
 * ## State Machine Diagram
 *
 * ```
 *                                   +-------------+
 *                                   |   PENDING   |
 *                                   | (Initial)   |
 *                                   +------+------+
 *                                          |
 *                          +---------------+---------------+
 *                          |                               |
 *                          v                               v
 *                   +-----------+                   +-------------+
 *                   |  ASSIGNED |                   |  CANCELLED  |
 *                   +-----------+                   | (Terminal)  |
 *                          |                        +-------------+
 *              +-----------+-----------+
 *              |                       |
 *              v                       v
 *        +-----------+          +-------------+
 *        |  RUNNING  |          |   FAILED    |
 *        +-----------+          | (Terminal)  |
 *              |                +-------------+
 *              |                       ^
 *              v                       |
 *        +-----------+                 |
 *        | STREAMING |-----------------+
 *        +-----------+
 *              |
 *              +------------------+
 *              |                  |
 *              v                  v
 *        +-----------+     +-------------+
 *        | COMPLETE  |     |   FAILED    |
 *        | (Terminal)|     | (Terminal)  |
 *        +-----------+     +-------------+
 * ```
 *
 * ## State Descriptions
 *
 * - **PENDING**: Initial state. Job is in queue waiting for a worker to claim it.
 *   - Entry: Job created by requester
 *   - Valid exits: ASSIGNED (worker claims), CANCELLED (requester cancels)
 *
 * - **ASSIGNED**: Job has been claimed by a worker but processing hasn't started.
 *   - Entry: Worker claims job from PENDING
 *   - Valid exits: RUNNING (processing starts), FAILED (claim fails), CANCELLED (requester cancels)
 *
 * - **RUNNING**: Worker is actively processing the job (loading model, preparing).
 *   - Entry: Worker starts processing from ASSIGNED
 *   - Valid exits: STREAMING (output begins), COMPLETE (fast completion), FAILED (processing error)
 *
 * - **STREAMING**: Model is generating output tokens in real-time.
 *   - Entry: First token generated from RUNNING
 *   - Valid exits: COMPLETE (generation done), FAILED (generation error)
 *
 * - **COMPLETE**: Job finished successfully (Terminal state).
 *   - Entry: Output generation completed
 *   - No valid exits (terminal)
 *
 * - **FAILED**: Job encountered an error at any point (Terminal state).
 *   - Entry: Error from ASSIGNED, RUNNING, or STREAMING
 *   - No valid exits (terminal)
 *
 * - **CANCELLED**: Job was cancelled by the requester (Terminal state).
 *   - Entry: Cancellation from PENDING or ASSIGNED
 *   - No valid exits (terminal)
 *
 * ## Retry Policy
 *
 * Jobs in terminal states (COMPLETE, FAILED, CANCELLED) cannot transition to any other state.
 * To retry a failed or cancelled job, a new job must be created. This ensures:
 * - Immutable job history for auditing
 * - Clear separation between job attempts
 * - Proper escrow handling for each attempt
 */

import type { JobStatus } from "@/types";

// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================

/**
 * Complete transition map with metadata about each transition.
 * Each key is a source state, containing valid target states and transition descriptions.
 */
export const JOB_STATE_MACHINE: Record<
  JobStatus,
  {
    isTerminal: boolean;
    description: string;
    transitions: Array<{
      to: JobStatus;
      trigger: string;
      description: string;
    }>;
  }
> = {
  pending: {
    isTerminal: false,
    description: "Job is queued waiting for a worker to claim it",
    transitions: [
      {
        to: "assigned",
        trigger: "CLAIM",
        description: "Worker claims the job from the queue",
      },
      {
        to: "cancelled",
        trigger: "CANCEL",
        description: "Requester cancels the job before assignment",
      },
    ],
  },

  assigned: {
    isTerminal: false,
    description: "Job claimed by worker, awaiting processing start",
    transitions: [
      {
        to: "running",
        trigger: "START_PROCESSING",
        description: "Worker begins processing the job",
      },
      {
        to: "failed",
        trigger: "FAIL",
        description: "Job claim or initialization fails",
      },
      {
        to: "cancelled",
        trigger: "CANCEL",
        description: "Requester cancels before processing starts",
      },
    ],
  },

  running: {
    isTerminal: false,
    description: "Worker is actively processing (model loaded, generating)",
    transitions: [
      {
        to: "streaming",
        trigger: "START_STREAMING",
        description: "First output token generated, streaming begins",
      },
      {
        to: "complete",
        trigger: "COMPLETE",
        description: "Processing completes without streaming phase",
      },
      {
        to: "failed",
        trigger: "FAIL",
        description: "Processing error (model crash, timeout, etc.)",
      },
    ],
  },

  streaming: {
    isTerminal: false,
    description: "Output tokens are being generated and streamed to requester",
    transitions: [
      {
        to: "complete",
        trigger: "COMPLETE",
        description: "All output tokens generated successfully",
      },
      {
        to: "failed",
        trigger: "FAIL",
        description: "Streaming error (network failure, model error)",
      },
    ],
  },

  complete: {
    isTerminal: true,
    description: "Job completed successfully - output delivered to requester",
    transitions: [],
  },

  failed: {
    isTerminal: true,
    description: "Job failed due to an error - funds may be refunded",
    transitions: [],
  },

  cancelled: {
    isTerminal: true,
    description: "Job cancelled by requester - escrowed funds refunded",
    transitions: [],
  },
};

// ============================================================================
// TRANSITION VALIDATION
// ============================================================================

/**
 * Result of a transition validation check.
 */
export interface TransitionValidationResult {
  /** Whether the transition is valid */
  valid: boolean;
  /** Source status */
  from: JobStatus;
  /** Target status */
  to: JobStatus;
  /** Human-readable message explaining the result */
  message: string;
  /** Trigger name if valid, undefined otherwise */
  trigger?: string;
  /** Suggestion for how to proceed if invalid */
  suggestion?: string;
}

/**
 * Validates whether a transition from one status to another is allowed.
 *
 * @param from - Current job status
 * @param to - Desired target status
 * @returns Detailed validation result with explanation
 *
 * @example
 * ```typescript
 * const result = validateTransition("pending", "assigned");
 * if (result.valid) {
 *   console.log(`Valid transition: ${result.message}`);
 * } else {
 *   console.error(`Invalid: ${result.message}. ${result.suggestion}`);
 * }
 * ```
 */
export function validateTransition(
  from: JobStatus,
  to: JobStatus
): TransitionValidationResult {
  // Same-state check
  if (from === to) {
    return {
      valid: false,
      from,
      to,
      message: `Job is already in '${from}' status`,
      suggestion: "No action required - job is already in the target state",
    };
  }

  const sourceState = JOB_STATE_MACHINE[from];
  const targetState = JOB_STATE_MACHINE[to];

  // Check if source state is terminal
  if (sourceState.isTerminal) {
    return {
      valid: false,
      from,
      to,
      message: `Cannot transition from terminal state '${from}' to '${to}'`,
      suggestion:
        from === "failed"
          ? "Create a new job to retry the operation"
          : from === "cancelled"
          ? "Create a new job - cancelled jobs cannot be reactivated"
          : "Job is complete - no further transitions possible",
    };
  }

  // Find the transition
  const transition = sourceState.transitions.find((t) => t.to === to);

  if (!transition) {
    // Get valid transitions for helpful error message
    const validTargets = sourceState.transitions.map((t) => t.to);
    const validList =
      validTargets.length > 0
        ? validTargets.join(", ")
        : "none (this should not happen)";

    return {
      valid: false,
      from,
      to,
      message: `Invalid transition from '${from}' to '${to}'`,
      suggestion: `Valid transitions from '${from}': ${validList}`,
    };
  }

  return {
    valid: true,
    from,
    to,
    message: transition.description,
    trigger: transition.trigger,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Simple boolean check for transition validity.
 * Use validateTransition() for detailed information.
 *
 * @param from - Current job status
 * @param to - Desired target status
 * @returns true if the transition is valid
 */
export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  return validateTransition(from, to).valid;
}

/**
 * Check if a status is a terminal state.
 *
 * @param status - Job status to check
 * @returns true if the status is terminal (complete, failed, or cancelled)
 */
export function isTerminalStatus(status: JobStatus): boolean {
  return JOB_STATE_MACHINE[status].isTerminal;
}

/**
 * Get all valid target statuses from a given source status.
 *
 * @param from - Source job status
 * @returns Array of valid target statuses
 */
export function getValidTransitionsFrom(from: JobStatus): JobStatus[] {
  return JOB_STATE_MACHINE[from].transitions.map((t) => t.to);
}

/**
 * Get the trigger name for a specific transition.
 *
 * @param from - Source status
 * @param to - Target status
 * @returns Trigger name or undefined if transition is invalid
 */
export function getTransitionTrigger(
  from: JobStatus,
  to: JobStatus
): string | undefined {
  const result = validateTransition(from, to);
  return result.trigger;
}

/**
 * Get human-readable description of a status.
 *
 * @param status - Job status
 * @returns Description of the status
 */
export function getStatusDescription(status: JobStatus): string {
  return JOB_STATE_MACHINE[status].description;
}

/**
 * All terminal states.
 */
export const TERMINAL_STATES: readonly JobStatus[] = [
  "complete",
  "failed",
  "cancelled",
] as const;

/**
 * All processing states (active, not queued, not terminal).
 */
export const PROCESSING_STATES: readonly JobStatus[] = [
  "assigned",
  "running",
  "streaming",
] as const;

/**
 * All queued states (waiting for action).
 */
export const QUEUED_STATES: readonly JobStatus[] = ["pending"] as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a status is terminal.
 */
export function isTerminal(
  status: JobStatus
): status is "complete" | "failed" | "cancelled" {
  return TERMINAL_STATES.includes(status);
}

/**
 * Type guard to check if a status indicates active processing.
 */
export function isActivelyProcessing(
  status: JobStatus
): status is "assigned" | "running" | "streaming" {
  return PROCESSING_STATES.includes(status);
}

/**
 * Type guard to check if a status indicates the job is queued.
 */
export function isQueuedStatus(status: JobStatus): status is "pending" {
  return QUEUED_STATES.includes(status);
}

/**
 * Check if a job can still be cancelled.
 * Jobs can only be cancelled in pending or assigned states.
 */
export function canBeCancelled(status: JobStatus): boolean {
  return status === "pending" || status === "assigned";
}

/**
 * Check if a job can be claimed by a worker.
 * Jobs can only be claimed when pending.
 */
export function canBeClaimed(status: JobStatus): boolean {
  return status === "pending";
}
