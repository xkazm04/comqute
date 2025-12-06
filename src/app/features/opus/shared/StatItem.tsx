"use client";

import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; positive: boolean };
  color: string;
  "data-testid"?: string;
}

export function StatItem({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  "data-testid": testId,
}: StatItemProps) {
  return (
    <div
      data-testid={testId}
      className="p-[var(--space-4)] rounded-xl bg-zinc-900/30 border border-zinc-800/50"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-[var(--space-1)] text-[10px] ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${!trend.positive ? "rotate-180" : ""}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-[var(--space-3)]">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
        {subValue && <p className="text-[10px] text-zinc-600 mt-[var(--space-1)]">{subValue}</p>}
      </div>
    </div>
  );
}
