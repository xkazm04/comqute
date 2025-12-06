"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Settings2,
  ChevronDown,
  Activity,
  Cpu,
  Server,
  Zap,
  X,
  Focus,
  Layers,
  Move3D,
} from "lucide-react";
import type { TopologyNode, NetworkHealthState } from "./types";
import { NODE_COLORS, HEALTH_COLORS } from "./types";

// ============================================================================
// HEALTH STATUS BAR
// ============================================================================

interface HealthStatusBarProps {
  health: NetworkHealthState;
}

export function HealthStatusBar({ health }: HealthStatusBarProps) {
  const color = HEALTH_COLORS[health.overall];

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800"
      data-testid="topology-health-bar"
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs font-medium capitalize" style={{ color }}>
          {health.overall}
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-700" />

      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <span>
          <span className="text-cyan-400">{health.activeJobs}</span> active
        </span>
        <span>
          <span className="text-amber-400">{health.queuedJobs}</span> queued
        </span>
        <span>
          <span className="text-purple-400">{health.throughput.toFixed(0)}</span>/s
        </span>
        <span>
          <span className="text-emerald-400">{health.nodeUptime.toFixed(0)}%</span> uptime
        </span>
      </div>
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
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ViewControls({
  showLabels,
  onToggleLabels,
  autoRotate,
  onToggleAutoRotate,
  onResetCamera,
  onZoomIn,
  onZoomOut,
}: ViewControlsProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800"
      data-testid="topology-view-controls"
    >
      <button
        onClick={onToggleLabels}
        className={`p-2 rounded-md transition-colors ${
          showLabels
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        }`}
        title={showLabels ? "Hide labels" : "Show labels"}
        data-testid="topology-toggle-labels-btn"
      >
        {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      <button
        onClick={onToggleAutoRotate}
        className={`p-2 rounded-md transition-colors ${
          autoRotate
            ? "bg-purple-500/20 text-purple-400"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        }`}
        title={autoRotate ? "Stop rotation" : "Auto-rotate"}
        data-testid="topology-toggle-rotate-btn"
      >
        <RotateCcw className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
      </button>

      <div className="h-4 w-px bg-zinc-700 mx-1" />

      <button
        onClick={onZoomIn}
        className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Zoom in"
        data-testid="topology-zoom-in-btn"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={onZoomOut}
        className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Zoom out"
        data-testid="topology-zoom-out-btn"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={onResetCamera}
        className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Reset camera"
        data-testid="topology-reset-camera-btn"
      >
        <Focus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// NODE FILTER CONTROLS
// ============================================================================

interface NodeFilterControlsProps {
  visibleTypes: Set<TopologyNode["type"]>;
  onToggleType: (type: TopologyNode["type"]) => void;
}

const NODE_TYPE_CONFIG = [
  { type: "dispatcher" as const, label: "Dispatcher", icon: Move3D },
  { type: "orchestrator" as const, label: "Orchestrators", icon: Layers },
  { type: "worker" as const, label: "Workers", icon: Cpu },
  { type: "requester" as const, label: "Requesters", icon: Zap },
];

export function NodeFilterControls({ visibleTypes, onToggleType }: NodeFilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" data-testid="topology-node-filters">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        data-testid="topology-filter-toggle-btn"
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-xs">Filters</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-2 bg-zinc-900/95 backdrop-blur-md rounded-lg border border-zinc-800 min-w-[160px] z-50"
          >
            {NODE_TYPE_CONFIG.map(({ type, label, icon: Icon }) => {
              const isVisible = visibleTypes.has(type);
              const color = NODE_COLORS[type].online;

              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors ${
                    isVisible
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                  }`}
                  data-testid={`topology-filter-${type}-btn`}
                >
                  <Icon className="w-4 h-4" style={{ color: isVisible ? color : undefined }} />
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// NODE DETAIL PANEL
// ============================================================================

interface NodeDetailPanelProps {
  node: TopologyNode;
  onClose: () => void;
  onFlyTo: (node: TopologyNode) => void;
}

export function NodeDetailPanel({ node, onClose, onFlyTo }: NodeDetailPanelProps) {
  const color = NODE_COLORS[node.type][node.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-72 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-800 overflow-hidden shadow-2xl"
      data-testid="topology-node-detail-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-white text-sm">{node.name}</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
          data-testid="topology-node-detail-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Type & Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Type</span>
          <span className="text-zinc-300 capitalize">{node.type}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Status</span>
          <span
            className={
              node.status === "online"
                ? "text-emerald-400"
                : node.status === "busy"
                ? "text-cyan-400"
                : node.status === "idle"
                ? "text-amber-400"
                : "text-zinc-500"
            }
          >
            {node.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
          <div className="text-center p-2 rounded-lg bg-zinc-800/50">
            <div className="text-lg font-bold text-cyan-400">{node.jobsActive}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Jobs</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-zinc-800/50">
            <div className="text-lg font-bold text-purple-400">
              {node.jobsCompleted.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Completed</div>
          </div>
        </div>

        {/* Activity bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Activity</span>
            <span className="text-zinc-400">{(node.activity * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${node.activity * 100}%` }}
            />
          </div>
        </div>

        {/* Fly to button */}
        <button
          onClick={() => onFlyTo(node)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
          data-testid="topology-fly-to-node-btn"
        >
          <Focus className="w-3 h-3" />
          Focus on Node
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STATS OVERLAY
// ============================================================================

interface StatsOverlayProps {
  nodes: TopologyNode[];
  particleCount: number;
}

export function StatsOverlay({ nodes, particleCount }: StatsOverlayProps) {
  const onlineWorkers = nodes.filter(
    (n) => n.type === "worker" && n.status !== "offline"
  ).length;
  const busyWorkers = nodes.filter((n) => n.type === "worker" && n.status === "busy").length;
  const totalWorkers = nodes.filter((n) => n.type === "worker").length;

  return (
    <div
      className="absolute top-4 left-4 flex flex-col gap-2"
      data-testid="topology-stats-overlay"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800">
        <Server className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{onlineWorkers}</span>/{totalWorkers}{" "}
          workers online
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800">
        <Cpu className="w-3 h-3 text-cyan-400" />
        <span className="text-xs text-zinc-400">
          <span className="text-cyan-400 font-medium">{busyWorkers}</span> processing
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800">
        <Activity className="w-3 h-3 text-purple-400" />
        <span className="text-xs text-zinc-400">
          <span className="text-purple-400 font-medium">{particleCount}</span> active flows
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// INSTRUCTIONS OVERLAY
// ============================================================================

interface InstructionsOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export function InstructionsOverlay({ visible, onDismiss }: InstructionsOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 bottom-20 flex justify-center pointer-events-none"
      data-testid="topology-instructions-overlay"
    >
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800 pointer-events-auto">
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-300">Drag</span> to rotate •{" "}
          <span className="text-zinc-300">Scroll</span> to zoom •{" "}
          <span className="text-zinc-300">Click</span> nodes for details
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-500 hover:text-white transition-colors"
          data-testid="topology-instructions-dismiss-btn"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
