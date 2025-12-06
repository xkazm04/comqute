// Pool status
export type PoolStatus = "active" | "forming" | "paused" | "dissolved";

// Pool tier based on combined reputation
export type PoolTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

// Member role within a pool
export type PoolMemberRole = "owner" | "admin" | "member";

// Pool member
export interface PoolMember {
  workerId: string;
  address: string;
  name: string;
  role: PoolMemberRole;
  reputation: number;
  contributionShare: number; // Percentage (0-100)
  totalEarnings: number; // QUBIC earned in this pool
  jobsCompleted: number;
  joinedAt: number;
  lastActiveAt: number;
  isOnline: boolean;
}

// Pool statistics
export interface PoolStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalEarnings: number; // QUBIC
  avgResponseTime: number; // ms
  successRate: number; // 0-100
  avgReputation: number; // weighted by contribution
  totalComputePower: number; // combined VRAM in GB
  uptime: number; // percentage
}

// Profit sharing configuration
export interface ProfitSharingConfig {
  model: "equal" | "reputation_weighted" | "contribution_weighted" | "custom";
  ownerFee: number; // percentage (0-20 max)
  adminFee: number; // percentage (0-10 max)
  reserveFund: number; // percentage for pool treasury
  customShares?: Record<string, number>; // worker address -> share percentage
}

// Job bid from pool
export interface PoolBid {
  id: string;
  poolId: string;
  jobId: string;
  priceQuote: number; // QUBIC
  estimatedTime: number; // ms
  assignedMembers: string[]; // worker IDs
  status: "pending" | "accepted" | "rejected" | "completed" | "failed";
  createdAt: number;
  expiresAt: number;
}

// Large inference job
export interface LargeInferenceJob {
  id: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters: {
    maxTokens: number;
    temperature: number;
    topP: number;
    batchSize?: number;
  };
  requester: string;
  minPoolTier: PoolTier;
  maxBudget: number; // QUBIC
  deadline: number; // timestamp
  status: "open" | "bidding" | "assigned" | "running" | "complete" | "failed";
  acceptedBid?: PoolBid;
  bids: PoolBid[];
  createdAt: number;
}

// Pool load balancing strategy
export type LoadBalancingStrategy =
  | "round_robin"
  | "least_busy"
  | "reputation_first"
  | "fastest_response"
  | "random";

// Main pool interface
export interface ComputePool {
  id: string;
  name: string;
  description: string;
  owner: string; // wallet address
  status: PoolStatus;
  tier: PoolTier;
  members: PoolMember[];
  stats: PoolStats;
  profitSharing: ProfitSharingConfig;
  loadBalancing: LoadBalancingStrategy;
  supportedModels: string[];
  minReputation: number; // minimum reputation to join (0-100)
  maxMembers: number;
  currentBids: PoolBid[];
  activeJobs: string[];
  treasury: number; // pool reserve fund in QUBIC
  createdAt: number;
  updatedAt: number;
}

// Pool creation request
export interface CreatePoolRequest {
  name: string;
  description: string;
  owner: string;
  supportedModels: string[];
  minReputation: number;
  maxMembers: number;
  profitSharing: ProfitSharingConfig;
  loadBalancing: LoadBalancingStrategy;
}

// Join pool request
export interface JoinPoolRequest {
  poolId: string;
  workerId: string;
  address: string;
  name: string;
  reputation: number;
}

// Pool pricing multiplier based on tier
export const TIER_PRICE_MULTIPLIERS: Record<PoolTier, number> = {
  bronze: 1.0,
  silver: 1.15,
  gold: 1.3,
  platinum: 1.5,
  diamond: 2.0,
};

// Tier thresholds based on average reputation
export const TIER_THRESHOLDS: Record<PoolTier, number> = {
  bronze: 0,
  silver: 50,
  gold: 70,
  platinum: 85,
  diamond: 95,
};

// Calculate pool tier from average reputation
export function calculatePoolTier(avgReputation: number): PoolTier {
  if (avgReputation >= TIER_THRESHOLDS.diamond) return "diamond";
  if (avgReputation >= TIER_THRESHOLDS.platinum) return "platinum";
  if (avgReputation >= TIER_THRESHOLDS.gold) return "gold";
  if (avgReputation >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

// Get tier display info
export function getTierInfo(tier: PoolTier): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const tierInfo: Record<PoolTier, { label: string; color: string; bgColor: string; borderColor: string }> = {
    bronze: {
      label: "Bronze",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    silver: {
      label: "Silver",
      color: "text-zinc-400",
      bgColor: "bg-zinc-400/10",
      borderColor: "border-zinc-400/30",
    },
    gold: {
      label: "Gold",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/30",
    },
    platinum: {
      label: "Platinum",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/30",
    },
    diamond: {
      label: "Diamond",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
    },
  };
  return tierInfo[tier];
}
