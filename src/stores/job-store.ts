import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, JobStatus, CreateJobRequest, JobParameters } from "@/types";
import { DEFAULT_JOB_PARAMETERS } from "@/types";
import {
  generateJobId,
  generateMockTxHash,
  generateMockBlockNumber,
  countTokens,
} from "@/lib/mock-utils";
import { estimateCost } from "@/lib/pricing";

interface JobState {
  jobs: Job[];
  activeJobId: string | null;
  createJob: (request: CreateJobRequest) => Job;
  importJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus | JobStatus[]) => Job[];
  getJobsByRequester: (address: string) => Job[];
  setActiveJob: (id: string | null) => void;
  appendOutput: (id: string, token: string) => void;
  incrementOutputTokens: (id: string) => void;
  clearJobs: () => void;
  cancelJob: (id: string) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      activeJobId: null,

      createJob: (request: CreateJobRequest) => {
        const id = generateJobId();
        const parameters: JobParameters = {
          ...DEFAULT_JOB_PARAMETERS,
          ...request.parameters,
        };

        const inputTokens = countTokens(request.prompt) + countTokens(request.systemPrompt || "");
        const { totalCost } = estimateCost(
          request.modelId,
          request.prompt,
          request.systemPrompt,
          parameters.maxTokens
        );

        const job: Job = {
          id,
          modelId: request.modelId,
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          parameters,
          status: "pending",
          requester: request.requester,
          createdAt: Date.now(),
          inputTokens,
          outputTokens: 0,
          output: "",
          estimatedCost: totalCost,
          mockTxHash: generateMockTxHash(),
          mockBlockNumber: generateMockBlockNumber(),
        };

        set((state) => ({
          jobs: [job, ...state.jobs],
        }));

        return job;
      },

      importJob: (job: Job) => {
        set((state) => {
          // Don't add if already exists
          if (state.jobs.some((j) => j.id === job.id)) {
            return state;
          }
          return {
            jobs: [job, ...state.jobs],
          };
        });
      },

      updateJob: (id: string, updates: Partial<Job>) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        }));
      },

      getJob: (id: string) => {
        return get().jobs.find((job) => job.id === id);
      },

      getJobsByStatus: (status: JobStatus | JobStatus[]) => {
        const statuses = Array.isArray(status) ? status : [status];
        return get().jobs.filter((job) => statuses.includes(job.status));
      },

      getJobsByRequester: (address: string) => {
        return get().jobs.filter((job) => job.requester === address);
      },

      setActiveJob: (id: string | null) => {
        set({ activeJobId: id });
      },

      appendOutput: (id: string, token: string) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  output: job.output + token,
                  outputTokens: job.outputTokens + 1,
                }
              : job
          ),
        }));
      },

      incrementOutputTokens: (id: string) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, outputTokens: job.outputTokens + 1 }
              : job
          ),
        }));
      },

      clearJobs: () => {
        set({ jobs: [], activeJobId: null });
      },

      cancelJob: (id: string) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id && job.status === "pending"
              ? { ...job, status: "cancelled" as JobStatus }
              : job
          ),
        }));
      },
    }),
    {
      name: "qubic-job-storage",
      partialize: (state) => ({
        jobs: state.jobs.filter(
          (job) => job.status === "complete" || job.status === "cancelled"
        ),
      }),
    }
  )
);
