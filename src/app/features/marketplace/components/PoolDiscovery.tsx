"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { PoolCard } from "./PoolCard";
import { usePoolStore, useWalletStore, useWorkerStore } from "@/stores";
import { getTierInfo, type PoolTier, type ComputePool } from "@/types";

// ============================================================================
// POOL DISCOVERY
// ============================================================================

export function PoolDiscovery() {
  const { pools, initializePools, joinPool } = usePoolStore();
  const { worker } = useWorkerStore();
  const { wallet } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<PoolTier | "all">("all");
  const [, setSelectedPool] = useState<ComputePool | null>(null);

  useEffect(() => {
    initializePools();
  }, [initializePools]);

  const activePools = pools.filter((p) => p.status !== "dissolved");
  const filteredPools = activePools.filter((pool) => {
    const matchesSearch =
      searchQuery === "" ||
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === "all" || pool.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const handleJoinPool = (poolId: string) => {
    if (!worker || !wallet.isConnected) return;
    joinPool({
      poolId,
      workerId: worker.id,
      address: wallet.address,
      name: worker.name,
      reputation: worker.stats.reputation,
    });
  };

  const canJoin = wallet.isConnected && worker !== null;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pools..."
            data-testid="pool-search-input"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "diamond", "platinum", "gold", "silver", "bronze"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              data-testid={`filter-tier-${tier}-btn`}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterTier === tier
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {tier === "all" ? "All" : getTierInfo(tier).label}
            </button>
          ))}
        </div>
      </div>

      {/* Pool Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPools.map((pool) => (
          <PoolCard
            key={pool.id}
            pool={pool}
            onSelect={() => setSelectedPool(pool)}
            onJoin={() => handleJoinPool(pool.id)}
            canJoin={canJoin}
          />
        ))}
      </div>

      {filteredPools.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No pools found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
