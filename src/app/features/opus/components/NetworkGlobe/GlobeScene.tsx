"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import type { NetworkNode, JobFlow, RegionStats } from "./types";
import { latLngToVector3, generateArcPoints } from "./types";

const GLOBE_RADIUS = 2;

// ============================================================================
// WORKER/REQUESTER NODE POINTS
// ============================================================================

interface NodePointProps {
  node: NetworkNode;
  isSelected: boolean;
  onSelect: (node: NetworkNode) => void;
  showLabels: boolean;
}

function NodePoint({ node, isSelected, onSelect, showLabels }: NodePointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const position = useMemo(
    () => latLngToVector3(node.location.lat, node.location.lng, GLOBE_RADIUS + 0.02),
    [node.location]
  );

  const color = useMemo(() => {
    if (node.status === "offline") return "#6b7280";
    if (node.type === "requester") return "#f59e0b";
    if (node.status === "busy") return "#06b6d4";
    return "#10b981";
  }, [node.status, node.type]);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.scale.setScalar(isSelected ? scale * 1.5 : scale);
    }
    if (glowRef.current && node.status !== "offline") {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Glow effect for online nodes */}
      {node.status !== "offline" && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Main point */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Label on hover/select */}
      {(isSelected || showLabels) && (
        <Html
          position={[0, 0.08, 0]}
          center
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <div className="px-2 py-1 bg-zinc-900/90 backdrop-blur-sm rounded text-xs text-white border border-zinc-700">
            <div className="font-medium">{node.name}</div>
            <div className="text-[10px] text-zinc-400">
              {node.jobsCompleted} jobs | {node.reputation}% rep
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================================================
// JOB FLOW ARC
// ============================================================================

interface JobFlowArcProps {
  flow: JobFlow;
}

function JobFlowArc({ flow }: JobFlowArcProps) {
  const particleRef = useRef<THREE.Mesh>(null);

  const points = useMemo(
    () => generateArcPoints(flow.from, flow.to, GLOBE_RADIUS, 50, 0.15),
    [flow.from, flow.to]
  );

  const linePoints = useMemo(
    () => points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [points]
  );

  const color = flow.status === "complete" ? "#10b981" : flow.status === "active" ? "#06b6d4" : "#f59e0b";

  useFrame((state) => {
    if (particleRef.current && flow.status === "active") {
      const t = (state.clock.elapsedTime * 0.5 + flow.progress) % 1;
      const idx = Math.floor(t * (points.length - 1));
      const nextIdx = Math.min(idx + 1, points.length - 1);
      const localT = (t * (points.length - 1)) % 1;

      const x = points[idx][0] + (points[nextIdx][0] - points[idx][0]) * localT;
      const y = points[idx][1] + (points[nextIdx][1] - points[idx][1]) * localT;
      const z = points[idx][2] + (points[nextIdx][2] - points[idx][2]) * localT;

      particleRef.current.position.set(x, y, z);
      particleRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.3);
    }
  });

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.6}
      />

      {/* Animated particle along arc */}
      {flow.status === "active" && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// HEAT MAP OVERLAY
// ============================================================================

interface HeatMapOverlayProps {
  regions: RegionStats[];
  mode: "demand" | "supply" | "imbalance";
}

function HeatMapOverlay({ regions, mode }: HeatMapOverlayProps) {
  return (
    <group>
      {regions.map((region) => {
        const position = latLngToVector3(
          region.center.lat,
          region.center.lng,
          GLOBE_RADIUS + 0.01
        );

        let intensity: number;
        let color: string;

        if (mode === "demand") {
          intensity = region.demandScore / 100;
          color = "#f59e0b";
        } else if (mode === "supply") {
          intensity = region.supplyScore / 100;
          color = "#10b981";
        } else {
          // Imbalance: show difference
          const diff = region.demandScore - region.supplyScore;
          intensity = Math.abs(diff) / 100;
          color = diff > 0 ? "#ef4444" : "#10b981"; // Red = more demand, Green = more supply
        }

        return (
          <mesh key={region.id} position={position}>
            <sphereGeometry args={[0.15 + intensity * 0.2, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2 + intensity * 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================================================
// GLOBE WIREFRAME
// ============================================================================

function GlobeWireframe() {
  const wireframeRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Base globe with gradient material */}
      <Sphere args={[GLOBE_RADIUS, 64, 64]}>
        <meshBasicMaterial color="#0a0e1a" transparent opacity={0.8} />
      </Sphere>

      {/* Latitude/longitude grid */}
      <lineSegments ref={wireframeRef}>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.IcosahedronGeometry(GLOBE_RADIUS, 2)]}
        />
        <lineBasicMaterial color="#1e3a5f" transparent opacity={0.3} />
      </lineSegments>

      {/* Atmosphere glow */}
      <Sphere args={[GLOBE_RADIUS * 1.02, 32, 32]}>
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

// ============================================================================
// MAIN GLOBE SCENE
// ============================================================================

export interface GlobeSceneProps {
  nodes: NetworkNode[];
  flows: JobFlow[];
  regions: RegionStats[];
  selectedNode: NetworkNode | null;
  onSelectNode: (node: NetworkNode | null) => void;
  showLabels: boolean;
  heatMapMode: "demand" | "supply" | "imbalance" | "none";
  autoRotate: boolean;
}

export function GlobeScene({
  nodes,
  flows,
  regions,
  selectedNode,
  onSelectNode,
  showLabels,
  heatMapMode,
  autoRotate,
}: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <GlobeWireframe />

      {/* Heat map overlay */}
      {heatMapMode !== "none" && (
        <HeatMapOverlay regions={regions} mode={heatMapMode} />
      )}

      {/* Node points */}
      {nodes.map((node) => (
        <NodePoint
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onSelect={onSelectNode}
          showLabels={showLabels}
        />
      ))}

      {/* Job flow arcs */}
      {flows.map((flow) => (
        <JobFlowArc key={flow.id} flow={flow} />
      ))}

      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </group>
  );
}
