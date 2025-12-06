import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Worker, WorkerStatus, WorkerHardware, WorkerStats } from "@/types";
import { DEFAULT_WORKER_ADDRESS, DEFAULT_WORKER_STAKE } from "@/lib/constants";
import { generateId } from "@/lib/mock-utils";
import { SUPPORTED_MODELS } from "@/lib/models";

// Default hardware specs (for demo)
const DEFAULT_HARDWARE: WorkerHardware = {
  gpu: "NVIDIA RTX 4090",
  vram: 24,
  cpu: "AMD Ryzen 9 7950X",
  ram: 64,
};

// Initial stats with Upwork-like metrics
const DEFAULT_STATS: WorkerStats = {
  jobsCompleted: 0,
  totalEarnings: 0,
  avgResponseTime: 0,
  reputation: 100,

  // Upwork-like metrics
  avgRating: 0,
  totalReviews: 0,
  completionRate: 100,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },

  // Trust indicators
  repeatClients: 0,
  jobsLast30Days: 0,
};

interface WorkerState {
  worker: Worker | null;
  isAutoClaimEnabled: boolean;
  initializeWorker: (address?: string) => void;
  setStatus: (status: WorkerStatus) => void;
  setCurrentJob: (jobId: string | null) => void;
  incrementStats: (earnings: number, responseTime: number) => void;
  toggleAutoClaim: () => void;
  updateLastSeen: () => void;
  reset: () => void;
}

export const useWorkerStore = create<WorkerState>()(
  persist(
    (set, get) => ({
      worker: null,
      isAutoClaimEnabled: false,

      initializeWorker: (address?: string) => {
        const existingWorker = get().worker;

        if (existingWorker) {
          // Just update status to online
          set((state) => ({
            worker: state.worker
              ? {
                  ...state.worker,
                  status: "online",
                  lastSeenAt: Date.now(),
                }
              : null,
          }));
          return;
        }

        // Create new worker
        const worker: Worker = {
          id: generateId(),
          address: address || DEFAULT_WORKER_ADDRESS,
          name: "Local Worker",
          status: "online",
          hardware: DEFAULT_HARDWARE,
          stats: DEFAULT_STATS,
          supportedModels: SUPPORTED_MODELS.map((m) => m.id),
          stake: DEFAULT_WORKER_STAKE,
          registeredAt: Date.now(),
          lastSeenAt: Date.now(),
        };

        set({ worker });
      },

      setStatus: (status: WorkerStatus) => {
        set((state) => ({
          worker: state.worker
            ? {
                ...state.worker,
                status,
                lastSeenAt: Date.now(),
              }
            : null,
        }));
      },

      setCurrentJob: (jobId: string | null) => {
        set((state) => ({
          worker: state.worker
            ? {
                ...state.worker,
                currentJobId: jobId || undefined,
                status: jobId ? "busy" : "online",
                lastSeenAt: Date.now(),
              }
            : null,
        }));
      },

      incrementStats: (earnings: number, responseTime: number) => {
        set((state) => {
          if (!state.worker) return state;

          const currentStats = state.worker.stats;
          const newJobsCompleted = currentStats.jobsCompleted + 1;

          // Calculate running average for response time
          const newAvgResponseTime =
            (currentStats.avgResponseTime * currentStats.jobsCompleted +
              responseTime) /
            newJobsCompleted;

          // Update reputation based on performance (simplified)
          const targetTime = 10000; // 10 seconds target
          const performanceBonus = responseTime < targetTime ? 0.1 : -0.1;
          const newReputation = Math.min(
            100,
            Math.max(0, currentStats.reputation + performanceBonus)
          );

          return {
            worker: {
              ...state.worker,
              stats: {
                jobsCompleted: newJobsCompleted,
                totalEarnings: currentStats.totalEarnings + earnings,
                avgResponseTime: Math.round(newAvgResponseTime),
                reputation: Math.round(newReputation * 10) / 10,
              },
              lastSeenAt: Date.now(),
            },
          };
        });
      },

      toggleAutoClaim: () => {
        set((state) => ({
          isAutoClaimEnabled: !state.isAutoClaimEnabled,
        }));
      },

      updateLastSeen: () => {
        set((state) => ({
          worker: state.worker
            ? {
                ...state.worker,
                lastSeenAt: Date.now(),
              }
            : null,
        }));
      },

      reset: () => {
        set({ worker: null, isAutoClaimEnabled: false });
      },
    }),
    {
      name: "qubic-worker-storage",
      partialize: (state) => ({
        worker: state.worker
          ? {
              ...state.worker,
              status: "offline" as WorkerStatus, // Reset status on reload
              currentJobId: undefined,
            }
          : null,
        isAutoClaimEnabled: state.isAutoClaimEnabled,
      }),
    }
  )
);
