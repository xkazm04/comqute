import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ComputePool,
  PoolStatus,
  PoolMember,
  PoolBid,
  LargeInferenceJob,
  CreatePoolRequest,
  JoinPoolRequest,
  ProfitSharingConfig,
  LoadBalancingStrategy,
  PoolTier,
} from "@/types";
import { generateId, generateMockAddress } from "@/lib/mock-utils";
import { calculatePoolTier, TIER_PRICE_MULTIPLIERS } from "@/types/pool";
import { SUPPORTED_MODELS } from "@/lib/models";

// Mock pool data for demonstration
const MOCK_POOLS: ComputePool[] = [
  {
    id: "pool-alpha",
    name: "Alpha Compute Collective",
    description: "High-performance GPU cluster specializing in large language model inference. Our collective maintains 99.9% uptime with industry-leading response times.",
    owner: generateMockAddress(),
    status: "active",
    tier: "gold",
    members: [
      {
        workerId: "w1",
        address: generateMockAddress(),
        name: "GPU Master",
        role: "owner",
        reputation: 95,
        contributionShare: 40,
        totalEarnings: 15000000,
        jobsCompleted: 1250,
        joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 60000,
        isOnline: true,
      },
      {
        workerId: "w2",
        address: generateMockAddress(),
        name: "Compute Node 1",
        role: "member",
        reputation: 88,
        contributionShare: 30,
        totalEarnings: 11000000,
        jobsCompleted: 980,
        joinedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 120000,
        isOnline: true,
      },
      {
        workerId: "w3",
        address: generateMockAddress(),
        name: "Compute Node 2",
        role: "member",
        reputation: 82,
        contributionShare: 30,
        totalEarnings: 9500000,
        jobsCompleted: 820,
        joinedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 3600000,
        isOnline: false,
      },
    ],
    stats: {
      totalJobs: 3050,
      completedJobs: 3000,
      failedJobs: 50,
      totalEarnings: 35500000,
      avgResponseTime: 2800,
      successRate: 98.4,
      avgReputation: 88,
      totalComputePower: 72,
      uptime: 99.2,
    },
    profitSharing: {
      model: "reputation_weighted",
      ownerFee: 5,
      adminFee: 2,
      reserveFund: 3,
    },
    loadBalancing: "reputation_first",
    supportedModels: SUPPORTED_MODELS.map((m) => m.id),
    minReputation: 70,
    maxMembers: 10,
    currentBids: [],
    activeJobs: [],
    treasury: 2500000,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "pool-nova",
    name: "Nova Processing Network",
    description: "Enterprise-grade compute pool with premium SLA guarantees. Specializing in time-critical inference workloads with guaranteed latency.",
    owner: generateMockAddress(),
    status: "active",
    tier: "platinum",
    members: [
      {
        workerId: "w4",
        address: generateMockAddress(),
        name: "Nova Prime",
        role: "owner",
        reputation: 98,
        contributionShare: 35,
        totalEarnings: 28000000,
        jobsCompleted: 2100,
        joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 30000,
        isOnline: true,
      },
      {
        workerId: "w5",
        address: generateMockAddress(),
        name: "Nova Cluster A",
        role: "admin",
        reputation: 94,
        contributionShare: 25,
        totalEarnings: 21000000,
        jobsCompleted: 1650,
        joinedAt: Date.now() - 55 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 45000,
        isOnline: true,
      },
      {
        workerId: "w6",
        address: generateMockAddress(),
        name: "Nova Cluster B",
        role: "member",
        reputation: 91,
        contributionShare: 20,
        totalEarnings: 18500000,
        jobsCompleted: 1400,
        joinedAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 60000,
        isOnline: true,
      },
      {
        workerId: "w7",
        address: generateMockAddress(),
        name: "Nova Cluster C",
        role: "member",
        reputation: 89,
        contributionShare: 20,
        totalEarnings: 16000000,
        jobsCompleted: 1200,
        joinedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 90000,
        isOnline: true,
      },
    ],
    stats: {
      totalJobs: 6350,
      completedJobs: 6300,
      failedJobs: 50,
      totalEarnings: 83500000,
      avgResponseTime: 1800,
      successRate: 99.2,
      avgReputation: 93,
      totalComputePower: 128,
      uptime: 99.8,
    },
    profitSharing: {
      model: "contribution_weighted",
      ownerFee: 8,
      adminFee: 4,
      reserveFund: 5,
    },
    loadBalancing: "fastest_response",
    supportedModels: SUPPORTED_MODELS.map((m) => m.id),
    minReputation: 80,
    maxMembers: 15,
    currentBids: [],
    activeJobs: [],
    treasury: 8500000,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: "pool-genesis",
    name: "Genesis Starter Pool",
    description: "Beginner-friendly pool for new workers to build reputation. Lower barriers to entry with mentorship from experienced operators.",
    owner: generateMockAddress(),
    status: "forming",
    tier: "bronze",
    members: [
      {
        workerId: "w8",
        address: generateMockAddress(),
        name: "Genesis Lead",
        role: "owner",
        reputation: 75,
        contributionShare: 50,
        totalEarnings: 2500000,
        jobsCompleted: 320,
        joinedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 180000,
        isOnline: true,
      },
      {
        workerId: "w9",
        address: generateMockAddress(),
        name: "New Worker 1",
        role: "member",
        reputation: 45,
        contributionShare: 50,
        totalEarnings: 850000,
        jobsCompleted: 95,
        joinedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 300000,
        isOnline: false,
      },
    ],
    stats: {
      totalJobs: 415,
      completedJobs: 380,
      failedJobs: 35,
      totalEarnings: 3350000,
      avgResponseTime: 5200,
      successRate: 91.6,
      avgReputation: 60,
      totalComputePower: 32,
      uptime: 85.5,
    },
    profitSharing: {
      model: "equal",
      ownerFee: 3,
      adminFee: 0,
      reserveFund: 2,
    },
    loadBalancing: "round_robin",
    supportedModels: SUPPORTED_MODELS.slice(0, 2).map((m) => m.id),
    minReputation: 0,
    maxMembers: 5,
    currentBids: [],
    activeJobs: [],
    treasury: 450000,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7200000,
  },
];

