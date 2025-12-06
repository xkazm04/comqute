// Types for Living Network Topology 3D visualization

export interface TopologyNode {
  id: string;
  name: string;
  type: "worker" | "requester" | "dispatcher" | "orchestrator";
  status: "online" | "busy" | "idle" | "offline";
  position: [number, number, number];
  activity: number; // 0-1, current activity level (affects pulse intensity)
  jobsCompleted: number;
  jobsActive: number;
  computePower: number; // 0-100 relative compute power
  region: string;
  connections: string[]; // IDs of connected nodes
}

export interface JobParticle {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number; // 0-1 position along path
  status: "traveling" | "processing" | "complete";
  color: string;
  speed: number;
  size: number;
  jobType: "inference" | "training" | "embedding";
}

export interface NetworkHealthState {
  overall: "healthy" | "degraded" | "critical";
  latency: number; // ms
  throughput: number; // jobs/sec
  activeJobs: number;
  queuedJobs: number;
  nodeUptime: number; // percentage
}

export interface TopologyConnection {
  id: string;
  fromId: string;
  toId: string;
  bandwidth: number; // 0-1 relative bandwidth usage
  latency: number;
  status: "active" | "idle" | "congested";
}

export interface AtmosphericEffect {
  type: "fog" | "particles" | "grid" | "glow";
  intensity: number;
  color: string;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  autoRotate: boolean;
  flyingToNode: string | null;
}

// Color scheme for node types
export const NODE_COLORS = {
  worker: {
    online: "#10b981", // emerald
    busy: "#06b6d4", // cyan
    idle: "#6366f1", // indigo
    offline: "#6b7280", // gray
  },
  requester: {
    online: "#f59e0b", // amber
    busy: "#f97316", // orange
    idle: "#eab308", // yellow
    offline: "#6b7280",
  },
  dispatcher: {
    online: "#8b5cf6", // violet
    busy: "#a855f7", // purple
    idle: "#c084fc", // purple lighter
    offline: "#6b7280",
  },
  orchestrator: {
    online: "#ec4899", // pink
    busy: "#f43f5e", // rose
    idle: "#fb7185", // rose lighter
    offline: "#6b7280",
  },
} as const;

// Job type colors for particles
export const JOB_COLORS = {
  inference: "#22d3ee", // cyan-400
  training: "#a855f7", // purple-500
  embedding: "#34d399", // emerald-400
} as const;

// Health status colors
export const HEALTH_COLORS = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  critical: "#ef4444",
} as const;

// Generate a position for a node in the 3D space based on type and index
export function generateNodePosition(
  type: TopologyNode["type"],
  index: number,
  total: number
): [number, number, number] {
  const radius = type === "dispatcher" ? 0 : type === "orchestrator" ? 2 : type === "worker" ? 4 : 3;
  const verticalSpread = type === "dispatcher" ? 0 : 2;

  const angle = (index / total) * Math.PI * 2 + (type === "requester" ? Math.PI / total : 0);

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (Math.random() - 0.5) * verticalSpread;

  return [x, y, z];
}

// Interpolate position along bezier curve between two points
export function interpolatePosition(
  from: [number, number, number],
  to: [number, number, number],
  progress: number,
  arcHeight: number = 1
): [number, number, number] {
  // Quadratic bezier with control point above midpoint
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + arcHeight,
    (from[2] + to[2]) / 2,
  ];

  const t = progress;
  const oneMinusT = 1 - t;

  return [
    oneMinusT * oneMinusT * from[0] + 2 * oneMinusT * t * mid[0] + t * t * to[0],
    oneMinusT * oneMinusT * from[1] + 2 * oneMinusT * t * mid[1] + t * t * to[1],
    oneMinusT * oneMinusT * from[2] + 2 * oneMinusT * t * mid[2] + t * t * to[2],
  ];
}

// Generate bezier curve points for connection visualization
export function generateCurvePoints(
  from: [number, number, number],
  to: [number, number, number],
  segments: number = 30,
  arcHeight: number = 0.5
): [number, number, number][] {
  const points: [number, number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push(interpolatePosition(from, to, t, arcHeight));
  }

  return points;
}
