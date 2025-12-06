"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Hook to detect if the user prefers reduced motion.
 * Uses the prefers-reduced-motion media query to respect system preferences.
 *
 * WCAG 2.1 AAA compliant - respects user's motion preferences.
 * Users with vestibular disorders or motion sensitivity can use this to
 * disable animations that may cause discomfort.
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns animation props that respect reduced motion preferences.
 * Use this to conditionally apply or disable animations.
 *
 * @param prefersReducedMotion - whether user prefers reduced motion
 * @returns object with helper functions for conditional animation
 */
export function getReducedMotionProps(prefersReducedMotion: boolean) {
  return {
    /**
     * Returns animation props only if reduced motion is NOT preferred.
     * Falls back to an instant/static version if reduced motion is preferred.
     */
    animate: <T extends object>(
      animateProps: T,
      reducedProps?: Partial<T>
    ): T | Partial<T> => {
      if (prefersReducedMotion) {
        return reducedProps ?? {};
      }
      return animateProps;
    },

    /**
     * Returns a transition that is instant if reduced motion is preferred.
     */
    transition: (duration: number, options?: object) => {
      if (prefersReducedMotion) {
        return { duration: 0, ...options };
      }
      return { duration, ...options };
    },

    /**
     * Returns 0 duration for reduced motion, otherwise the provided duration.
     */
    duration: (ms: number) => (prefersReducedMotion ? 0 : ms),

    /**
     * Returns whether to skip continuous/repeating animations.
     */
    skipContinuous: prefersReducedMotion,

    /**
     * Returns Infinity for repeat count if reduced motion is preferred (no repeats).
     * Otherwise returns the provided repeat count.
     */
    repeat: (count: number) => (prefersReducedMotion ? 0 : count),
  };
}

/**
 * Reduced motion variant helpers for Framer Motion.
 * Provides static variants for reduced motion users.
 */
export const reducedMotionVariants = {
  /** Static hidden state - no animation */
  hidden: { opacity: 0 },

  /** Static visible state - no animation */
  visible: { opacity: 1 },

  /** No exit animation */
  exit: { opacity: 0 },
};

/**
 * Returns transition settings for reduced motion.
 * Near-instant but not jarring.
 */
export const reducedMotionTransition = {
  duration: 0.01,
  ease: "linear",
};

export default useReducedMotion;
