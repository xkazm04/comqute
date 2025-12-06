"use client";

import { Users, Trophy, DollarSign, Star, Crown, Shield, Percent } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { GlassCard, StatItem } from "../../opus/shared";
import { usePoolStore, useWorkerStore } from "@/stores";
import { formatQubic, formatRelativeTime } from "@/lib/mock-utils";

// ============================================================================
// MY POOL
// ============================================================================

export function MyPool() {
  const { myPoolId, getPoolById, leavePool } = usePoolStore();
  const { worker } = useWorkerStore();
  const pool = myPoolId ? getPoolById(myPoolId) : null;

  if (!pool) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400">You are not a member of any pool</p>
        <p className="text-zinc-500 text-sm mt-1">Join an existing pool or create your own</p>
      </div>
    );
  }

  const isOwner = worker && pool.members.find((m) => m.workerId === worker.id)?.role === "owner";
  const myMember = worker ? pool.members.find((m) => m.workerId === worker.id) : null;

  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <GlassCard>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">{pool.name}</h2>
              <TierBadge tier={pool.tier} />
            </div>
            <p className="text-sm text-zinc-400">{pool.description}</p>
          </div>
          {isOwner && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Crown className="w-3 h-3" />
              Owner
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatItem
            icon={Users}
            label="Members"
            value={`${pool.members.filter((m) => m.isOnline).length}/${pool.members.length}`}
            subValue="online"
            color="bg-cyan-500/20"
          />
          <StatItem
            icon={Trophy}
            label="Jobs Completed"
            value={pool.stats.completedJobs.toLocaleString()}
            color="bg-emerald-500/20"
          />
          <StatItem
            icon={DollarSign}
            label="Total Earnings"
            value={formatQubic(pool.stats.totalEarnings)}
            color="bg-amber-500/20"
          />
          <StatItem
            icon={Star}
            label="Success Rate"
            value={`${pool.stats.successRate}%`}
            color="bg-purple-500/20"
          />
        </div>

        {/* My Stats */}
        {myMember && (
          <div className="pt-4 border-t border-zinc-800/50">
            <h3 className="text-xs text-zinc-500 mb-3">Your Contribution</h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-lg font-bold text-white">{formatQubic(myMember.totalEarnings)}</p>
                <p className="text-[10px] text-zinc-500">Earnings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{myMember.jobsCompleted}</p>
                <p className="text-[10px] text-zinc-500">Jobs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{myMember.contributionShare.toFixed(1)}%</p>
                <p className="text-[10px] text-zinc-500">Share</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{myMember.reputation}</p>
                <p className="text-[10px] text-zinc-500">Reputation</p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Members */}
      <GlassCard>
        <h3 className="font-medium text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-cyan-400" />
          Pool Members ({pool.members.length}/{pool.maxMembers})
        </h3>
        <div className="space-y-2">
          {pool.members.map((member) => (
            <div
              key={member.workerId}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50"
              data-testid={`pool-member-${member.workerId}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    member.isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white">{member.name}</p>
                    {member.role === "owner" && <Crown className="w-3 h-3 text-purple-400" />}
                    {member.role === "admin" && <Shield className="w-3 h-3 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {member.isOnline ? "Online" : `Last seen ${formatRelativeTime(member.lastActiveAt)}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{member.reputation}/100</p>
                <p className="text-[10px] text-zinc-500">{member.contributionShare.toFixed(1)}% share</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Profit Sharing Config */}
      <GlassCard>
        <h3 className="font-medium text-white flex items-center gap-2 mb-4">
          <Percent className="w-4 h-4 text-emerald-400" />
          Profit Sharing
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500">Model</p>
            <p className="text-sm text-white capitalize">{pool.profitSharing.model.replace("_", " ")}</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500">Owner Fee</p>
            <p className="text-sm text-white">{pool.profitSharing.ownerFee}%</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500">Admin Fee</p>
            <p className="text-sm text-white">{pool.profitSharing.adminFee}%</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500">Reserve Fund</p>
            <p className="text-sm text-white">{pool.profitSharing.reserveFund}%</p>
          </div>
        </div>
      </GlassCard>

      {/* Leave Pool Button */}
      {!isOwner && worker && (
        <button
          onClick={() => leavePool(pool.id, worker.id)}
          data-testid="leave-pool-btn"
          className="w-full py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
        >
          Leave Pool
        </button>
      )}
    </div>
  );
}
