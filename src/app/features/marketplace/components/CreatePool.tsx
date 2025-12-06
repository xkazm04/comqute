"use client";

import { useState } from "react";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { GlassCard } from "../../opus/shared";
import { usePoolStore, useWalletStore } from "@/stores";
import type { ProfitSharingConfig, LoadBalancingStrategy } from "@/types";

// ============================================================================
// CREATE POOL
// ============================================================================

interface CreatePoolProps {
  onCreated: () => void;
}

export function CreatePool({ onCreated }: CreatePoolProps) {
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
