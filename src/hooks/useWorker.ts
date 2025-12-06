"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWorkerStore, useJobStore, useWalletStore } from "@/stores";
import { useInference } from "./useInference";
import { useJobPolling } from "./useJobPolling";
import type { Job } from "@/types";
import { calculateActualCost } from "@/lib/pricing";

interface UseWorkerReturn {
  worker: ReturnType<typeof useWorkerStore.getState>["worker"];
  isAutoClaimEnabled: boolean;
  pendingJobs: Job[];
  currentJob: Job | null;
  isProcessing: boolean;
  initializeWorker: () => void;
  goOnline: () => void;
  goOffline: () => void;
  toggleAutoClaim: () => void;
  claimJob: (jobId: string) => Promise<void>;
}

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

  const { getJob, updateJob } = useJobStore();
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
        // Update job status to assigned
        updateJob(jobId, {
          status: "assigned",
          assignedWorker: worker.address,
        });
        setCurrentJob(jobId);

        // Sync with server
        await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "assigned",
            assignedWorker: worker.address,
          }),
        });

        // Update to running
        updateJob(jobId, { status: "running" });
        await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "running" }),
        });

        // Get job details
        const job = getJob(jobId);
        if (!job) throw new Error("Job not found");

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
        updateJob(jobId, {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setCurrentJob(null);
        isProcessingRef.current = false;
      }
    },
    [
      worker,
      updateJob,
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
