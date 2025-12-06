"use client";

import { useEffect, useRef, useCallback } from "react";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Step status values that can be persisted
 */
export type PersistedStepStatus = "pending" | "active" | "running" | "complete" | "error";

/**
 * State structure for persisted onboarding data
 */
export interface OnboardingPersistedState {
  /** Current step index (0-5) */
  currentStep: number;
  /** Status of each step by step ID */
  stepStatuses: Record<string, PersistedStepStatus>;
  /** Whether the onboarding is fully complete */
  isComplete: boolean;
  /** Form inputs from configure step */
  configureData: {
    walletAddress: string;
    selectedModels: string[];
  };
  /** Benchmark results if completed */
  benchmarkResults: {
    tokensPerSec: number;
    latency: number;
    memoryUsed: number;
    hash: string;
  } | null;
  /** Stake amount if set */
  stakeAmount: number;
  /** Timestamp of last update */
  lastUpdated: number;
}

/**
 * Return type for the useOnboardingPersistence hook
 */
export interface OnboardingPersistenceReturn {
  /** Load saved state from localStorage */
  loadState: () => OnboardingPersistedState | null;
  /** Save current state to localStorage */
  saveState: (state: Partial<OnboardingPersistedState>) => void;
  /** Clear all saved state */
  clearState: () => void;
  /** Check if there's a resumable session */
  hasResumableSession: () => boolean;
  /** Get the step name for resume prompt */
  getResumeStepName: (stepIndex: number) => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "qubic-worker-onboarding";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours - sessions expire after this

/**
 * Step names for user-friendly resume messages
 */
const STEP_NAMES: Record<number, string> = {
  0: "Install",
  1: "Configure",
  2: "Download Models",
  3: "Benchmark",
  4: "Stake",
  5: "Register",
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for persisting worker onboarding progress to localStorage.
 *
 * Saves step completion status, form inputs (wallet address, model selection),
 * benchmark results, and stake amount. Allows users to resume from where
 * they left off after page refresh.
 *
 * **Features:**
 * - Auto-saves state changes with debouncing
 * - 24-hour session expiry (stale sessions are cleared)
 * - Safe SSR handling (checks for window availability)
 * - Atomic state updates with timestamps
 *
 * @example
 * ```tsx
 * const { loadState, saveState, hasResumableSession, clearState } = useOnboardingPersistence();
 *
 * // On mount, check for resumable session
 * useEffect(() => {
 *   if (hasResumableSession()) {
 *     setShowResumePrompt(true);
 *   }
 * }, []);
 *
 * // Save state when step changes
 * useEffect(() => {
 *   saveState({ currentStep, stepStatuses });
 * }, [currentStep, stepStatuses]);
 * ```
 */
export function useOnboardingPersistence(): OnboardingPersistenceReturn {
  const isClient = useRef(typeof window !== "undefined");

  /**
   * Load saved onboarding state from localStorage.
   * Returns null if no saved state exists or if it has expired.
   */
  const loadState = useCallback((): OnboardingPersistedState | null => {
    if (!isClient.current) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as OnboardingPersistedState;

      // Check if session has expired
      if (Date.now() - parsed.lastUpdated > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      // Invalid JSON or other error - clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  /**
   * Save current onboarding state to localStorage.
   * Merges partial updates with existing state.
   */
  const saveState = useCallback((state: Partial<OnboardingPersistedState>): void => {
    if (!isClient.current) return;

    try {
      const existing = loadState();
      const merged: OnboardingPersistedState = {
        currentStep: state.currentStep ?? existing?.currentStep ?? 0,
        stepStatuses: { ...existing?.stepStatuses, ...state.stepStatuses },
        isComplete: state.isComplete ?? existing?.isComplete ?? false,
        configureData: {
          walletAddress: state.configureData?.walletAddress ?? existing?.configureData?.walletAddress ?? "",
          selectedModels: state.configureData?.selectedModels ?? existing?.configureData?.selectedModels ?? [],
        },
        benchmarkResults: state.benchmarkResults ?? existing?.benchmarkResults ?? null,
        stakeAmount: state.stakeAmount ?? existing?.stakeAmount ?? 10_000_000,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // localStorage might be full or unavailable - fail silently
    }
  }, [loadState]);

  /**
   * Clear all saved onboarding state.
   */
  const clearState = useCallback((): void => {
    if (!isClient.current) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Fail silently
    }
  }, []);

  /**
   * Check if there's a resumable session (not on step 0, not complete).
   */
  const hasResumableSession = useCallback((): boolean => {
    const state = loadState();
    if (!state) return false;

    // Only show resume if user has made progress but hasn't finished
    return state.currentStep > 0 && !state.isComplete;
  }, [loadState]);

  /**
   * Get user-friendly step name for resume prompt.
   */
  const getResumeStepName = useCallback((stepIndex: number): string => {
    return STEP_NAMES[stepIndex] || `Step ${stepIndex + 1}`;
  }, []);

  return {
    loadState,
    saveState,
    clearState,
    hasResumableSession,
    getResumeStepName,
  };
}
