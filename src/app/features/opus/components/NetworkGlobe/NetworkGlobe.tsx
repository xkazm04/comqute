"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe as GlobeIcon } from "lucide-react";
import { GlobeScene } from "./GlobeScene";
import {
  PlaybackControls,
  ViewControls,
  RegionSelector,
  NetworkHealthAlerts,
  NodeDetailPanel,
  RegionStatsPanel,
} from "./NetworkGlobeControls";
import {
  MOCK_NODES,
  MOCK_REGIONS,
  MOCK_HEALTH_ALERTS,
  generateMockFlows,
  generateTimelapseData,
} from "./mockData";
import type { NetworkNode, JobFlow, RegionStats, NetworkHealth, TimelapseFrame } from "./types";

// ============================================================================
// GLOBE STATS OVERLAY
// ============================================================================

interface GlobeStatsOverlayProps {
  nodes: NetworkNode[];
  flows: JobFlow[];
}

function GlobeStatsOverlay({ nodes, flows }: GlobeStatsOverlayProps) {
  const onlineWorkers = nodes.filter(n => n.type === "worker" && n.status !== "offline").length;
  const activeFlows = flows.filter(f => f.status === "active").length;
  const totalJobs = nodes.reduce((sum, n) => sum + n.jobsCompleted, 0);

  return (
    <div
      className="absolute top-4 left-4 flex flex-col gap-2"
      data-testid="globe-stats-overlay"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{onlineWorkers}</span> workers online
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs text-zinc-400">
          <span className="text-cyan-400 font-medium">{activeFlows}</span> active jobs
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800">
        <div className="w-2 h-2 rounded-full bg-purple-400" />
        <span className="text-xs text-zinc-400">
          <span className="text-purple-400 font-medium">{totalJobs.toLocaleString()}</span> total jobs
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function GlobeLoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-sm text-zinc-400">Loading Network Globe...</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN NETWORK GLOBE COMPONENT
// ============================================================================

export interface NetworkGlobeProps {
  className?: string;
}

export function NetworkGlobe({ className = "" }: NetworkGlobeProps) {
  // State
  const [nodes, setNodes] = useState<NetworkNode[]>(MOCK_NODES);
  const [flows, setFlows] = useState<JobFlow[]>([]);
  const [regions] = useState<RegionStats[]>(MOCK_REGIONS);
  const [alerts, setAlerts] = useState<NetworkHealth[]>(MOCK_HEALTH_ALERTS);
  const [timelapseData, setTimelapseData] = useState<TimelapseFrame[]>([]);

  // View state
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [heatMapMode, setHeatMapMode] = useState<"demand" | "supply" | "imbalance" | "none">("none");

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isTimelapseMode, setIsTimelapseMode] = useState(false);

  // Initialize flows and timelapse data
  useEffect(() => {
    setFlows(generateMockFlows());
    setTimelapseData(generateTimelapseData(30));

    // Simulate live flow updates
    const interval = setInterval(() => {
      if (!isTimelapseMode) {
        setFlows(generateMockFlows());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTimelapseMode]);

  // Timelapse playback
  useEffect(() => {
    if (!isPlaying || !isTimelapseMode || timelapseData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next >= timelapseData.length) {
          setIsPlaying(false);
          return timelapseData.length - 1;
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, isTimelapseMode, playbackSpeed, timelapseData.length]);

  // Update display based on current frame when in timelapse mode
  useEffect(() => {
    if (isTimelapseMode && timelapseData[currentFrame]) {
      setNodes(timelapseData[currentFrame].nodes);
      setFlows(timelapseData[currentFrame].flows);
    }
  }, [currentFrame, isTimelapseMode, timelapseData]);

  // Filter nodes by region
  const filteredNodes = selectedRegion
    ? nodes.filter((n) => n.region === selectedRegion)
    : nodes;

  const filteredFlows = selectedRegion
    ? flows.filter((f) => {
        const fromNode = nodes.find((n) => n.id === f.fromNodeId);
        const toNode = nodes.find((n) => n.id === f.toNodeId);
        return fromNode?.region === selectedRegion || toNode?.region === selectedRegion;
      })
    : flows;

  // Handlers
  const handleTogglePlay = useCallback(() => {
    if (!isTimelapseMode) {
      setIsTimelapseMode(true);
      setCurrentFrame(0);
    }
    setIsPlaying((prev) => !prev);
  }, [isTimelapseMode]);

  const handleSkipBack = useCallback(() => {
    setCurrentFrame((prev) => Math.max(0, prev - 5));
  }, []);

  const handleSkipForward = useCallback(() => {
    setCurrentFrame((prev) => Math.min(timelapseData.length - 1, prev + 5));
  }, [timelapseData.length]);

  const handleSeek = useCallback((frame: number) => {
    setIsTimelapseMode(true);
    setCurrentFrame(frame);
  }, []);

  const handleDismissAlert = useCallback((index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSelectRegion = useCallback((regionId: string | null) => {
    setSelectedRegion(regionId);
    setSelectedNode(null);
    if (regionId === null) {
      setIsTimelapseMode(false);
      setIsPlaying(false);
    }
  }, []);

  const selectedRegionData = selectedRegion
    ? regions.find((r) => r.id === selectedRegion)
    : null;

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 ${className}`}
      data-testid="network-globe-container"
    >
      {/* 3D Canvas */}
      <Suspense fallback={<GlobeLoadingFallback />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <GlobeScene
            nodes={filteredNodes}
            flows={filteredFlows}
            regions={regions}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            showLabels={showLabels}
            heatMapMode={heatMapMode}
            autoRotate={autoRotate && !selectedNode}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            autoRotate={false}
          />
        </Canvas>
      </Suspense>

      {/* Stats Overlay */}
      <GlobeStatsOverlay nodes={filteredNodes} flows={filteredFlows} />

      {/* Health Alerts */}
      <div className="absolute top-4 right-4 w-72">
        <NetworkHealthAlerts alerts={alerts} onDismiss={handleDismissAlert} />
      </div>

      {/* Node/Region Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
        {selectedRegionData && !selectedNode && (
          <RegionStatsPanel
            region={selectedRegionData}
            onClose={() => setSelectedRegion(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        {/* Region Selector */}
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
        />

        {/* View Controls & Playback */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ViewControls
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((prev) => !prev)}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
            heatMapMode={heatMapMode}
            onHeatMapModeChange={setHeatMapMode}
          />

          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            currentTime={currentFrame}
            totalFrames={timelapseData.length || 30}
            onSeek={handleSeek}
          />
        </div>
      </div>

      {/* Timelapse Mode Indicator */}
      {isTimelapseMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30"
          data-testid="globe-timelapse-indicator"
        >
          <div className="flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400">
              Time-lapse: Day {currentFrame + 1} of {timelapseData.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
