"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { formatDuration } from "@/lib/mock-utils";
import { TIER_PRICE_MULTIPLIERS, type ComputePool } from "@/types";

// ============================================================================
// POOL CARD
// ============================================================================

interface PoolCardProps {
  pool: ComputePool;
  onSelect: () => void;
  onJoin: () => void;
  canJoin: boolean;
}

export function PoolCard({
  pool,
  onSelect,
  onJoin,
  canJoin,
}: PoolCardProps) {
  const onlineMembers = pool.members.filter((m) => m.isOnline).length;
  const priceMultiplier = TIER_PRICE_MULTIPLIERS[pool.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
      onClick={onSelect}
      data-testid={`pool-card-${pool.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
              {pool.name}
            </h3>
            <TierBadge tier={pool.tier} size="sm" />
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2">{pool.description}</p>
        </div>
        {pool.status === "forming" && (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Forming
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-xs text-zinc-500">Members</p>
          <p className="text-sm font-medium text-white">
            {onlineMembers}/{pool.members.length}
            <span className="text-zinc-500 text-xs ml-1">online</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Success Rate</p>
          <p className="text-sm font-medium text-emerald-400">{pool.stats.successRate}%</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Avg Response</p>
          <p className="text-sm font-medium text-white">{formatDuration(pool.stats.avgResponseTime)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Price Mult.</p>
          <p className="text-sm font-medium text-purple-400">{priceMultiplier}x</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {pool.members.slice(0, 3).map((member) => (
              <div
                key={member.workerId}
                className={`w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-medium ${
                  member.isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {pool.members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-zinc-400">
                +{pool.members.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-500">
            {pool.stats.totalComputePower} GB VRAM
          </span>
        </div>

        {canJoin && pool.members.length < pool.maxMembers && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            data-testid={`join-pool-${pool.id}-btn`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
          >
            <UserPlus className="w-3 h-3" />
            Join
          </button>
        )}
      </div>
    </motion.div>
  );
}
