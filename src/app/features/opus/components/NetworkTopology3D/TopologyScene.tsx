"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Sphere, Html, Float, Trail, Stars, PointMaterial, Points } from "@react-three/drei";
import * as THREE from "three";
import type { TopologyNode, JobParticle, TopologyConnection, NetworkHealthState } from "./types";
import {
  NODE_COLORS,
  JOB_COLORS,
  HEALTH_COLORS,
  interpolatePosition,
  generateCurvePoints,
} from "./types";

// ============================================================================
// TOPOLOGY NODE - Pulsing 3D Node
// ============================================================================

interface TopologyNodeMeshProps {
  node: TopologyNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (node: TopologyNode) => void;
  onHover: (node: TopologyNode | null) => void;
  showLabels: boolean;
}

function TopologyNodeMesh({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  showLabels,
}: TopologyNodeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    const typeColors = NODE_COLORS[node.type];
    return typeColors[node.status];
  }, [node.type, node.status]);

  // Node size based on type
  const baseSize = useMemo(() => {
    switch (node.type) {
      case "dispatcher":
        return 0.25;
      case "orchestrator":
        return 0.18;
      case "worker":
        return 0.12;
      case "requester":
        return 0.1;
      default:
        return 0.1;
    }
  }, [node.type]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Pulse effect based on activity
    const pulseIntensity = node.status === "offline" ? 0 : node.activity;
    const pulse = 1 + Math.sin(time * 3 + node.position[0]) * 0.15 * pulseIntensity;

    meshRef.current.scale.setScalar(
      baseSize * pulse * (isSelected ? 1.4 : isHovered ? 1.2 : 1)
    );

    // Glow effect
    if (glowRef.current && node.status !== "offline") {
      const glowPulse = 1.5 + Math.sin(time * 2) * 0.3;
      glowRef.current.scale.setScalar(baseSize * glowPulse * 2);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(time * 2) * 0.1 * pulseIntensity;
    }

    // Outer pulse ring
    if (pulseRef.current && node.status !== "offline") {
      const ringScale = 2 + ((time * 0.5) % 2) * 1.5;
      const ringOpacity = Math.max(0, 0.3 - ((time * 0.5) % 2) * 0.15);
      pulseRef.current.scale.setScalar(baseSize * ringScale);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity * pulseIntensity;
    }
  });

  return (
    <group position={node.position}>
      {/* Outer pulse ring */}
      {node.status !== "offline" && (
        <mesh ref={pulseRef}>
          <ringGeometry args={[0.9, 1, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glow sphere */}
      {node.status !== "offline" && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Main node mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        {node.type === "dispatcher" ? (
          <octahedronGeometry args={[1, 0]} />
        ) : node.type === "orchestrator" ? (
          <icosahedronGeometry args={[1, 0]} />
        ) : node.type === "worker" ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : (
          <tetrahedronGeometry args={[1, 0]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.status === "offline" ? 0 : 0.5 + node.activity * 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Label */}
      {(isSelected || isHovered || showLabels) && (
        <Html
          position={[0, baseSize * 2 + 0.1, 0]}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <div className="px-3 py-2 bg-zinc-900/95 backdrop-blur-md rounded-lg text-xs text-white border border-zinc-700 shadow-xl">
            <div className="font-bold text-sm" style={{ color }}>
              {node.name}
            </div>
            <div className="text-zinc-400 mt-1">
              <span className="capitalize">{node.type}</span> •{" "}
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
            <div className="text-zinc-500 text-[10px] mt-1">
              {node.jobsCompleted.toLocaleString()} jobs • {node.jobsActive} active
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================================================
// JOB PARTICLE - Animated light particle flowing between nodes
// ============================================================================

interface JobParticleMeshProps {
  particle: JobParticle;
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
}

function JobParticleMesh({ particle, fromPosition, toPosition }: JobParticleMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(particle.progress);

  const color = useMemo(() => {
    return JOB_COLORS[particle.jobType];
  }, [particle.jobType]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update progress
    progressRef.current += delta * particle.speed * 0.3;
    if (progressRef.current > 1) {
      progressRef.current = 0;
    }

    // Calculate position along curve
    const pos = interpolatePosition(fromPosition, toPosition, progressRef.current, 0.8);
    meshRef.current.position.set(pos[0], pos[1], pos[2]);

    // Pulsing size
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    meshRef.current.scale.setScalar(particle.size * pulse);
  });

  return (
    <Trail
      width={0.5}
      length={6}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  );
}

// ============================================================================
// CONNECTION LINE - Animated connection between nodes
// ============================================================================

interface ConnectionLineMeshProps {
  connection: TopologyConnection;
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
}

function ConnectionLineMesh({ connection, fromPosition, toPosition }: ConnectionLineMeshProps) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    return generateCurvePoints(fromPosition, toPosition, 30, 0.3).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
  }, [fromPosition, toPosition]);

  const color = useMemo(() => {
    switch (connection.status) {
      case "active":
        return "#3b82f6"; // blue
      case "congested":
        return "#f59e0b"; // amber
      default:
        return "#374151"; // gray
    }
  }, [connection.status]);

  const opacity = connection.status === "idle" ? 0.2 : 0.4 + connection.bandwidth * 0.3;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={connection.status === "congested" ? 2 : 1}
      transparent
      opacity={opacity}
      dashed={connection.status === "idle"}
      dashScale={10}
      dashSize={0.1}
      dashOffset={0}
    />
  );
}

// ============================================================================
// ATMOSPHERIC EFFECTS - Background effects based on network health
// ============================================================================

interface AtmosphericEffectsProps {
  health: NetworkHealthState;
}

function AtmosphericEffects({ health }: AtmosphericEffectsProps) {
  const fogColor = useMemo(() => {
    return HEALTH_COLORS[health.overall];
  }, [health.overall]);

  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 500;

  // Generate random positions for ambient particles
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <>
      {/* Background stars */}
      <Stars
        radius={50}
        depth={50}
        count={2000}
        factor={2}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Ambient particles that respond to health */}
      <Points ref={particlesRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color={fogColor}
          size={0.02}
          sizeAttenuation
          opacity={0.4}
          depthWrite={false}
        />
      </Points>

      {/* Health-based fog effect */}
      <fog attach="fog" args={["#050510", 8, health.overall === "critical" ? 12 : 20]} />

      {/* Ambient glow sphere */}
      <Sphere args={[15, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={fogColor}
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

// ============================================================================
// GRID FLOOR - Reference grid
// ============================================================================

function GridFloor() {
  return (
    <group position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[20, 20, "#1e3a5f", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

// ============================================================================
// MAIN TOPOLOGY SCENE
// ============================================================================

export interface TopologySceneProps {
  nodes: TopologyNode[];
  particles: JobParticle[];
  connections: TopologyConnection[];
  health: NetworkHealthState;
  selectedNode: TopologyNode | null;
  hoveredNode: TopologyNode | null;
  onSelectNode: (node: TopologyNode | null) => void;
  onHoverNode: (node: TopologyNode | null) => void;
  showLabels: boolean;
  autoRotate: boolean;
}

export function TopologyScene({
  nodes,
  particles,
  connections,
  health,
  selectedNode,
  hoveredNode,
  onSelectNode,
  onHoverNode,
  showLabels,
  autoRotate,
}: TopologySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Auto-rotate effect
  useFrame(() => {
    if (groupRef.current && autoRotate && !selectedNode) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Create node position map for particle lookup
  const nodePositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    nodes.forEach((node) => {
      map.set(node.id, node.position);
    });
    return map;
  }, [nodes]);

  return (
    <>
      {/* Atmospheric effects */}
      <AtmosphericEffects health={health} />

      {/* Grid floor */}
      <GridFloor />

      {/* Main rotating group */}
      <group ref={groupRef}>
        {/* Connection lines */}
        {connections.map((conn) => {
          const fromPos = nodePositions.get(conn.fromId);
          const toPos = nodePositions.get(conn.toId);
          if (!fromPos || !toPos) return null;

          return (
            <ConnectionLineMesh
              key={conn.id}
              connection={conn}
              fromPosition={fromPos}
              toPosition={toPos}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <TopologyNodeMesh
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            isHovered={hoveredNode?.id === node.id}
            onSelect={onSelectNode}
            onHover={onHoverNode}
            showLabels={showLabels}
          />
        ))}

        {/* Job particles */}
        {particles.map((particle) => {
          const fromPos = nodePositions.get(particle.fromNodeId);
          const toPos = nodePositions.get(particle.toNodeId);
          if (!fromPos || !toPos) return null;

          return (
            <JobParticleMesh
              key={particle.id}
              particle={particle}
              fromPosition={fromPos}
              toPosition={toPos}
            />
          );
        })}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#fff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#a855f7" />
    </>
  );
}
