"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StatusIndicatorProps {
  online: boolean;
  label: string;
  "data-testid"?: string;
}

// Spring-based scale bounce animation for status changes
const bounceVariants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut",
      times: [0, 0.5, 1],
    },
  },
};

// Shake animation for offline/error states
const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function StatusIndicator({ online, label, "data-testid": testId }: StatusIndicatorProps) {
  const controls = useAnimation();
  const prevOnlineRef = useRef<boolean | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Trigger animations on online status change
  useEffect(() => {
    // Skip animation on first render or if user prefers reduced motion
    if (isFirstRender) {
      setIsFirstRender(false);
      prevOnlineRef.current = online;
      return;
    }

    // Only animate if status actually changed and user doesn't prefer reduced motion
    if (prevOnlineRef.current !== online) {
      prevOnlineRef.current = online;

      if (!prefersReducedMotion) {
        if (!online) {
          // Shake animation when going offline
          controls.start("shake");
        } else {
          // Scale bounce when coming online
          controls.start("bounce");
        }
      }
    }
  }, [online, controls, isFirstRender, prefersReducedMotion]);

  return (
    <motion.div
      data-testid={testId}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800"
      variants={{ ...bounceVariants, ...shakeVariants }}
      initial="initial"
      animate={controls}
      style={{
        transition: "border-color 200ms ease-out, background-color 200ms ease-out",
      }}
    >
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`}
        animate={
          prefersReducedMotion
            ? { scale: 1 }
            : online
              ? { opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }
              : { scale: 1 }
        }
        transition={{
          duration: prefersReducedMotion ? 0 : 2,
          repeat: prefersReducedMotion ? 0 : online ? Infinity : 0,
        }}
        style={{
          transition: "background-color 200ms ease-out",
        }}
      />
      <motion.span
        className={`text-xs font-medium ${online ? "text-emerald-400" : "text-red-400"}`}
        key={online ? "online" : "offline"} // Re-animate on change
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          transition: "color 200ms ease-out",
        }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
