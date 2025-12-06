// Types for Network Globe visualization

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  location: GeoCoordinate;
  type: "worker" | "requester";
  status: "online" | "busy" | "offline";
  jobsCompleted: number;
  jobsActive: number;
  reputation: number;
  region: string;
}

export interface JobFlow {
  id: string;
  from: GeoCoordinate;
  to: GeoCoordinate;
  fromNodeId: string;
  toNodeId: string;
  status: "pending" | "active" | "complete";
  startTime: number;
  progress: number;
}

export interface RegionStats {
  id: string;
  name: string;
  center: GeoCoordinate;
  workerCount: number;
  requesterCount: number;
  activeJobs: number;
  completedJobs: number;
  demandScore: number; // 0-100, higher = more demand relative to supply
  supplyScore: number; // 0-100, higher = more supply relative to demand
}

export interface NetworkHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: number;
  affectedRegions?: string[];
}

export interface TimelapseFrame {
  timestamp: number;
  nodes: NetworkNode[];
  flows: JobFlow[];
}

export interface GlobeViewState {
  rotation: [number, number];
  zoom: number;
  selectedRegion: string | null;
  selectedNode: NetworkNode | null;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
}

// Helper to convert lat/lng to 3D sphere position
export function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

// Generate bezier curve points for arc between two points
export function generateArcPoints(
  from: GeoCoordinate,
  to: GeoCoordinate,
  radius: number,
  segments: number = 50,
  arcHeight: number = 0.3
): [number, number, number][] {
  const points: [number, number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // Interpolate lat/lng
    const lat = from.lat + (to.lat - from.lat) * t;
    const lng = from.lng + (to.lng - from.lng) * t;

    // Add height based on arc (parabola)
    const heightMultiplier = 1 + arcHeight * Math.sin(t * Math.PI);

    const [x, y, z] = latLngToVector3(lat, lng, radius * heightMultiplier);
    points.push([x, y, z]);
  }

  return points;
}