// Mock large jobs
const MOCK_LARGE_JOBS: LargeInferenceJob[] = [
  {
    id: "job-large-1",
    modelId: "llama3-70b",
    prompt: "Analyze the complete works of Shakespeare and provide a comprehensive thematic analysis across all plays and sonnets...",
    systemPrompt: "You are a literary scholar specializing in Elizabethan literature.",
    parameters: {
      maxTokens: 8000,
      temperature: 0.7,
      topP: 0.9,
      batchSize: 4,
    },
    requester: generateMockAddress(),
    minPoolTier: "gold",
    maxBudget: 50000000,
    deadline: Date.now() + 3600000,
    status: "bidding",
    bids: [],
    createdAt: Date.now() - 600000,
  },
  {
    id: "job-large-2",
    modelId: "mistral-7b",
    prompt: "Generate a comprehensive business plan for a sustainable technology startup including market analysis, financial projections, and growth strategy...",
    parameters: {
      maxTokens: 5000,
      temperature: 0.8,
      topP: 0.95,
    },
    requester: generateMockAddress(),
    minPoolTier: "silver",
    maxBudget: 25000000,
    deadline: Date.now() + 7200000,
    status: "open",
    bids: [],
    createdAt: Date.now() - 1200000,
  },
];

interface PoolState {
  pools: ComputePool[];
  largeJobs: LargeInferenceJob[];
  myPoolId: string | null;
  isLoading: boolean;

  // Pool management
  initializePools: () => void;
  createPool: (request: CreatePoolRequest) => ComputePool;
  joinPool: (request: JoinPoolRequest) => boolean;
  leavePool: (poolId: string, workerId: string) => void;
  dissolvePool: (poolId: string) => void;

  // Pool discovery
  getPoolById: (id: string) => ComputePool | undefined;
  getPoolsByTier: (tier: PoolTier) => ComputePool[];
  getActivePools: () => ComputePool[];
  getFormingPools: () => ComputePool[];
  searchPools: (query: string) => ComputePool[];

  // Bidding
  submitBid: (poolId: string, jobId: string, priceQuote: number, estimatedTime: number) => PoolBid;
  acceptBid: (jobId: string, bidId: string) => void;

  // Job management
  getLargeJobs: () => LargeInferenceJob[];
  getOpenJobs: () => LargeInferenceJob[];
  getJobById: (jobId: string) => LargeInferenceJob | undefined;

