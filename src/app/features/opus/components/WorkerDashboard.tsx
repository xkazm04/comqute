"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Power,
  Cpu,
  HardDrive,
  Activity,
  Coins,
  Clock,
  Star,
  Zap,
  Play,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Network,
  Settings,
  Server,
  UserPlus,
} from "lucide-react";
import { GlassCard } from "./Layout";
import { WorkerFlowDiagram } from "./FlowDiagram";
import { WorkerOnboarding } from "./WorkerOnboarding";
import { useWorker } from "@/hooks";
import { useInference } from "@/hooks";
import { formatQubic, formatDuration, formatRelativeTime } from "@/lib/mock-utils";
import { getModelById, SUPPORTED_MODELS } from "@/lib/models";
import type { Job } from "@/types";

// ============================================================================
// TAB SWITCHER
// ============================================================================

type WorkerTab = "manage" | "onboarding";

function WorkerTabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: WorkerTab;
  onTabChange: (tab: WorkerTab) => void;
}) {
  const tabs = [
    { id: "manage" as WorkerTab, label: "Worker Node", icon: Network, description: "Manage active worker" },
    { id: "onboarding" as WorkerTab, label: "Setup Wizard", icon: UserPlus, description: "Register new worker" },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
// STAT ITEM (non-glass)
// ============================================================================

function StatItem({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: typeof Coins;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-[10px] text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// WORKER STATUS TOGGLE (non-glass, prominent)
// ============================================================================

function WorkerStatusToggle({
  status,
  onToggle,
}: {
  status: "online" | "busy" | "offline";
  onToggle: () => void;
}) {
  const isOnline = status !== "offline";
  const isBusy = status === "busy";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isOnline ? "bg-emerald-500/20" : "bg-zinc-800"
        }`}>
          <Power className={`w-6 h-6 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {isBusy ? "Processing Job" : isOnline ? "Online" : "Offline"}
          </h3>
          <p className="text-xs text-zinc-500">
            {isBusy ? "Currently processing with Ollama" : isOnline ? "Ready to claim jobs" : "Not accepting jobs"}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        disabled={isBusy}
        className={`
          relative w-14 h-7 rounded-full transition-colors
          ${isOnline ? "bg-emerald-500" : "bg-zinc-700"}
          ${isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
          animate={{ left: isOnline ? 32 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// ============================================================================
// HARDWARE INFO (non-glass, inline)
// ============================================================================

function HardwareRow({ icon: Icon, label, value, color }: {
  icon: typeof Cpu;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <span className="text-xs text-zinc-300">{value}</span>
    </div>
  );
}

// ============================================================================
// PENDING JOB ROW (non-glass)
// ============================================================================

function PendingJobRow({
  job,
  onClaim,
  isProcessing,
}: {
  job: Job;
  onClaim: () => void;
  isProcessing: boolean;
}) {
  const model = getModelById(job.modelId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20">
            Pending
          </span>
          <span className="text-[10px] text-zinc-500">{model?.displayName}</span>
        </div>
        <p className="text-sm text-zinc-300 truncate">
          {job.prompt.slice(0, 60)}{job.prompt.length > 60 ? "..." : ""}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
          <span>{formatRelativeTime(job.createdAt)}</span>
          <span className="text-emerald-400">{formatQubic(job.estimatedCost)} QUBIC</span>
        </div>
      </div>

      <motion.button
        onClick={onClaim}
        disabled={isProcessing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
        Claim & Process
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// CURRENT JOB PANEL (Glass - processing with Ollama)
// ============================================================================

function CurrentJobPanel({ job }: { job: Job }) {
  const model = getModelById(job.modelId);
  const { output, isStreaming, tokenCount } = useInference();

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
          <div>
            <h3 className="font-medium text-white">Processing with Ollama</h3>
            <p className="text-xs text-zinc-500">{model?.displayName} • {model?.ollamaName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-emerald-400 font-medium">
            {formatQubic(job.estimatedCost)} QUBIC
          </p>
          <p className="text-[10px] text-zinc-500">{tokenCount} tokens generated</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <p className="text-[10px] text-zinc-500 mb-1">Prompt</p>
        <p className="text-sm text-zinc-300">{job.prompt}</p>
      </div>

      {(output || isStreaming) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <p className="text-[10px] text-zinc-500">Ollama Response (Streaming)</p>
          </div>
          <div className="max-h-[200px] overflow-y-auto rounded-lg bg-black/50 p-3 border border-zinc-800 font-mono text-sm">
            <p className="text-emerald-400 whitespace-pre-wrap">
              {output}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
              )}
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ============================================================================
// AUTO CLAIM TOGGLE (non-glass)
// ============================================================================

function AutoClaimToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
      <div className="flex items-center gap-2">
        <Zap className={`w-4 h-4 ${enabled ? "text-amber-400" : "text-zinc-500"}`} />
        <div>
          <p className="text-sm text-white">Auto-claim</p>
          <p className="text-[10px] text-zinc-500">Auto claim & process jobs</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative w-10 h-5 rounded-full transition-colors
          ${enabled ? "bg-amber-500" : "bg-zinc-700"}
        `}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
          animate={{ left: enabled ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// ============================================================================
// MODEL FILTER SELECTOR
// ============================================================================

function ModelFilterSelector({
  selectedModels,
  onToggle,
}: {
  selectedModels: string[];
  onToggle: (modelId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {SUPPORTED_MODELS.map((model) => {
        const isSelected = selectedModels.includes(model.id);
        return (
          <button
            key={model.id}
            onClick={() => onToggle(model.id)}
            className={`
              w-full flex items-center justify-between p-2 rounded-lg transition-all
              ${isSelected
                ? "bg-cyan-500/10 border border-cyan-500/30"
                : "bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700"
              }
            `}
          >
            <span className={`text-sm ${isSelected ? "text-cyan-400" : "text-zinc-400"}`}>
              {model.displayName}
            </span>
            {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// WORKER MANAGEMENT CONTENT
// ============================================================================

function WorkerManagement() {
  const {
    worker,
    isAutoClaimEnabled,
    pendingJobs,
    currentJob,
    isProcessing,
    initializeWorker,
    goOnline,
    goOffline,
    toggleAutoClaim,
    claimJob,
  } = useWorker();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeWorker();
  }, [initializeWorker]);

  const handleToggleStatus = () => {
    if (worker?.status === "offline") {
      goOnline();
    } else {
      goOffline();
    }
  };

  const handleClaimJob = async (jobId: string) => {
    // This will claim the job AND process it with Ollama
    await claimJob(jobId);
  };

  if (!worker) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flow Diagram - Educational */}
      <WorkerFlowDiagram />

      {/* Status Toggle */}
      <WorkerStatusToggle
        status={worker.status}
        onToggle={handleToggleStatus}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          icon={CheckCircle}
          label="Jobs Completed"
          value={worker.stats.jobsCompleted}
          color="bg-emerald-500/20"
        />
        <StatItem
          icon={Coins}
          label="Total Earnings"
          value={formatQubic(worker.stats.totalEarnings)}
          color="bg-amber-500/20"
        />
        <StatItem
          icon={Clock}
          label="Avg Response"
          value={worker.stats.avgResponseTime > 0 ? formatDuration(worker.stats.avgResponseTime) : "—"}
          color="bg-blue-500/20"
        />
        <StatItem
          icon={Star}
          label="Reputation"
          value={`${worker.stats.reputation.toFixed(0)}/100`}
          color="bg-purple-500/20"
        />
      </div>

      {/* Current Job - Glass Card (processing with Ollama) */}
      {currentJob && <CurrentJobPanel job={currentJob} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Jobs - Glass Card (larger) */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Available Jobs
                {pendingJobs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/10 text-amber-400">
                    {pendingJobs.length}
                  </span>
                )}
              </h3>
              <AutoClaimToggle enabled={isAutoClaimEnabled} onToggle={toggleAutoClaim} />
            </div>

            {worker.status === "offline" ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-10 h-10 text-amber-400/30 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Go online to see available jobs</p>
              </div>
            ) : pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No jobs in queue</p>
                <p className="text-zinc-600 text-xs mt-1">Jobs from requesters will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {pendingJobs.slice(0, 5).map((job) => (
                    <PendingJobRow
                      key={job.id}
                      job={job}
                      onClaim={() => handleClaimJob(job.id)}
                      isProcessing={isProcessing}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Hardware */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Hardware
            </h3>
            <div className="divide-y divide-zinc-800/50">
              <HardwareRow icon={Cpu} label="GPU" value={worker.hardware.gpu} color="text-blue-400" />
              <HardwareRow icon={HardDrive} label="VRAM" value={`${worker.hardware.vram} GB`} color="text-purple-400" />
              <HardwareRow icon={Activity} label="CPU" value={worker.hardware.cpu} color="text-emerald-400" />
              <HardwareRow icon={HardDrive} label="RAM" value={`${worker.hardware.ram} GB`} color="text-amber-400" />
            </div>
          </div>

          {/* Ollama Connection */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Ollama Connection
            </h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-zinc-500">Status</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-zinc-500">Endpoint</span>
              <span className="text-xs text-zinc-300 font-mono">localhost:11434</span>
            </div>
          </div>

          {/* Supported Models */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Accept Models
            </h3>
            <div className="space-y-2">
              {worker.supportedModels.map((modelId) => {
                const model = getModelById(modelId);
                return (
                  <div key={modelId} className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-300">{model?.displayName || modelId}</span>
                    <span className="text-xs text-emerald-400">Ready</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD WITH TABS
// ============================================================================

export function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState<WorkerTab>("manage");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Network className="w-6 h-6 text-cyan-400" />
            Worker
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {activeTab === "manage"
              ? "Claim jobs, process with Ollama, and earn QUBIC"
              : "Register a new worker node on the network"
            }
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <WorkerTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "manage" ? <WorkerManagement /> : <WorkerOnboarding />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
