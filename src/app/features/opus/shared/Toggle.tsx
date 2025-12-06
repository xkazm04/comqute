"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  activeColor?: string;
  "data-testid"?: string;
}

const sizeConfig = {
  sm: { track: "w-10 h-5", thumb: "w-4 h-4", offset: { on: 22, off: 2 } },
  md: { track: "w-12 h-6", thumb: "w-5 h-5", offset: { on: 26, off: 2 } },
  lg: { track: "w-14 h-7", thumb: "w-5 h-5", offset: { on: 32, off: 4 } },
};

export function Toggle({
  enabled,
  onToggle,
  disabled = false,
  size = "md",
  activeColor = "bg-emerald-500",
  "data-testid": testId,
}: ToggleProps) {
  const config = sizeConfig[size];

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      data-testid={testId}
      className={`
        relative ${config.track} rounded-full transition-colors
        ${enabled ? activeColor : "bg-zinc-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <motion.div
        className={`absolute top-0.5 ${config.thumb} rounded-full bg-white shadow-lg`}
        animate={{ left: enabled ? config.offset.on : config.offset.off }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// Specialized toggle with icon and label
export interface LabeledToggleProps extends Omit<ToggleProps, "size"> {
  icon: LucideIcon;
  label: string;
  description?: string;
}

export function LabeledToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
  disabled = false,
  activeColor = "bg-amber-500",
  "data-testid": testId,
}: LabeledToggleProps) {
  return (
    <div
      data-testid={testId}
      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${enabled ? "text-amber-400" : "text-zinc-500"}`} />
        <div>
          <p className="text-sm text-white">{label}</p>
          {description && <p className="text-[10px] text-zinc-500">{description}</p>}
        </div>
      </div>
      <Toggle
        enabled={enabled}
        onToggle={onToggle}
        disabled={disabled}
        size="sm"
        activeColor={activeColor}
      />
    </div>
  );
}
