"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWorkerStore, useJobStore, useWalletStore } from "@/stores";
import { useInference } from "./useInference";
import { useJobPolling } from "./useJobPolling";
import type { Job } from "@/types";
import { calculateActualCost } from "@/lib/pricing";

/**
 * Return type for the useWorker hook.
 */
interface UseWorkerReturn {
  /** The current worker instance, or null if not initialized */
  worker: ReturnType<typeof useWorkerStore.getState>["worker"];
  /** Whether auto-claim mode is enabled */
  isAutoClaimEnabled: boolean;
  /** List of pending jobs available to claim */
  pendingJobs: Job[];
  /** The job currently being processed, or null */
  currentJob: Job | null;
  /** Whether a job is currently being processed */
  isProcessing: boolean;
  /** Initialize the worker (creates new or resumes existing) */
  initializeWorker: () => void;
  /** Transition worker to online status */
  goOnline: () => void;
  /** Transition worker to offline status */
  goOffline: () => void;
  /** Toggle auto-claim mode on/off */
  toggleAutoClaim: () => void;
  /** Claim and process a specific job */
  claimJob: (jobId: string) => Promise<void>;
}

/**
 * Hook for managing worker lifecycle and job processing in the distributed compute network.
 *
 * ## Worker Status States
 *
 * The worker can be in one of three states, displayed in WorkerStatusToggle:
 *
 * - **"online"**: Worker is active and ready to claim jobs. Polling for pending jobs
 *   is enabled, and auto-claim will trigger if enabled.
 *
 * - **"busy"**: Worker is actively processing a job. This status is set automatically
 *   when `setCurrentJob(jobId)` is called with a non-null jobId. The worker cannot
 *   claim additional jobs while busy (single-job processing model).
 *
 * - **"offline"**: Worker is not accepting jobs. Polling is disabled. The toggle in
 *   WorkerStatusToggle is disabled when busy to prevent interrupting active jobs.
 *
 * ## Status Transition Rules
 *
 * ```
 * offline ──[goOnline()]──► online ──[claimJob()]──► busy
 *    ▲                         │                      │
 *    │                         │                      │
 *    └───[goOffline()]─────────┘                      │
 *    └─────────────────── [job completes/fails] ◄─────┘
 * ```
 *
 * ## Job Claiming Invariants
 *
 * 1. **Single Job Model**: A worker can only process ONE job at a time.
 *    - `isProcessingRef.current` prevents concurrent `claimJob()` calls
 *    - `worker.currentJobId` tracks the active job
 *    - Polling for new jobs is disabled while `currentJobId` is set
 *
 * 2. **Claim-to-Complete Lifecycle**: When `claimJob(jobId)` is called:
 *    - Job status: pending → assigned → running → complete/failed
 *    - Worker status: online → busy → online (on completion)
 *    - Server is notified at each state transition
 *
 * ## Edge Case Behaviors
 *
 * ### Worker Goes Offline Mid-Processing
 * - The toggle is DISABLED when status is "busy", preventing accidental offline
 * - If the app crashes/closes while processing:
 *   - On reload, `currentJobId` is cleared (see worker-store persist config)
 *   - Worker status resets to "offline"
 *   - The in-progress job remains in "running" or "assigned" state server-side
 *   - **IMPORTANT**: Escrow funds remain locked until job timeout or manual intervention
 *   - TODO: Implement job recovery/timeout mechanism on server
 *
 * ### Auto-Claim Behavior
 * - Only triggers when: isAutoClaimEnabled AND status === "online" AND no currentJobId
 * - Claims the FIRST pending job from the queue (FIFO order)
 * - Does NOT batch-claim multiple jobs
 *
 * ### Job Failure Handling
 * - On inference error, job status is set to "failed" with error message
 * - Worker returns to "online" status (can claim new jobs)
 * - Escrow is NOT automatically released (requires separate refund mechanism)
 *
 * ### Persistence Behavior
 * - Worker data is persisted to localStorage (`qubic-worker-storage`)
 * - On page reload: status resets to "offline", currentJobId is cleared
 * - Stats (earnings, jobs completed) are preserved across sessions
 *
 * @example
 * ```tsx
 * function WorkerPanel() {
 *   const { worker, goOnline, goOffline, claimJob, isProcessing } = useWorker();
 *
 *   // Worker is processing - cannot go offline or claim new jobs
 *   if (worker?.status === "busy") {
 *     return <ProcessingIndicator />;
 *   }
 *
 *   return (
 *     <button onClick={worker?.status === "offline" ? goOnline : goOffline}>
 *       {worker?.status === "offline" ? "Go Online" : "Go Offline"}
 *     </button>
 *   );
 * }
 * ```
 *
 * @returns {UseWorkerReturn} Worker state and control functions
 */
