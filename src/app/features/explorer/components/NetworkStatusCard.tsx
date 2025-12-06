"use client";

import { Globe, Server, Cpu, Zap, Clock, CheckCircle } from "lucide-react";
import { InfoRow } from "../../opus/shared";
import { formatDuration } from "@/lib/mock-utils";

// ============================================================================
// NETWORK STATUS CARD
// ============================================================================

interface NetworkStatusCardProps {
  isOllamaOnline: boolean;
  availableModels: number;
  avgResponseTime: number;
  successRate: string;
}

export function NetworkStatusCard({
  isOllamaOnline,
  availableModels,
  avgResponseTime,
  successRate,
}: NetworkStatusCardProps) {
  return (
    <div className="p-[var(--space-6)] rounded-xl bg-zinc-900/30 border border-zinc-800/50">
      <h3 className="heading-tertiary text-white mb-[var(--space-4)] flex items-center gap-[var(--space-2)]">
        <Globe className="w-4 h-4 text-blue-400" />
        Network Status
      </h3>
      <div className="divide-y divide-zinc-800/50">
        <InfoRow
          icon={Server}
          label="Ollama Node"
          value={isOllamaOnline ? "Online" : "Offline"}
          status={isOllamaOnline ? "online" : "offline"}
          color="text-emerald-400"
          data-testid="network-status-ollama"
        />
        <InfoRow
          icon={Cpu}
          label="Available Models"
          value={`${availableModels}`}
          color="text-purple-400"
          data-testid="network-status-models"
        />
        <InfoRow
          icon={Zap}
          label="Tick Rate"
          value="2s"
          color="text-amber-400"
          data-testid="network-status-tick-rate"
        />
        <InfoRow
          icon={Clock}
          label="Avg Response"
          value={avgResponseTime > 0 ? formatDuration(avgResponseTime) : "—"}
          color="text-blue-400"
          data-testid="network-status-avg-response"
        />
        <InfoRow
          icon={CheckCircle}
          label="Success Rate"
          value={successRate}
          color="text-cyan-400"
          data-testid="network-status-success-rate"
        />
      </div>
    </div>
  );
}
