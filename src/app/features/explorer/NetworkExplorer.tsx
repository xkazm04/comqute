"use client";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, Activity } from "lucide-react";
import { useJobStore } from "@/stores";
import { useHealth } from "@/hooks";
import { SUPPORTED_MODELS } from "@/lib/models";
import type { Job } from "@/types";
import {
  ViewToggle,
  GlobeLoadingPlaceholder,
  TopologyLoadingPlaceholder,
  LiveActivityCard,
  ModelPerformanceCard,
  NetworkStatusCard,
  JobDistributionBar,
  type ViewMode,
} from "./components";

// Lazy load the 3D globe for better initial load performance
const NetworkGlobe = lazy(() =>
  import("../opus/components/NetworkGlobe").then((mod) => ({ default: mod.NetworkGlobe }))
);

// Lazy load the 3D topology visualization
const NetworkTopology3D = lazy(() =>
  import("../opus/components/NetworkTopology3D").then((mod) => ({ default: mod.NetworkTopology3D }))
);

// ============================================================================
// MAIN EXPLORER
// ============================================================================

export function NetworkExplorer() {
  const { jobs } = useJobStore();
  const { isOllamaOnline, health } = useHealth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("topology");

  // Memoize derived job statistics to prevent redundant O(n) traversals per render
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === "complete"),
    [jobs]
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

  const successRate = useMemo(() => {
    if (jobs.length === 0) return "—";
    return `${((completedJobs.length / jobs.length) * 100).toFixed(0)}%`;
  }, [jobs.length, completedJobs.length]);

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

      {/* 3D Topology View - Living Network Visualization */}
      {viewMode === "topology" && (
        <Suspense fallback={<TopologyLoadingPlaceholder />}>
          <NetworkTopology3D />
        </Suspense>
      )}

      {/* Globe View */}
      {viewMode === "globe" && (
        <Suspense fallback={<GlobeLoadingPlaceholder />}>
          <NetworkGlobe />
        </Suspense>
      )}

      {/* Live Activity */}
      <LiveActivityCard jobs={jobs} />

      {/* Model Performance & Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
        <ModelPerformanceCard jobs={jobs} maxJobsPerModel={maxJobsPerModel} />
        <NetworkStatusCard
          isOllamaOnline={isOllamaOnline}
          availableModels={health?.availableModels?.length ?? 0}
          avgResponseTime={avgResponseTime}
          successRate={successRate}
        />
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
