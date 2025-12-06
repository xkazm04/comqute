"use client";

import { Gem, Crown, Trophy, Medal, Award } from "lucide-react";
import { getTierInfo, type PoolTier } from "@/types";

// ============================================================================
// TIER BADGE
// ============================================================================

export function TierBadge({ tier, size = "md" }: { tier: PoolTier; size?: "sm" | "md" | "lg" }) {
  const info = getTierInfo(tier);
  const Icon = tier === "diamond" ? Gem : tier === "platinum" ? Crown : tier === "gold" ? Trophy : tier === "silver" ? Medal : Award;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${info.bgColor} ${info.color} ${info.borderColor} border ${sizeClasses[size]}`}
      data-testid={`tier-badge-${tier}`}
    >
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
}