  // Pricing
  calculatePoolPrice: (poolId: string, basePrice: number) => number;

  // Member management
  updateMemberOnlineStatus: (poolId: string, workerId: string, isOnline: boolean) => void;
  updateProfitSharing: (poolId: string, config: ProfitSharingConfig) => void;
  updateLoadBalancing: (poolId: string, strategy: LoadBalancingStrategy) => void;

  // Stats
  refreshPoolStats: (poolId: string) => void;
}

export const usePoolStore = create<PoolState>()(
  persist(
    (set, get) => ({
      pools: [],
      largeJobs: [],
      myPoolId: null,
      isLoading: false,

      initializePools: () => {
        const existingPools = get().pools;
        if (existingPools.length === 0) {
          set({ pools: MOCK_POOLS, largeJobs: MOCK_LARGE_JOBS });
        }
      },

      createPool: (request: CreatePoolRequest) => {
        const newPool: ComputePool = {
          id: `pool-${generateId()}`,
          name: request.name,
          description: request.description,
          owner: request.owner,
          status: "forming",
          tier: "bronze",
          members: [],
          stats: {
            totalJobs: 0,
            completedJobs: 0,
            failedJobs: 0,
            totalEarnings: 0,
            avgResponseTime: 0,
            successRate: 0,
            avgReputation: 0,
            totalComputePower: 0,
            uptime: 0,
          },
          profitSharing: request.profitSharing,
          loadBalancing: request.loadBalancing,
          supportedModels: request.supportedModels,
          minReputation: request.minReputation,
          maxMembers: request.maxMembers,
          currentBids: [],
          activeJobs: [],
          treasury: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          pools: [...state.pools, newPool],
          myPoolId: newPool.id,
        }));

        return newPool;
      },

      joinPool: (request: JoinPoolRequest) => {
        const pool = get().getPoolById(request.poolId);
        if (!pool) return false;
        if (pool.members.length >= pool.maxMembers) return false;
        if (request.reputation < pool.minReputation) return false;

        const newMember: PoolMember = {
          workerId: request.workerId,
          address: request.address,
          name: request.name,
          role: "member",
          reputation: request.reputation,
          contributionShare: 0, // Will be recalculated
          totalEarnings: 0,
          jobsCompleted: 0,
          joinedAt: Date.now(),
          lastActiveAt: Date.now(),
          isOnline: true,
        };

        set((state) => ({
          pools: state.pools.map((p) => {
            if (p.id !== request.poolId) return p;

            const updatedMembers = [...p.members, newMember];
            // Recalculate contribution shares equally for now
            const sharePerMember = 100 / updatedMembers.length;
            const membersWithShares = updatedMembers.map((m) => ({
              ...m,
              contributionShare: sharePerMember,
            }));

            // Recalculate average reputation
            const avgReputation =
              membersWithShares.reduce((sum, m) => sum + m.reputation, 0) /
              membersWithShares.length;

            return {
              ...p,
              members: membersWithShares,
              tier: calculatePoolTier(avgReputation),
              stats: {
                ...p.stats,
                avgReputation: Math.round(avgReputation),
              },
              updatedAt: Date.now(),
            };
          }),
          myPoolId: request.poolId,
        }));

        return true;
      },

      leavePool: (poolId: string, workerId: string) => {
        set((state) => ({
          pools: state.pools.map((p) => {
            if (p.id !== poolId) return p;

            const updatedMembers = p.members.filter((m) => m.workerId !== workerId);
            if (updatedMembers.length === 0) {
              return { ...p, status: "dissolved" as PoolStatus };
            }

            // Recalculate shares
            const sharePerMember = 100 / updatedMembers.length;
            const membersWithShares = updatedMembers.map((m) => ({
              ...m,
              contributionShare: sharePerMember,
            }));

            const avgReputation =
              membersWithShares.reduce((sum, m) => sum + m.reputation, 0) /
              membersWithShares.length;

            return {
              ...p,
              members: membersWithShares,
              tier: calculatePoolTier(avgReputation),
              stats: {
                ...p.stats,
                avgReputation: Math.round(avgReputation),
              },
              updatedAt: Date.now(),
            };
          }),
          myPoolId: state.myPoolId === poolId ? null : state.myPoolId,
        }));
      },

      dissolvePool: (poolId: string) => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId
              ? { ...p, status: "dissolved" as PoolStatus, updatedAt: Date.now() }
              : p
          ),
          myPoolId: state.myPoolId === poolId ? null : state.myPoolId,
        }));
      },

      getPoolById: (id: string) => {
        return get().pools.find((p) => p.id === id);
      },

      getPoolsByTier: (tier: PoolTier) => {
        return get().pools.filter((p) => p.tier === tier && p.status !== "dissolved");
      },

      getActivePools: () => {
        return get().pools.filter((p) => p.status === "active");
      },

      getFormingPools: () => {
        return get().pools.filter((p) => p.status === "forming");
      },

      searchPools: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().pools.filter(
          (p) =>
            p.status !== "dissolved" &&
            (p.name.toLowerCase().includes(lowerQuery) ||
              p.description.toLowerCase().includes(lowerQuery))
        );
      },

      submitBid: (poolId: string, jobId: string, priceQuote: number, estimatedTime: number) => {
        const pool = get().getPoolById(poolId);
        if (!pool) throw new Error("Pool not found");

        const onlineMembers = pool.members.filter((m) => m.isOnline);
        const bid: PoolBid = {
          id: `bid-${generateId()}`,
          poolId,
          jobId,
          priceQuote,
          estimatedTime,
          assignedMembers: onlineMembers.map((m) => m.workerId),
          status: "pending",
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
        };

        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId
              ? { ...p, currentBids: [...p.currentBids, bid], updatedAt: Date.now() }
              : p
          ),
          largeJobs: state.largeJobs.map((j) =>
            j.id === jobId
              ? { ...j, bids: [...j.bids, bid], status: "bidding" as const }
              : j
          ),
        }));

        return bid;
      },

      acceptBid: (jobId: string, bidId: string) => {
        set((state) => ({
          largeJobs: state.largeJobs.map((j) => {
            if (j.id !== jobId) return j;
            const acceptedBid = j.bids.find((b) => b.id === bidId);
            if (!acceptedBid) return j;
            return {
              ...j,
              status: "assigned" as const,
              acceptedBid: { ...acceptedBid, status: "accepted" as const },
              bids: j.bids.map((b) =>
                b.id === bidId
                  ? { ...b, status: "accepted" as const }
                  : { ...b, status: "rejected" as const }
              ),
            };
          }),
        }));
      },

      getLargeJobs: () => get().largeJobs,

      getOpenJobs: () => {
        return get().largeJobs.filter((j) => j.status === "open" || j.status === "bidding");
      },

      getJobById: (jobId: string) => {
        return get().largeJobs.find((j) => j.id === jobId);
      },

      calculatePoolPrice: (poolId: string, basePrice: number) => {
        const pool = get().getPoolById(poolId);
        if (!pool) return basePrice;

        const multiplier = TIER_PRICE_MULTIPLIERS[pool.tier];
        return Math.ceil(basePrice * multiplier);
      },

      updateMemberOnlineStatus: (poolId: string, workerId: string, isOnline: boolean) => {
        set((state) => ({
          pools: state.pools.map((p) => {
            if (p.id !== poolId) return p;
            return {
              ...p,
              members: p.members.map((m) =>
                m.workerId === workerId
                  ? { ...m, isOnline, lastActiveAt: Date.now() }
                  : m
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      updateProfitSharing: (poolId: string, config: ProfitSharingConfig) => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId
              ? { ...p, profitSharing: config, updatedAt: Date.now() }
              : p
          ),
        }));
      },

      updateLoadBalancing: (poolId: string, strategy: LoadBalancingStrategy) => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId
              ? { ...p, loadBalancing: strategy, updatedAt: Date.now() }
              : p
          ),
        }));
      },

      refreshPoolStats: (poolId: string) => {
        // In a real implementation, this would fetch from the blockchain
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId ? { ...p, updatedAt: Date.now() } : p
          ),
        }));
      },
    }),
    {
      name: "qubic-pool-storage",
      partialize: (state) => ({
        pools: state.pools,
        largeJobs: state.largeJobs,
        myPoolId: state.myPoolId,
      }),
    }
  )
);
