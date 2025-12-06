"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Maximize2, Minimize2, Box } from "lucide-react";
import * as THREE from "three";
import { TopologyScene } from "./TopologyScene";
import {
  HealthStatusBar,
  ViewControls,
  NodeFilterControls,
  NodeDetailPanel,
  StatsOverlay,
  InstructionsOverlay,
} from "./TopologyControls";
import {
  MOCK_TOPOLOGY_NODES,
  generateMockParticles,
  generateMockConnections,
  generateMockHealthState,
} from "./mockData";
import type { TopologyNode, JobParticle, TopologyConnection, NetworkHealthState } from "./types";

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-zinc-950"
      data-testid="topology-loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
          <motion.div
            className="absolute inset-0 w-12 h-12 rounded-full border-2 border-purple-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-white">Initializing Network Topology</div>
          <div className="text-xs text-zinc-500 mt-1">Connecting to distributed nodes...</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN NETWORK TOPOLOGY 3D COMPONENT
// ============================================================================

export interface NetworkTopology3DProps {
  className?: string;
  initialFullscreen?: boolean;
}

export function NetworkTopology3D({
  className = "",
  initialFullscreen = false,
}: NetworkTopology3DProps) {
  // Data state
  const [nodes, setNodes] = useState<TopologyNode[]>(MOCK_TOPOLOGY_NODES);
  const [particles, setParticles] = useState<JobParticle[]>([]);
  const [connections, setConnections] = useState<TopologyConnection[]>([]);
  const [health, setHealth] = useState<NetworkHealthState>({
    overall: "healthy",
    latency: 25,
    throughput: 150,
    activeJobs: 0,
    queuedJobs: 0,
    nodeUptime: 95,
  });

  // View state
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [showInstructions, setShowInstructions] = useState(true);
  const [visibleTypes, setVisibleTypes] = useState<Set<TopologyNode["type"]>>(
    new Set(["dispatcher", "orchestrator", "worker", "requester"])
  );

  // Camera ref for programmatic control
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null);

  // Initialize particles and connections
  useEffect(() => {
    const updateData = () => {
      const newParticles = generateMockParticles(nodes);
      const newConnections = generateMockConnections(nodes);
      const newHealth = generateMockHealthState(nodes, newParticles);

      setParticles(newParticles);
      setConnections(newConnections);
      setHealth(newHealth);
    };

    updateData();

    // Refresh data periodically for real-time effect
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, [nodes]);

  // Hide instructions after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Filter nodes by visible types
  const filteredNodes = nodes.filter((n) => visibleTypes.has(n.type));
  const filteredParticles = particles.filter((p) => {
    const fromNode = nodes.find((n) => n.id === p.fromNodeId);
    const toNode = nodes.find((n) => n.id === p.toNodeId);
    return (
      fromNode &&
      toNode &&
      visibleTypes.has(fromNode.type) &&
      visibleTypes.has(toNode.type)
    );
  });
  const filteredConnections = connections.filter((c) => {
    const fromNode = nodes.find((n) => n.id === c.fromId);
    const toNode = nodes.find((n) => n.id === c.toId);
    return (
      fromNode &&
      toNode &&
      visibleTypes.has(fromNode.type) &&
      visibleTypes.has(toNode.type)
    );
  });

  // Handlers
  const handleToggleType = useCallback((type: TopologyNode["type"]) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setSelectedNode(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      const distance = controlsRef.current.getDistance();
      controlsRef.current.dollyTo(Math.max(distance - 2, 3), true);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      const distance = controlsRef.current.getDistance();
      controlsRef.current.dollyTo(Math.min(distance + 2, 15), true);
    }
  }, []);

  const handleFlyToNode = useCallback((node: TopologyNode) => {
    if (controlsRef.current) {
      const [x, y, z] = node.position;
      // Move camera to look at the node from a nearby position
      controlsRef.current.setLookAt(
        x + 3,
        y + 2,
        z + 3,
        x,
        y,
        z,
        true
      );
    }
    setAutoRotate(false);
  }, []);

  const handleSelectNode = useCallback((node: TopologyNode | null) => {
    setSelectedNode(node);
    if (node) {
      setAutoRotate(false);
    }
  }, []);

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-zinc-950"
    : `relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/50 ${className}`;

  return (
    <div className={containerClasses} data-testid="network-topology-3d-container">
      {/* 3D Canvas */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[8, 5, 8]}
            fov={50}
          />

          <TopologyScene
            nodes={filteredNodes}
            particles={filteredParticles}
            connections={filteredConnections}
            health={health}
            selectedNode={selectedNode}
            hoveredNode={hoveredNode}
            onSelectNode={handleSelectNode}
            onHoverNode={setHoveredNode}
            showLabels={showLabels}
            autoRotate={autoRotate}
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            autoRotate={false}
            makeDefault
          />
        </Canvas>
      </Suspense>

      {/* Stats Overlay */}
      <StatsOverlay nodes={filteredNodes} particleCount={filteredParticles.length} />

      {/* Health Status Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <HealthStatusBar health={health} />
      </div>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onFlyTo={handleFlyToNode}
          />
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between">
          {/* Left: View Controls */}
          <ViewControls
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
            onResetCamera={handleResetCamera}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />

          {/* Center: Instructions */}
          <InstructionsOverlay
            visible={showInstructions}
            onDismiss={() => setShowInstructions(false)}
          />

          {/* Right: Filters & Fullscreen */}
          <div className="flex items-center gap-2">
            <NodeFilterControls
              visibleTypes={visibleTypes}
              onToggleType={handleToggleType}
            />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              data-testid="topology-fullscreen-btn"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-16 left-4 flex items-center gap-4 px-3 py-2 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-zinc-800"
        data-testid="topology-legend"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span className="text-[10px] text-zinc-400">Worker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] text-zinc-400">Requester</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rotate-45 bg-pink-500" />
          <span className="text-[10px] text-zinc-400">Orchestrator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-violet-500" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
          <span className="text-[10px] text-zinc-400">Dispatcher</span>
        </div>
      </div>

      {/* Fullscreen close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          data-testid="topology-exit-fullscreen-btn"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
