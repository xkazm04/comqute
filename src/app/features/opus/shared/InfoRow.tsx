"use client";

import type { LucideIcon } from "lucide-react";

export interface InfoRowProps {
  /** Icon component to display on the left */
  icon: LucideIcon;
  /** Label text describing the value */
  label: string;
  /** The value to display on the right */
  value: string;
  /** Optional status indicator (shows a colored dot) */
  status?: "online" | "offline";
  /** Color class for the icon (e.g., "text-blue-400") */
  color: string;
  /** Optional data-testid for testing */
  "data-testid"?: string;
}

/**
 * InfoRow - A shared component for displaying icon+label+value rows
 * Used in NetworkExplorer (NetworkStatusRow) and WorkerDashboard (HardwareRow)
 */
export function InfoRow({
  icon: Icon,
  label,
  value,
  status,
  color,
  "data-testid": testId,
}: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2" data-testid={testId}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {status && (
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              status === "online" ? "bg-emerald-400" : "bg-red-400"
            }`}
            data-testid={testId ? `${testId}-status-dot` : undefined}
          />
        )}
        <span
          className={`text-xs ${
            status === "online"
              ? "text-emerald-400"
              : status === "offline"
                ? "text-red-400"
                : "text-zinc-300"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
