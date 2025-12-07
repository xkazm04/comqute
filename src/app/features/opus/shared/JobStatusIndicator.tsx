"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { JobStatus } from "@/types";

/**
 * Unified status-to-visual configuration for JobStatus.
 * Centralizes all color mappings to prevent drift between components.
 */
export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  {
    icon: typeof CheckCircle;
    color: string;
    bgColor: string;
    dotColor: string;
    label: string;
  }
> = {
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
    dotColor: "bg-amber-400",
    label: "Pending",
  },
  assigned: {
    icon: Loader2,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
    dotColor: "bg-blue-400",
    label: "Assigned",
  },
  running: {
    icon: Loader2,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
    dotColor: "bg-blue-400",
    label: "Running",
  },
  streaming: {
    icon: Loader2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10 border-cyan-400/20",
    dotColor: "bg-cyan-400",
    label: "Streaming",
  },
  complete: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10 border-emerald-400/20",
    dotColor: "bg-emerald-400",
    label: "Complete",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/20",
    dotColor: "bg-red-400",
    label: "Failed",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-zinc-400",
    bgColor: "bg-zinc-400/10 border-zinc-400/20",
    dotColor: "bg-zinc-400",
    label: "Cancelled",
  },
};

/**
 * Statuses that should show active animation (pulse, spin, etc.)
 */
export const ANIMATING_STATUSES: JobStatus[] = ["assigned", "running", "streaming"];

/**
 * Check if a status should show active animation
 */
export function isAnimatingStatus(status: JobStatus): boolean {
  return ANIMATING_STATUSES.includes(status);
}

/**
 * Check if a status is an error state
 */
export function isErrorStatus(status: JobStatus): boolean {
  return status === "failed";
}

// Spring-based scale bounce animation for status changes
const scaleBounceVariants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      times: [0, 0.5, 1],
    },
  },
};

// Slightly larger bounce for dot variant
const dotBounceVariants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.5, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      times: [0, 0.5, 1],
    },
  },
};

// Shake animation for error states
const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

// Smaller shake for dot variant
const dotShakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-1, 1, -1, 1, 0],
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export interface JobStatusIndicatorProps {
  status: JobStatus;
  /** Visual variant: "badge" shows label+icon, "dot" shows only a small dot */
  variant?: "badge" | "dot";
  "data-testid"?: string;
}

/**
 * Unified JobStatusIndicator component.
 *
 * Renders job status as either:
 * - **badge**: Full badge with icon and label (default)
 * - **dot**: Minimal dot indicator with pulse animation for active states
 *
 * Features:
 * - Centralized status-to-color mapping to prevent drift
 * - Micro-interactions: bounce on status change, shake on error
 * - Pulse animation for active statuses (assigned/running/streaming)
 * - Spinning icon for active badge variant
 */
export function JobStatusIndicator({
  status,
  variant = "badge",
  "data-testid": testId,
}: JobStatusIndicatorProps) {
  const config = JOB_STATUS_CONFIG[status];
  const isAnimating = isAnimatingStatus(status);
  const isError = isErrorStatus(status);
  const controls = useAnimation();
  const prevStatusRef = useRef<JobStatus | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Trigger animations on status change
  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender) {
      setIsFirstRender(false);
      prevStatusRef.current = status;
      return;
    }

    // Only animate if status actually changed
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;

      if (isError) {
        // Shake animation for error states
        controls.start("shake");
      } else {
        // Scale bounce for other status changes
        controls.start("bounce");
      }
    }
  }, [status, isError, controls, isFirstRender]);

  // DOT VARIANT
  if (variant === "dot") {
    return (
      <div className="relative" data-testid={testId ?? "status-dot"}>
        <motion.div
          className={`w-2 h-2 rounded-full ${config.dotColor}`}
          initial="initial"
          animate={controls}
          variants={{ ...dotBounceVariants, ...dotShakeVariants }}
          key={status} // Re-animate on status change
          style={{
            transition: "background-color 200ms ease-out",
          }}
        />
        {/* Pulse ring for active statuses */}
        {isAnimating && (
          <motion.div
            className={`absolute inset-0 rounded-full ${config.dotColor}`}
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    );
  }

  // BADGE VARIANT (default)
  const Icon = config.icon;

  return (
    <motion.span
      data-testid={testId ?? "status-badge"}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color} ${config.bgColor}`}
      variants={{ ...scaleBounceVariants, ...shakeVariants }}
      initial="initial"
      animate={controls}
      style={{
        transition: "background-color 200ms ease-out, border-color 200ms ease-out",
      }}
    >
      <Icon className={`w-3 h-3 ${isAnimating ? "animate-spin" : ""}`} />
      {config.label}
    </motion.span>
  );
}

// Re-export StatusBadge as an alias for backward compatibility
export { JobStatusIndicator as StatusBadge };
export type { JobStatusIndicatorProps as StatusBadgeProps };
