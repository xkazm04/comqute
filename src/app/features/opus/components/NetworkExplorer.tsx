"use client";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
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
  Zap,
  ChevronRight,
  RefreshCw,
  Map,
  List,
} from "lucide-react";
import { GlassCard, StatItem, EmptyStateIllustration, InfoRow } from "../shared";
import { useJobStore } from "@/stores";
import { useHealth } from "@/hooks";
import { getModelById, SUPPORTED_MODELS } from "@/lib/models";
import { formatQubic, formatRelativeTime, formatAddress, formatDuration } from "@/lib/mock-utils";
import type { Job, JobStatus } from "@/types";

// Lazy load the 3D globe for better initial load performance
const NetworkGlobe = lazy(() =>
  import("./NetworkGlobe").then((mod) => ({ default: mod.NetworkGlobe }))
);

// Globe loading fallback
function GlobeLoadingPlaceholder() {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="body-default text-zinc-400">Loading Network Globe...</span>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS DOT - With micro-interactions for status transitions
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
  const isError = status === "failed";

  // Spring bounce animation for status changes
  const bounceVariants = {
    initial: { scale: 1 },
    bounce: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 0.3,
        ease: "easeOut",
        times: [0, 0.5, 1],
      },
    },
  };

  // Shake animation for error states
  const shakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [-1, 1, -1, 1, 0],
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative" data-testid="status-dot">
      <motion.div
        className={`w-2 h-2 rounded-full ${colors[status]}`}
        initial="initial"
        animate={isError ? "shake" : "bounce"}
        variants={{ ...bounceVariants, ...shakeVariants }}
        key={status} // Re-animate on status change
        style={{
          transition: "background-color 200ms ease-out",
        }}
      />
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
    <Link href={`/opus/job/${job.id}`} data-testid={`live-job-row-${job.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all group cursor-pointer"
      >
        <StatusDot status={job.status} />
        <div className="flex-1 min-w-0">
          <p className="body-default text-zinc-300 truncate">
            {job.prompt.slice(0, 40)}{job.prompt.length > 40 ? "..." : ""}
          </p>
        </div>
        <span className="micro text-zinc-500 hidden sm:block">
          {getModelById(job.modelId)?.displayName}
        </span>
        <span className="micro text-zinc-500">{formatRelativeTime(job.createdAt)}</span>
        {job.actualCost && (
          <span className="micro text-emerald-400">{formatQubic(job.actualCost)}</span>
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
        <span className="body-default text-zinc-400">{model.displayName}</span>
        <span className="micro text-zinc-500">{completed} completed</span>
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
      <div className="flex items-center justify-between micro">
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
// VIEW TOGGLE
// ============================================================================

type ViewMode = "globe" | "list";

function ViewToggle({ view, onViewChange }: { view: ViewMode; onViewChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700" data-testid="network-view-toggle">
      <button
        onClick={() => onViewChange("globe")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md caption transition-colors ${
          view === "globe"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-zinc-400 hover:text-zinc-300"
        }`}
        data-testid="network-view-globe-btn"
      >
        <Map className="w-3.5 h-3.5" />
        Globe
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md caption transition-colors ${
          view === "list"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-zinc-400 hover:text-zinc-300"
        }`}
        data-testid="network-view-list-btn"
      >
        <List className="w-3.5 h-3.5" />
        List
      </button>
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
  const [viewMode, setViewMode] = useState<ViewMode>("globe");

  // Memoize derived job statistics to prevent redundant O(n) traversals per render
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === "complete"),
    [jobs]
  );

  const totalTokens = useMemo(
    () => completedJobs.reduce((sum, j) => sum + j.outputTokens, 0),
    [completedJobs]
  );

  const totalEarnings = useMemo(
    () => completedJobs.reduce((sum, j) => sum + (j.actualCost || 0), 0),
    [completedJobs]
  );

  const avgResponseTime = useMemo(() => {
    // Filter to only jobs with valid completedAt timestamps to prevent NaN propagation
    const jobsWithTimestamps = completedJobs.filter(
      (j): j is Job & { completedAt: number } => j.completedAt != null
    );
    if (jobsWithTimestamps.length === 0) return 0;
    return (
      jobsWithTimestamps.reduce((sum, j) => sum + (j.completedAt - j.createdAt), 0) /
      jobsWithTimestamps.length
    );
  }, [completedJobs]);

  const maxJobsPerModel = useMemo(
    () =>
      Math.max(
        ...SUPPORTED_MODELS.map((m) =>
          jobs.filter((j) => j.modelId === m.id && j.status === "complete").length
        ),
        1
      ),
    [jobs]
  );

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
    <div className="space-y-[var(--space-6)]" data-testid="network-explorer">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-primary text-white flex items-center gap-[var(--space-3)]">
            <Globe className="w-6 h-6 text-cyan-400" />
            Network Explorer
          </h1>
          <p className="text-zinc-500 body-default mt-1">Real-time network statistics and activity</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <motion.button
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors body-default text-zinc-400"
            data-testid="network-refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--space-3)]">
        <StatItem
          icon={Activity}
          label="Total Jobs"
          value={jobs.length}
          trend={{ value: 12, positive: true }}
          color="bg-blue-500/20"
          data-testid="stat-total-jobs"
        />
        <StatItem
          icon={CheckCircle}
          label="Completed"
          value={completedJobs.length}
          trend={{ value: 8, positive: true }}
          color="bg-emerald-500/20"
          data-testid="stat-completed"
        />
        <StatItem
          icon={Zap}
          label="Tokens Generated"
          value={totalTokens.toLocaleString()}
          color="bg-purple-500/20"
          data-testid="stat-tokens-generated"
        />
        <StatItem
          icon={Coins}
          label="Total Volume"
          value={formatQubic(totalEarnings)}
          trend={{ value: 15, positive: true }}
          color="bg-amber-500/20"
          data-testid="stat-total-volume"
        />
      </div>

      {/* Globe View */}
      {viewMode === "globe" && (
        <Suspense fallback={<GlobeLoadingPlaceholder />}>
          <NetworkGlobe />
        </Suspense>
      )}

      {/* Live Activity - Glass Card (shown in list view or always below globe) */}
      <GlassCard data-testid="live-activity-card">
        <div className="flex items-center justify-between mb-[var(--space-4)]">
          <h3 className="heading-tertiary text-white flex items-center gap-[var(--space-2)]">
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
          <EmptyStateIllustration
            variant="radar"
            title="No recent activity"
            description="The network is ready and waiting. Submit your first job to see real-time activity flow through the distributed compute network."
            ctaLabel="Submit Your First Job"
            ctaHref="/opus"
            ctaIcon={Zap}
            data-testid="network-empty-state"
          />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
        {/* Model Performance - Glass Card */}
        <GlassCard>
          <h3 className="heading-tertiary text-white mb-[var(--space-4)] flex items-center gap-[var(--space-2)]">
            <Cpu className="w-4 h-4 text-purple-400" />
            Model Performance
          </h3>
          <div className="space-y-[var(--space-4)]">
            {SUPPORTED_MODELS.map((model) => (
              <ModelBar key={model.id} model={model} jobs={jobs} maxJobs={maxJobsPerModel} />
            ))}
          </div>
        </GlassCard>

        {/* Network Status - Non-glass */}
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
              value={`${health?.availableModels?.length ?? 0}`}
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
              value={jobs.length > 0 ? `${((completedJobs.length / jobs.length) * 100).toFixed(0)}%` : "—"}
              color="text-cyan-400"
              data-testid="network-status-success-rate"
            />
          </div>
        </div>
      </div>

      {/* Job Distribution */}
      <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/30 border border-zinc-800/50" data-testid="job-distribution-card">
        <h3 className="heading-tertiary text-zinc-400 mb-[var(--space-4)] flex items-center gap-[var(--space-2)]">
          <Activity className="w-4 h-4" />
          Job Distribution
        </h3>
        <JobDistributionBar jobs={jobs} />
      </div>
    </div>
  );
}
