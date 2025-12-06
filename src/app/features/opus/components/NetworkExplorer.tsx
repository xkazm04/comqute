"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Globe,
  Cpu,
  Coins,
  Clock,
  Server,
  CheckCircle,
  Loader2,
  TrendingUp,
  Zap,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "./Layout";
import { useJobStore } from "@/stores";
import { useHealth } from "@/hooks";
import { getModelById, SUPPORTED_MODELS } from "@/lib/models";
import { formatQubic, formatRelativeTime, formatAddress, formatDuration } from "@/lib/mock-utils";
import type { Job, JobStatus } from "@/types";

// ============================================================================
// STAT CARD (non-glass)
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${!trend.positive ? "rotate-180" : ""}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS DOT
// ============================================================================

function StatusDot({ status }: { status: JobStatus }) {
  const colors: Record<JobStatus, string> = {
    pending: "bg-amber-400",
    assigned: "bg-blue-400",
    running: "bg-blue-400",
    streaming: "bg-cyan-400",
    complete: "bg-emerald-400",
    failed: "bg-red-400",
    cancelled: "bg-zinc-400",
  };

  const isAnimating = ["assigned", "running", "streaming"].includes(status);

  return (
    <div className="relative">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
      {isAnimating && (
        <motion.div
          className={`absolute inset-0 rounded-full ${colors[status]}`}
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// ============================================================================
// LIVE JOB ROW (non-glass)
// ============================================================================

function LiveJobRow({ job }: { job: Job }) {
  return (
    <Link href={`/opus/job/${job.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all group cursor-pointer"
      >
        <StatusDot status={job.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">
            {job.prompt.slice(0, 40)}{job.prompt.length > 40 ? "..." : ""}
          </p>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:block">
          {getModelById(job.modelId)?.displayName}
        </span>
        <span className="text-[10px] text-zinc-500">{formatRelativeTime(job.createdAt)}</span>
        {job.actualCost && (
          <span className="text-[10px] text-emerald-400">{formatQubic(job.actualCost)}</span>
        )}
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </motion.div>
    </Link>
  );
}

// ============================================================================
// MODEL BAR (non-glass)
// ============================================================================

function ModelBar({ model, jobs, maxJobs }: { model: typeof SUPPORTED_MODELS[0]; jobs: Job[]; maxJobs: number }) {
  const modelJobs = jobs.filter((j) => j.modelId === model.id);
  const completed = modelJobs.filter((j) => j.status === "complete").length;
  const percentage = maxJobs > 0 ? (completed / maxJobs) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{model.displayName}</span>
        <span className="text-[10px] text-zinc-500">{completed} completed</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// NETWORK STATUS INDICATOR (non-glass)
// ============================================================================

function NetworkStatusRow({ icon: Icon, label, value, status, color }: {
  icon: typeof Server;
  label: string;
  value: string;
  status?: "online" | "offline";
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {status && (
          <div className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-emerald-400" : "bg-red-400"}`} />
        )}
        <span className={`text-xs ${status === "online" ? "text-emerald-400" : status === "offline" ? "text-red-400" : "text-zinc-300"}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// JOB DISTRIBUTION BAR
// ============================================================================

function JobDistributionBar({ jobs }: { jobs: Job[] }) {
  const statusCounts = {
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => ["assigned", "running", "streaming"].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === "complete").length,
    failed: jobs.filter((j) => j.status === "failed" || j.status === "cancelled").length,
  };

  const total = jobs.length || 1;

  return (
    <div className="space-y-3">
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
        {statusCounts.completed > 0 && (
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.completed / total) * 100}%` }}
          />
        )}
        {statusCounts.processing > 0 && (
          <motion.div
            className="h-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.processing / total) * 100}%` }}
          />
        )}
        {statusCounts.pending > 0 && (
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.pending / total) * 100}%` }}
          />
        )}
        {statusCounts.failed > 0 && (
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${(statusCounts.failed / total) * 100}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-500">{statusCounts.completed} complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="text-zinc-500">{statusCounts.processing} processing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-zinc-500">{statusCounts.pending} pending</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPLORER
// ============================================================================

export function NetworkExplorer() {
  const { jobs } = useJobStore();
  const { isOllamaOnline, health } = useHealth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const completedJobs = jobs.filter((j) => j.status === "complete");
  const totalTokens = completedJobs.reduce((sum, j) => sum + j.outputTokens, 0);
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.actualCost || 0), 0);
  const avgResponseTime =
    completedJobs.length > 0
      ? completedJobs.reduce((sum, j) => sum + (j.completedAt! - j.createdAt), 0) / completedJobs.length
      : 0;

  const maxJobsPerModel = Math.max(...SUPPORTED_MODELS.map((m) =>
    jobs.filter((j) => j.modelId === m.id && j.status === "complete").length
  ), 1);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-cyan-400" />
            Network Explorer
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time network statistics and activity</p>
        </div>
        <motion.button
          onClick={handleRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors text-sm text-zinc-400"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Activity}
          label="Total Jobs"
          value={jobs.length}
          trend={{ value: 12, positive: true }}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedJobs.length}
          trend={{ value: 8, positive: true }}
          color="bg-emerald-500/20"
        />
        <StatCard
          icon={Zap}
          label="Tokens Generated"
          value={totalTokens.toLocaleString()}
          color="bg-purple-500/20"
        />
        <StatCard
          icon={Coins}
          label="Total Volume"
          value={formatQubic(totalEarnings)}
          trend={{ value: 15, positive: true }}
          color="bg-amber-500/20"
        />
      </div>

      {/* Live Activity - Glass Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Activity
          </h3>
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {jobs.slice(0, 8).map((job) => (
                <LiveJobRow key={job.id} job={job} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      {/* Model Performance & Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Performance - Glass Card */}
        <GlassCard>
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Model Performance
          </h3>
          <div className="space-y-4">
            {SUPPORTED_MODELS.map((model) => (
              <ModelBar key={model.id} model={model} jobs={jobs} maxJobs={maxJobsPerModel} />
            ))}
          </div>
        </GlassCard>

        {/* Network Status - Non-glass */}
        <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Network Status
          </h3>
          <div className="divide-y divide-zinc-800/50">
            <NetworkStatusRow
              icon={Server}
              label="Ollama Node"
              value={isOllamaOnline ? "Online" : "Offline"}
              status={isOllamaOnline ? "online" : "offline"}
              color="text-emerald-400"
            />
            <NetworkStatusRow
              icon={Cpu}
              label="Available Models"
              value={`${health?.availableModels?.length ?? 0}`}
              color="text-purple-400"
            />
            <NetworkStatusRow
              icon={Zap}
              label="Tick Rate"
              value="2s"
              color="text-amber-400"
            />
            <NetworkStatusRow
              icon={Clock}
              label="Avg Response"
              value={avgResponseTime > 0 ? formatDuration(avgResponseTime) : "—"}
              color="text-blue-400"
            />
            <NetworkStatusRow
              icon={CheckCircle}
              label="Success Rate"
              value={jobs.length > 0 ? `${((completedJobs.length / jobs.length) * 100).toFixed(0)}%` : "—"}
              color="text-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Job Distribution */}
      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Job Distribution
        </h3>
        <JobDistributionBar jobs={jobs} />
      </div>
    </div>
  );
}
