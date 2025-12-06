"use client";

import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCw,
  Tag,
  MapPin,
  Thermometer,
  AlertTriangle,
  X,
  ChevronDown,
} from "lucide-react";
import type { NetworkNode, RegionStats, NetworkHealth } from "./types";

// ============================================================================
// PLAYBACK CONTROLS
// ============================================================================

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  currentTime: number;
  totalFrames: number;
  onSeek: (frame: number) => void;
}

export function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  playbackSpeed,
  onSpeedChange,
  currentTime,
  totalFrames,
  onSeek,
}: PlaybackControlsProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800"
      data-testid="globe-playback-controls"
    >
      <button
        onClick={onSkipBack}
        className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
        data-testid="globe-skip-back-btn"
      >
        <SkipBack className="w-4 h-4 text-zinc-400" />
      </button>

      <button
        onClick={onTogglePlay}
        className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-full transition-colors"
        data-testid="globe-play-pause-btn"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-cyan-400" />
        ) : (
          <Play className="w-4 h-4 text-cyan-400" />
        )}
      </button>

      <button
        onClick={onSkipForward}
        className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
        data-testid="globe-skip-forward-btn"
      >
        <SkipForward className="w-4 h-4 text-zinc-400" />
      </button>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Timeline slider */}
      <div className="flex-1 min-w-[100px]">
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentTime}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          data-testid="globe-timeline-slider"
        />
      </div>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Speed selector */}
      <select
        value={playbackSpeed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="bg-zinc-800 text-xs text-zinc-400 rounded px-2 py-1 border border-zinc-700"
        data-testid="globe-speed-select"
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={4}>4x</option>
      </select>
    </div>
  );
}

// ============================================================================
// VIEW CONTROLS
// ============================================================================

interface ViewControlsProps {
  showLabels: boolean;
  onToggleLabels: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  heatMapMode: "demand" | "supply" | "imbalance" | "none";
  onHeatMapModeChange: (mode: "demand" | "supply" | "imbalance" | "none") => void;
}

export function ViewControls({
  showLabels,
  onToggleLabels,
  autoRotate,
  onToggleAutoRotate,
  heatMapMode,
  onHeatMapModeChange,
}: ViewControlsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="globe-view-controls"
    >
      <button
        onClick={onToggleLabels}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
          showLabels
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
        }`}
        data-testid="globe-toggle-labels-btn"
      >
        <Tag className="w-3 h-3" />
        Labels
      </button>

      <button
        onClick={onToggleAutoRotate}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
          autoRotate
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
        }`}
        data-testid="globe-toggle-rotate-btn"
      >
        <RotateCw className="w-3 h-3" />
        Rotate
      </button>

      <div className="relative">
        <select
          value={heatMapMode}
          onChange={(e) =>
            onHeatMapModeChange(e.target.value as typeof heatMapMode)
          }
          className="appearance-none bg-zinc-800 text-xs text-zinc-400 rounded-lg px-3 py-1.5 pr-7 border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
          data-testid="globe-heatmap-select"
        >
          <option value="none">No Heat Map</option>
          <option value="demand">Demand Heat</option>
          <option value="supply">Supply Heat</option>
          <option value="imbalance">Imbalance</option>
        </select>
        <Thermometer className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ============================================================================
// REGION SELECTOR
// ============================================================================

interface RegionSelectorProps {
  regions: RegionStats[];
  selectedRegion: string | null;
  onSelectRegion: (regionId: string | null) => void;
}

export function RegionSelector({
  regions,
  selectedRegion,
  onSelectRegion,
}: RegionSelectorProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="globe-region-selector"
    >
      <button
        onClick={() => onSelectRegion(null)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
          selectedRegion === null
            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
        }`}
        data-testid="globe-region-all-btn"
      >
        <MapPin className="w-3 h-3" />
        All Regions
      </button>

      {regions.map((region) => (
        <button
          key={region.id}
          onClick={() => onSelectRegion(region.id)}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
            selectedRegion === region.id
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
          }`}
          data-testid={`globe-region-${region.id}-btn`}
        >
          {region.name}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// NETWORK HEALTH ALERTS
// ============================================================================

interface NetworkHealthAlertsProps {
  alerts: NetworkHealth[];
  onDismiss: (index: number) => void;
}

export function NetworkHealthAlerts({
  alerts,
  onDismiss,
}: NetworkHealthAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="globe-health-alerts">
      {alerts
        .filter((a) => a.status !== "healthy")
        .map((alert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
              alert.status === "critical"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
            data-testid={`globe-alert-${idx}`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{alert.message}</span>
            </div>
            <button
              onClick={() => onDismiss(idx)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              data-testid={`globe-alert-dismiss-${idx}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
    </div>
  );
}

// ============================================================================
// NODE DETAIL PANEL
// ============================================================================

interface NodeDetailPanelProps {
  node: NetworkNode;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const statusColors = {
    online: "text-emerald-400",
    busy: "text-cyan-400",
    offline: "text-zinc-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 w-72 p-4 bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-800"
      data-testid="globe-node-detail-panel"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-white">{node.name}</h3>
          <p className={`text-xs ${statusColors[node.status]} capitalize`}>
            {node.status}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
          data-testid="globe-node-detail-close-btn"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Type</span>
          <span className="text-zinc-300 capitalize">{node.type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Region</span>
          <span className="text-zinc-300 capitalize">
            {node.region.replace("-", " ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Jobs Completed</span>
          <span className="text-zinc-300">{node.jobsCompleted.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Active Jobs</span>
          <span className="text-cyan-400">{node.jobsActive}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Reputation</span>
          <span
            className={
              node.reputation >= 95
                ? "text-emerald-400"
                : node.reputation >= 80
                ? "text-amber-400"
                : "text-red-400"
            }
          >
            {node.reputation}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Location</span>
          <span className="text-zinc-400 text-xs">
            {node.location.lat.toFixed(2)}, {node.location.lng.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// REGION STATS PANEL
// ============================================================================

interface RegionStatsPanelProps {
  region: RegionStats;
  onClose: () => void;
}

export function RegionStatsPanel({ region, onClose }: RegionStatsPanelProps) {
  const imbalance = region.demandScore - region.supplyScore;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 w-72 p-4 bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-800"
      data-testid="globe-region-stats-panel"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-white">{region.name}</h3>
          <p className="text-xs text-zinc-500">Regional Statistics</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
          data-testid="globe-region-stats-close-btn"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Workers</span>
          <span className="text-emerald-400">{region.workerCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Requesters</span>
          <span className="text-amber-400">{region.requesterCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Active Jobs</span>
          <span className="text-cyan-400">{region.activeJobs}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Completed Jobs</span>
          <span className="text-zinc-300">{region.completedJobs.toLocaleString()}</span>
        </div>

        <div className="h-px bg-zinc-800 my-2" />

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Demand Score</span>
              <span className="text-amber-400">{region.demandScore}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${region.demandScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Supply Score</span>
              <span className="text-emerald-400">{region.supplyScore}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${region.supplyScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                imbalance > 20
                  ? "bg-red-400"
                  : imbalance < -20
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-xs text-zinc-400">
              {imbalance > 20
                ? "High demand - workers needed"
                : imbalance < -20
                ? "High supply - requesters welcome"
                : "Balanced market"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
