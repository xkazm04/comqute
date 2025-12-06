"use client";

import { useCallback } from "react";
import { useJobStore, useWalletStore } from "@/stores";
import type { CreateJobRequest, Job, JobStatus } from "@/types";
import { estimateCost } from "@/lib/pricing";

interface UseJobsReturn {
  jobs: Job[];
  activeJob: Job | null;
  createJob: (request: Omit<CreateJobRequest, "requester">) => Job | null;
  cancelJob: (jobId: string) => void;
  getJob: (jobId: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus | JobStatus[]) => Job[];
  estimateJobCost: (
    modelId: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number
  ) => { inputTokens: number; estimatedOutputTokens: number; totalCost: number };
}

export function useJobs(): UseJobsReturn {
  const {
    jobs,
    activeJobId,
    createJob: storeCreateJob,
    cancelJob: storeCancelJob,
    getJob,
    getJobsByStatus,
    updateJob,
  } = useJobStore();

  const { wallet, deductBalance, addBalance } = useWalletStore();

  const activeJob = activeJobId ? getJob(activeJobId) || null : null;

  const createJob = useCallback(
    (request: Omit<CreateJobRequest, "requester">) => {
      if (!wallet.isConnected) {
        console.error("Wallet not connected");
        return null;
      }

      // Estimate cost
      const { totalCost } = estimateCost(
        request.modelId,
        request.prompt,
        request.systemPrompt,
        request.parameters?.maxTokens
      );

      // Check balance
      if (wallet.balance < totalCost) {
        console.error("Insufficient balance");
        return null;
      }

      // Create job
      const job = storeCreateJob({
        ...request,
        requester: wallet.address,
      });

      // Deduct balance
      deductBalance(totalCost, job.id);

      // Sync to server
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      }).catch((error) => {
        console.error("Failed to sync job to server:", error);
      });

      return job;
    },
    [wallet, storeCreateJob, deductBalance]
  );

  const cancelJob = useCallback(
    (jobId: string) => {
      const job = getJob(jobId);
      if (!job || job.status !== "pending") {
        return;
      }

      // Cancel locally
      storeCancelJob(jobId);

      // Refund the estimated cost
      addBalance(job.estimatedCost, jobId, "refund");

      // Sync to server
      fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      }).catch((error) => {
        console.error("Failed to cancel job on server:", error);
      });
    },
    [getJob, storeCancelJob, addBalance]
  );

  const estimateJobCost = useCallback(
    (
      modelId: string,
      prompt: string,
      systemPrompt?: string,
      maxTokens?: number
    ) => {
      return estimateCost(modelId, prompt, systemPrompt, maxTokens);
    },
    []
  );

  return {
    jobs,
    activeJob,
    createJob,
    cancelJob,
    getJob,
    getJobsByStatus,
    estimateJobCost,
  };
}
