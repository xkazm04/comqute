// Mock data for Network Globe visualization

import type { NetworkNode, JobFlow, RegionStats, NetworkHealth, TimelapseFrame } from "./types";

// Major cities with worker nodes
export const MOCK_NODES: NetworkNode[] = [
  // North America
  { id: "node-1", name: "NYC Node Alpha", location: { lat: 40.7128, lng: -74.006 }, type: "worker", status: "online", jobsCompleted: 1247, jobsActive: 3, reputation: 98, region: "north-america" },
  { id: "node-2", name: "SF Compute Hub", location: { lat: 37.7749, lng: -122.4194 }, type: "worker", status: "busy", jobsCompleted: 2341, jobsActive: 5, reputation: 99, region: "north-america" },
  { id: "node-3", name: "Austin GPU Farm", location: { lat: 30.2672, lng: -97.7431 }, type: "worker", status: "online", jobsCompleted: 856, jobsActive: 2, reputation: 95, region: "north-america" },
  { id: "node-4", name: "Toronto AI Center", location: { lat: 43.6532, lng: -79.3832 }, type: "worker", status: "online", jobsCompleted: 678, jobsActive: 1, reputation: 97, region: "north-america" },
  { id: "node-5", name: "Seattle Cloud", location: { lat: 47.6062, lng: -122.3321 }, type: "requester", status: "online", jobsCompleted: 0, jobsActive: 4, reputation: 92, region: "north-america" },
  { id: "node-6", name: "Denver ML Lab", location: { lat: 39.7392, lng: -104.9903 }, type: "worker", status: "online", jobsCompleted: 432, jobsActive: 2, reputation: 94, region: "north-america" },

  // Europe
  { id: "node-7", name: "London GPU Array", location: { lat: 51.5074, lng: -0.1278 }, type: "worker", status: "online", jobsCompleted: 1876, jobsActive: 4, reputation: 98, region: "europe" },
  { id: "node-8", name: "Berlin AI Node", location: { lat: 52.52, lng: 13.405 }, type: "worker", status: "busy", jobsCompleted: 1543, jobsActive: 6, reputation: 96, region: "europe" },
  { id: "node-9", name: "Paris Compute", location: { lat: 48.8566, lng: 2.3522 }, type: "worker", status: "online", jobsCompleted: 1123, jobsActive: 2, reputation: 97, region: "europe" },
  { id: "node-10", name: "Amsterdam Hub", location: { lat: 52.3676, lng: 4.9041 }, type: "requester", status: "online", jobsCompleted: 0, jobsActive: 3, reputation: 91, region: "europe" },
  { id: "node-11", name: "Zurich ML", location: { lat: 47.3769, lng: 8.5417 }, type: "worker", status: "online", jobsCompleted: 987, jobsActive: 1, reputation: 99, region: "europe" },
  { id: "node-12", name: "Stockholm Node", location: { lat: 59.3293, lng: 18.0686 }, type: "worker", status: "offline", jobsCompleted: 654, jobsActive: 0, reputation: 93, region: "europe" },

  // Asia Pacific
  { id: "node-13", name: "Tokyo GPU Farm", location: { lat: 35.6762, lng: 139.6503 }, type: "worker", status: "busy", jobsCompleted: 3241, jobsActive: 8, reputation: 99, region: "asia-pacific" },
  { id: "node-14", name: "Singapore Hub", location: { lat: 1.3521, lng: 103.8198 }, type: "worker", status: "online", jobsCompleted: 1876, jobsActive: 3, reputation: 98, region: "asia-pacific" },
  { id: "node-15", name: "Seoul AI Center", location: { lat: 37.5665, lng: 126.978 }, type: "worker", status: "online", jobsCompleted: 2134, jobsActive: 4, reputation: 97, region: "asia-pacific" },
  { id: "node-16", name: "Sydney Compute", location: { lat: -33.8688, lng: 151.2093 }, type: "requester", status: "online", jobsCompleted: 0, jobsActive: 5, reputation: 90, region: "asia-pacific" },
  { id: "node-17", name: "Mumbai Node", location: { lat: 19.076, lng: 72.8777 }, type: "worker", status: "online", jobsCompleted: 876, jobsActive: 2, reputation: 94, region: "asia-pacific" },
  { id: "node-18", name: "Hong Kong GPU", location: { lat: 22.3193, lng: 114.1694 }, type: "worker", status: "busy", jobsCompleted: 1654, jobsActive: 5, reputation: 96, region: "asia-pacific" },

  // South America
  { id: "node-19", name: "Sao Paulo Hub", location: { lat: -23.5505, lng: -46.6333 }, type: "worker", status: "online", jobsCompleted: 543, jobsActive: 2, reputation: 92, region: "south-america" },
  { id: "node-20", name: "Buenos Aires ML", location: { lat: -34.6037, lng: -58.3816 }, type: "requester", status: "online", jobsCompleted: 0, jobsActive: 2, reputation: 88, region: "south-america" },

  // Africa & Middle East
  { id: "node-21", name: "Dubai AI Center", location: { lat: 25.2048, lng: 55.2708 }, type: "worker", status: "online", jobsCompleted: 765, jobsActive: 2, reputation: 95, region: "middle-east" },
  { id: "node-22", name: "Cape Town Node", location: { lat: -33.9249, lng: 18.4241 }, type: "worker", status: "online", jobsCompleted: 234, jobsActive: 1, reputation: 91, region: "africa" },
  { id: "node-23", name: "Lagos GPU Farm", location: { lat: 6.5244, lng: 3.3792 }, type: "worker", status: "offline", jobsCompleted: 123, jobsActive: 0, reputation: 87, region: "africa" },
];

