"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Store,
  Search,
  Filter,
  Plus,
  Trophy,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  Shield,
  Loader2,
  AlertCircle,
  Check,
  X,
  DollarSign,
  BarChart3,
  Settings,
  UserPlus,
  Crown,
  Gem,
  Medal,
  Award,
  Target,
  ArrowUpRight,
  Percent,
} from "lucide-react";
import { GlassCard, StatItem, Toggle } from "../shared";
import { usePoolStore, useWalletStore, useWorkerStore } from "@/stores";
import { formatQubic, formatRelativeTime, formatDuration } from "@/lib/mock-utils";
import {
  getTierInfo,
  TIER_PRICE_MULTIPLIERS,
  type PoolTier,
  type ComputePool,
  type LargeInferenceJob,
  type PoolMember,
  type ProfitSharingConfig,
  type LoadBalancingStrategy,
} from "@/types";

// ============================================================================
// TAB SWITCHER
// ============================================================================

type MarketplaceTab = "discover" | "jobs" | "my-pool" | "create";

function MarketplaceTabSwitcher({
  activeTab,
  onTabChange,
  hasPool,
}: {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  hasPool: boolean;
}) {
  const tabs = [
    { id: "discover" as MarketplaceTab, label: "Discover Pools", icon: Search },
    { id: "jobs" as MarketplaceTab, label: "Large Jobs", icon: Target },
    {
      id: hasPool ? "my-pool" : "create",
      label: hasPool ? "My Pool" : "Create Pool",
      icon: hasPool ? Users : Plus,
    } as { id: MarketplaceTab; label: string; icon: typeof Search },
  ];

  return (
    <div
      className="flex gap-2 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800"
      data-testid="marketplace-tab-switcher"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-testid={`marketplace-tab-${tab.id}`}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all
              ${isActive
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// TIER BADGE
// ============================================================================

function TierBadge({ tier, size = "md" }: { tier: PoolTier; size?: "sm" | "md" | "lg" }) {
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

// ============================================================================
// POOL CARD
// ============================================================================

function PoolCard({
  pool,
  onSelect,
  onJoin,
  canJoin,
}: {
  pool: ComputePool;
  onSelect: () => void;
  onJoin: () => void;
  canJoin: boolean;
}) {
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
            {pool.members.slice(0, 3).map((member, i) => (
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

// ============================================================================
// LARGE JOB CARD
// ============================================================================

function LargeJobCard({
  job,
  onBid,
  canBid,
}: {
  job: LargeInferenceJob;
  onBid: () => void;
  canBid: boolean;
}) {
  const timeLeft = job.deadline - Date.now();
  const isExpiringSoon = timeLeft < 1800000; // 30 minutes

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
      data-testid={`large-job-card-${job.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TierBadge tier={job.minPoolTier} size="sm" />
            <span className="text-xs text-zinc-500">minimum required</span>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-2">{job.prompt.slice(0, 100)}...</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] ${
            job.status === "open"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {job.status === "open" ? "Open" : `${job.bids.length} bids`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-xs text-zinc-500">Max Budget</p>
          <p className="text-sm font-medium text-emerald-400">{formatQubic(job.maxBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Max Tokens</p>
          <p className="text-sm font-medium text-white">{job.parameters.maxTokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Model</p>
          <p className="text-sm font-medium text-white">{job.modelId}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Deadline</p>
          <p className={`text-sm font-medium ${isExpiringSoon ? "text-red-400" : "text-white"}`}>
            {formatDuration(timeLeft)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500">
          Created {formatRelativeTime(job.createdAt)}
        </span>

        {canBid && job.status !== "assigned" && (
          <button
            onClick={onBid}
            data-testid={`bid-job-${job.id}-btn`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Place Bid
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// POOL DISCOVERY
// ============================================================================

function PoolDiscovery() {
  const { pools, initializePools, joinPool } = usePoolStore();
  const { worker } = useWorkerStore();
  const { wallet } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<PoolTier | "all">("all");
  const [selectedPool, setSelectedPool] = useState<ComputePool | null>(null);

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

// ============================================================================
// LARGE JOBS
// ============================================================================

function LargeJobs() {
  const { largeJobs, myPoolId, getPoolById, submitBid, initializePools } = usePoolStore();
  const [bidDialogJob, setBidDialogJob] = useState<LargeInferenceJob | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  useEffect(() => {
    initializePools();
  }, [initializePools]);

  const myPool = myPoolId ? getPoolById(myPoolId) : null;
  const openJobs = largeJobs.filter((j) => j.status === "open" || j.status === "bidding");

  const handleSubmitBid = () => {
    if (!bidDialogJob || !myPoolId || !bidAmount || !estimatedTime) return;

    submitBid(
      myPoolId,
      bidDialogJob.id,
      parseInt(bidAmount) * 1000000, // Convert to QUBIC
      parseInt(estimatedTime) * 1000 // Convert to ms
    );
    setBidDialogJob(null);
    setBidAmount("");
    setEstimatedTime("");
  };

  const canBid = myPool != null && myPool.status === "active";

  return (
    <div className="space-y-6">
      {/* Info banner if no pool */}
      {!myPool && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-400 font-medium">Join or create a pool to bid</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Large inference jobs require compute pools to place bids
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          icon={Target}
          label="Open Jobs"
          value={openJobs.length}
          color="bg-emerald-500/20"
          data-testid="stat-open-jobs"
        />
        <StatItem
          icon={DollarSign}
          label="Total Budget"
          value={formatQubic(openJobs.reduce((sum, j) => sum + j.maxBudget, 0))}
          color="bg-amber-500/20"
          data-testid="stat-total-budget"
        />
        <StatItem
          icon={Users}
          label="Active Pools"
          value={usePoolStore.getState().getActivePools().length}
          color="bg-cyan-500/20"
          data-testid="stat-active-pools"
        />
        <StatItem
          icon={TrendingUp}
          label="Your Pool Tier"
          value={myPool ? getTierInfo(myPool.tier).label : "None"}
          color="bg-purple-500/20"
          data-testid="stat-pool-tier"
        />
      </div>

      {/* Jobs List */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Available Large Jobs
          </h3>
        </div>

        <div className="space-y-4">
          {openJobs.map((job) => (
            <LargeJobCard
              key={job.id}
              job={job}
              onBid={() => setBidDialogJob(job)}
              canBid={canBid}
            />
          ))}

          {openJobs.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No large jobs available</p>
              <p className="text-zinc-600 text-xs mt-1">Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Bid Dialog */}
      <AnimatePresence>
        {bidDialogJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBidDialogJob(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Place Bid</h3>
                  <button
                    onClick={() => setBidDialogJob(null)}
                    data-testid="close-bid-dialog-btn"
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">Your Bid (QUBIC millions)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="e.g. 25 for 25M QUBIC"
                      data-testid="bid-amount-input"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Max budget: {formatQubic(bidDialogJob.maxBudget)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">Estimated Time (seconds)</label>
                    <input
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 60"
                      data-testid="bid-time-input"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <button
                    onClick={handleSubmitBid}
                    disabled={!bidAmount || !estimatedTime}
                    data-testid="submit-bid-btn"
                    className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    Submit Bid
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// CREATE POOL
// ============================================================================

function CreatePool({ onCreated }: { onCreated: () => void }) {
  const { createPool } = usePoolStore();
  const { wallet } = useWalletStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minReputation, setMinReputation] = useState(0);
  const [maxMembers, setMaxMembers] = useState(10);
  const [profitModel, setProfitModel] = useState<ProfitSharingConfig["model"]>("reputation_weighted");
  const [ownerFee, setOwnerFee] = useState(5);
  const [loadBalancing, setLoadBalancing] = useState<LoadBalancingStrategy>("reputation_first");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || !wallet.isConnected) return;

    setIsCreating(true);
    createPool({
      name,
      description,
      owner: wallet.address,
      supportedModels: [], // Will be populated from worker
      minReputation,
      maxMembers,
      profitSharing: {
        model: profitModel,
        ownerFee,
        adminFee: 2,
        reserveFund: 3,
      },
      loadBalancing,
    });
    setIsCreating(false);
    onCreated();
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
        <p className="text-zinc-400">Connect your wallet to create a pool</p>
      </div>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Plus className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-medium text-white">Create Compute Pool</h3>
          <p className="text-xs text-zinc-500">Form a collective to bid on large jobs</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Pool Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alpha Compute Collective"
            data-testid="create-pool-name-input"
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your pool's focus and strengths..."
            rows={3}
            data-testid="create-pool-description-input"
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Min Reputation to Join</label>
            <input
              type="number"
              value={minReputation}
              onChange={(e) => setMinReputation(Number(e.target.value))}
              min={0}
              max={100}
              data-testid="create-pool-min-reputation-input"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Max Members</label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              min={2}
              max={50}
              data-testid="create-pool-max-members-input"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Profit Sharing Model</label>
          <div className="grid grid-cols-2 gap-2">
            {(["equal", "reputation_weighted", "contribution_weighted"] as const).map((model) => (
              <button
                key={model}
                onClick={() => setProfitModel(model)}
                data-testid={`profit-model-${model}-btn`}
                className={`p-3 rounded-lg text-left transition-all ${
                  profitModel === model
                    ? "bg-cyan-500/20 border border-cyan-500/30"
                    : "bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <p className={`text-sm font-medium ${profitModel === model ? "text-cyan-400" : "text-zinc-300"}`}>
                  {model === "equal" ? "Equal Split" : model === "reputation_weighted" ? "By Reputation" : "By Contribution"}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {model === "equal"
                    ? "Everyone gets the same share"
                    : model === "reputation_weighted"
                    ? "Higher reputation = bigger share"
                    : "Based on work completed"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500">Owner Fee</label>
            <span className="text-xs text-cyan-400 font-medium">{ownerFee}%</span>
          </div>
          <input
            type="range"
            value={ownerFee}
            onChange={(e) => setOwnerFee(Number(e.target.value))}
            min={0}
            max={20}
            data-testid="create-pool-owner-fee-slider"
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Load Balancing Strategy</label>
          <select
            value={loadBalancing}
            onChange={(e) => setLoadBalancing(e.target.value as LoadBalancingStrategy)}
            data-testid="create-pool-load-balancing-select"
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="round_robin">Round Robin</option>
            <option value="reputation_first">Reputation First</option>
            <option value="fastest_response">Fastest Response</option>
            <option value="least_busy">Least Busy</option>
            <option value="random">Random</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          data-testid="create-pool-submit-btn"
          className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Pool
        </button>
      </div>
    </GlassCard>
  );
}

// ============================================================================
// MY POOL
// ============================================================================

function MyPool() {
  const { myPoolId, getPoolById, leavePool, updateProfitSharing, updateLoadBalancing } = usePoolStore();
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PoolMarketplace() {
  const { myPoolId } = usePoolStore();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("discover");

  const hasPool = myPoolId !== null;

  const handlePoolCreated = () => {
    setActiveTab("my-pool");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Store className="w-6 h-6 text-cyan-400" />
            Pool Marketplace
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Form compute collectives and bid on large inference jobs
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <MarketplaceTabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPool={hasPool}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "discover" && <PoolDiscovery />}
          {activeTab === "jobs" && <LargeJobs />}
          {activeTab === "my-pool" && <MyPool />}
          {activeTab === "create" && <CreatePool onCreated={handlePoolCreated} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
