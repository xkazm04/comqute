import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WorkerReview,
  CreateReviewRequest,
  WorkerPreference,
} from "@/types";
import { generateId } from "@/lib/mock-utils";

interface ReviewState {
  reviews: WorkerReview[];
  preferences: WorkerPreference[];

  // Review actions
  createReview: (request: CreateReviewRequest) => WorkerReview;
  getReviewsByWorker: (workerId: string) => WorkerReview[];
  getReviewsByRequester: (requesterId: string) => WorkerReview[];
  getReviewForJob: (jobId: string) => WorkerReview | undefined;
  getAverageRating: (workerId: string) => number;
  getRatingDistribution: (workerId: string) => { [key: number]: number };

  // Preference actions
  addPreference: (preference: Omit<WorkerPreference, "id" | "createdAt">) => WorkerPreference;
  updatePreference: (id: string, updates: Partial<WorkerPreference>) => void;
  removePreference: (id: string) => void;
  getPreferencesByRequester: (requesterId: string) => WorkerPreference[];
  getFavoriteWorkers: (requesterId: string) => WorkerPreference[];
  isWorkerFavorite: (requesterId: string, workerId: string) => boolean;
  toggleFavorite: (requesterId: string, workerId: string, workerAddress: string, workerName: string) => void;

  // Utility
  clearAll: () => void;
}

// Mock reviews for demo purposes
const MOCK_REVIEWS: WorkerReview[] = [
  {
    id: "rev-1",
    workerId: "worker-1",
    requesterId: "req-1",
    requesterAddress: "0x1234...5678",
    jobId: "job-1",
    rating: 5,
    comment: "Excellent work! Fast response time and high quality output. Will definitely work with again.",
    responseTime: 3200,
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
  },
  {
    id: "rev-2",
    workerId: "worker-1",
    requesterId: "req-2",
    requesterAddress: "0xabcd...efgh",
    jobId: "job-2",
    rating: 4,
    comment: "Good service, completed the task on time. Minor formatting issues but overall satisfied.",
    responseTime: 5600,
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
  },
  {
    id: "rev-3",
    workerId: "worker-1",
    requesterId: "req-3",
    requesterAddress: "0x9876...5432",
    jobId: "job-3",
    rating: 5,
    comment: "Outstanding! The worker went above and beyond. Highly recommended.",
    responseTime: 2800,
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
  },
  {
    id: "rev-4",
    workerId: "worker-1",
    requesterId: "req-1",
    requesterAddress: "0x1234...5678",
    jobId: "job-4",
    rating: 5,
    comment: "Third time working together - consistently excellent!",
    responseTime: 3100,
    createdAt: Date.now() - 86400000 * 1, // 1 day ago
  },
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: MOCK_REVIEWS,
      preferences: [],

      createReview: (request: CreateReviewRequest) => {
        const review: WorkerReview = {
          id: generateId(),
          ...request,
          createdAt: Date.now(),
        };

        set((state) => ({
          reviews: [review, ...state.reviews],
        }));

        return review;
      },

      getReviewsByWorker: (workerId: string) => {
        return get().reviews.filter((r) => r.workerId === workerId);
      },

      getReviewsByRequester: (requesterId: string) => {
        return get().reviews.filter((r) => r.requesterId === requesterId);
      },

      getReviewForJob: (jobId: string) => {
        return get().reviews.find((r) => r.jobId === jobId);
      },

      getAverageRating: (workerId: string) => {
        const reviews = get().reviews.filter((r) => r.workerId === workerId);
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return Math.round((total / reviews.length) * 10) / 10;
      },

      getRatingDistribution: (workerId: string) => {
        const reviews = get().reviews.filter((r) => r.workerId === workerId);
        const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        return distribution;
      },

      addPreference: (preference) => {
        const pref: WorkerPreference = {
          id: generateId(),
          ...preference,
          createdAt: Date.now(),
        };

        set((state) => ({
          preferences: [pref, ...state.preferences],
        }));

        return pref;
      },

      updatePreference: (id: string, updates: Partial<WorkerPreference>) => {
        set((state) => ({
          preferences: state.preferences.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removePreference: (id: string) => {
        set((state) => ({
          preferences: state.preferences.filter((p) => p.id !== id),
        }));
      },

      getPreferencesByRequester: (requesterId: string) => {
        return get().preferences.filter((p) => p.requesterId === requesterId);
      },

      getFavoriteWorkers: (requesterId: string) => {
        return get().preferences.filter(
          (p) => p.requesterId === requesterId && p.isFavorite
        );
      },

      isWorkerFavorite: (requesterId: string, workerId: string) => {
        return get().preferences.some(
          (p) => p.requesterId === requesterId && p.workerId === workerId && p.isFavorite
        );
      },

      toggleFavorite: (requesterId: string, workerId: string, workerAddress: string, workerName: string) => {
        const existing = get().preferences.find(
          (p) => p.requesterId === requesterId && p.workerId === workerId
        );

        if (existing) {
          set((state) => ({
            preferences: state.preferences.map((p) =>
              p.id === existing.id ? { ...p, isFavorite: !p.isFavorite } : p
            ),
          }));
        } else {
          get().addPreference({
            requesterId,
            workerId,
            workerAddress,
            workerName,
            isFavorite: true,
            notes: "",
            lastJobAt: Date.now(),
            totalJobsTogether: 1,
            avgRatingGiven: 0,
          });
        }
      },

      clearAll: () => {
        set({ reviews: [], preferences: [] });
      },
    }),
    {
      name: "qubic-review-storage",
    }
  )
);