// Generate random active job flows
export function generateMockFlows(): JobFlow[] {
  const flows: JobFlow[] = [];
  const activeNodes = MOCK_NODES.filter(n => n.status !== "offline");
  const requesters = activeNodes.filter(n => n.type === "requester" || n.jobsActive > 0);
  const workers = activeNodes.filter(n => n.type === "worker" && n.status !== "offline");

  // Create some active flows
  for (let i = 0; i < 15; i++) {
    const from = requesters[Math.floor(Math.random() * requesters.length)];
    const to = workers[Math.floor(Math.random() * workers.length)];

    if (from && to && from.id !== to.id) {
      flows.push({
        id: `flow-${i}`,
        from: from.location,
        to: to.location,
        fromNodeId: from.id,
        toNodeId: to.id,
        status: Math.random() > 0.3 ? "active" : "complete",
        startTime: Date.now() - Math.random() * 60000,
        progress: Math.random(),
      });
    }
  }

  return flows;
}

export const MOCK_REGIONS: RegionStats[] = [
  { id: "north-america", name: "North America", center: { lat: 39.8283, lng: -98.5795 }, workerCount: 5, requesterCount: 1, activeJobs: 17, completedJobs: 5554, demandScore: 65, supplyScore: 78 },
  { id: "europe", name: "Europe", center: { lat: 50.1109, lng: 8.6821 }, workerCount: 5, requesterCount: 1, activeJobs: 16, completedJobs: 6183, demandScore: 72, supplyScore: 85 },
  { id: "asia-pacific", name: "Asia Pacific", center: { lat: 35.8617, lng: 104.1954 }, workerCount: 5, requesterCount: 1, activeJobs: 27, completedJobs: 9781, demandScore: 85, supplyScore: 68 },
  { id: "south-america", name: "South America", center: { lat: -14.235, lng: -51.9253 }, workerCount: 1, requesterCount: 1, activeJobs: 4, completedJobs: 543, demandScore: 78, supplyScore: 35 },
  { id: "middle-east", name: "Middle East", center: { lat: 29.3117, lng: 47.4818 }, workerCount: 1, requesterCount: 0, activeJobs: 2, completedJobs: 765, demandScore: 55, supplyScore: 45 },
  { id: "africa", name: "Africa", center: { lat: -8.7832, lng: 34.5085 }, workerCount: 2, requesterCount: 0, activeJobs: 1, completedJobs: 357, demandScore: 82, supplyScore: 22 },
];

export const MOCK_HEALTH_ALERTS: NetworkHealth[] = [
  { status: "healthy", message: "All systems operational", timestamp: Date.now() },
];

// Generate timelapse data (simulated network growth over time)
export function generateTimelapseData(days: number = 30): TimelapseFrame[] {
  const frames: TimelapseFrame[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let d = days; d >= 0; d--) {
    const timestamp = now - d * dayMs;
    const growthFactor = (days - d) / days;

    // Start with fewer nodes and grow
    const nodeCount = Math.floor(5 + growthFactor * (MOCK_NODES.length - 5));
    const nodes = MOCK_NODES.slice(0, nodeCount).map(node => ({
      ...node,
      jobsCompleted: Math.floor(node.jobsCompleted * growthFactor),
    }));

    // Generate some flows for this frame
    const flowCount = Math.floor(3 + growthFactor * 12);
    const flows: JobFlow[] = [];
    for (let i = 0; i < flowCount; i++) {
      const from = nodes[Math.floor(Math.random() * nodes.length)];
      const to = nodes[Math.floor(Math.random() * nodes.length)];
      if (from && to && from.id !== to.id) {
        flows.push({
          id: `timelapse-flow-${d}-${i}`,
          from: from.location,
          to: to.location,
          fromNodeId: from.id,
          toNodeId: to.id,
          status: "active",
          startTime: timestamp,
          progress: Math.random(),
        });
      }
    }

    frames.push({ timestamp, nodes, flows });
  }

  return frames;
}
