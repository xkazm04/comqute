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

export interface StatusBadgeProps {
  status: JobStatus;
  "data-testid"?: string;
}

const statusConfig: Record<JobStatus, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-400", bgColor: "bg-amber-400/10 border-amber-400/20", label: "Pending" },
  assigned: { icon: Loader2, color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20", label: "Assigned" },
  running: { icon: Loader2, color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20", label: "Running" },
  streaming: { icon: Loader2, color: "text-cyan-400", bgColor: "bg-cyan-400/10 border-cyan-400/20", label: "Streaming" },
  complete: { icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-400/10 border-emerald-400/20", label: "Complete" },
  failed: { icon: XCircle, color: "text-red-400", bgColor: "bg-red-400/10 border-red-400/20", label: "Failed" },
  cancelled: { icon: AlertCircle, color: "text-zinc-400", bgColor: "bg-zinc-400/10 border-zinc-400/20", label: "Cancelled" },
};

// Spring-based scale bounce animation for status changes
const scaleBounceVariants = {
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

// Shake animation for error states
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

export function StatusBadge({ status, "data-testid": testId }: StatusBadgeProps) {
  const { icon: Icon, color, bgColor, label } = statusConfig[status];
  const isAnimating = ["assigned", "running", "streaming"].includes(status);
  const isError = status === "failed";
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

  return (
    <motion.span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${color} ${bgColor}`}
      variants={{ ...scaleBounceVariants, ...shakeVariants }}
      initial="initial"
      animate={controls}
      style={{
        transition: "background-color 200ms ease-out, border-color 200ms ease-out",
      }}
    >
      <Icon className={`w-3 h-3 ${isAnimating ? "animate-spin" : ""}`} />
      {label}
    </motion.span>
  );
}