export function useWorker(): UseWorkerReturn {
  const {
    worker,
    isAutoClaimEnabled,
    initializeWorker: storeInitialize,
    setStatus,
    setCurrentJob,
    incrementStats,
    toggleAutoClaim,
  } = useWorkerStore();

  const { getJob, updateJob, importJob } = useJobStore();
  const { addBalance } = useWalletStore();

  const {
    isStreaming,
    startInference,
  } = useInference({
    onComplete: (result) => {
      // Handle job completion in claimJob
    },
    onError: (error) => {
      console.error("Inference error:", error);
    },
  });

  // Poll for pending jobs when worker is online
  const { jobs: pendingJobs } = useJobPolling({
    status: "pending",
    enabled: worker?.status === "online" && !worker?.currentJobId,
    interval: 2000,
  });

  const currentJob = worker?.currentJobId
    ? getJob(worker.currentJobId) || null
    : null;

  const isProcessingRef = useRef(false);

  const initializeWorker = useCallback(() => {
    storeInitialize();
  }, [storeInitialize]);

  const goOnline = useCallback(() => {
    setStatus("online");

    // Register with server
    if (worker) {
      fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker: { ...worker, status: "online" } }),
      }).catch(console.error);
    }
  }, [setStatus, worker]);

  const goOffline = useCallback(() => {
    setStatus("offline");

    // Update server
    if (worker) {
      fetch("/api/workers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: worker.address, status: "offline" }),
      }).catch(console.error);
    }
  }, [setStatus, worker]);

  const claimJob = useCallback(
    async (jobId: string) => {
      if (!worker || isProcessingRef.current) return;

      isProcessingRef.current = true;
      const startTime = Date.now();

      try {
        // First, fetch the job from the server to get full details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error(`Failed to fetch job: ${jobResponse.statusText}`);
        }
        const { job: fetchedJob } = await jobResponse.json();
        if (!fetchedJob) {
          throw new Error("Job not found on server");
        }

        // Import the job into local store so we can track it
        importJob(fetchedJob);

        // Update job status to assigned
        updateJob(jobId, {
          status: "assigned",
          assignedWorker: worker.address,
        });
        setCurrentJob(jobId);

        // Sync with server - don't fail if server is unavailable
        try {
          await fetch(`/api/jobs/${jobId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "assigned",
              assignedWorker: worker.address,
            }),
          });
        } catch (syncError) {
          console.warn("Failed to sync assigned status:", syncError);
        }

        // Update to running
        updateJob(jobId, { status: "running" });
        try {
          await fetch(`/api/jobs/${jobId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "running" }),
          });
        } catch (syncError) {
          console.warn("Failed to sync running status:", syncError);
        }

        // Get job details from local store (now available after import)
        const job = getJob(jobId);
        if (!job) throw new Error("Job not found in local store");

        // Start inference
        await startInference(jobId, {
          modelId: job.modelId,
          prompt: job.prompt,
          systemPrompt: job.systemPrompt,
          parameters: job.parameters,
        });

        // Get updated job after inference
        const completedJob = getJob(jobId);
        if (completedJob && completedJob.status === "complete") {
          const responseTime = Date.now() - startTime;
          const actualCost = calculateActualCost(
            completedJob.modelId,
            completedJob.inputTokens,
            completedJob.outputTokens
          );

          // Update job with actual cost
          updateJob(jobId, { actualCost });

          // Add earnings to worker
          incrementStats(actualCost, responseTime);

          // Add earnings to wallet (as worker earnings)
          addBalance(actualCost, jobId, "earning");
        }
      } catch (error) {
        console.error("Error claiming job:", error);
        // Only update job status if it was imported successfully
        const existingJob = getJob(jobId);
        if (existingJob) {
          updateJob(jobId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } finally {
        setCurrentJob(null);
        isProcessingRef.current = false;
      }
    },
    [
      worker,
      updateJob,
      importJob,
      setCurrentJob,
      getJob,
      startInference,
      incrementStats,
      addBalance,
    ]
  );

  // Auto-claim logic
  useEffect(() => {
    if (
      isAutoClaimEnabled &&
      worker?.status === "online" &&
      !worker.currentJobId &&
      pendingJobs.length > 0 &&
      !isProcessingRef.current
    ) {
      // Claim the first pending job
      claimJob(pendingJobs[0].id);
    }
  }, [isAutoClaimEnabled, worker, pendingJobs, claimJob]);

  return {
    worker,
    isAutoClaimEnabled,
    pendingJobs,
    currentJob,
    isProcessing: isStreaming || isProcessingRef.current,
    initializeWorker,
    goOnline,
    goOffline,
    toggleAutoClaim,
    claimJob,
  };
}
