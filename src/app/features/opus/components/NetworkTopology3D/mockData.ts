// Mock data for Living Network Topology 3D visualization

import type { TopologyNode, JobParticle, TopologyConnection, NetworkHealthState } from "./types";
import { generateNodePosition } from "./types";

// Generate mock topology nodes
function createMockNodes(): TopologyNode[] {
  const nodes: TopologyNode[] = [];

  // Central dispatcher
  nodes.push({
    id: "dispatcher-1",
    name: "Central Dispatcher",
    type: "dispatcher",
    status: "online",
    position: [0, 0, 0],
    activity: 0.85,
    jobsCompleted: 15420,
    jobsActive: 47,
    computePower: 100,
    region: "global",
    connections: [],
  });

  // Orchestrators (inner ring)
  const orchestratorCount = 4;
  for (let i = 0; i < orchestratorCount; i++) {
    const id = `orchestrator-${i + 1}`;
    nodes.push({
      id,
      name: `Orchestrator ${i + 1}`,
      type: "orchestrator",
      status: i === 2 ? "busy" : "online",
      position: generateNodePosition("orchestrator", i, orchestratorCount),
      activity: 0.5 + Math.random() * 0.5,
      jobsCompleted: Math.floor(2000 + Math.random() * 3000),
      jobsActive: Math.floor(5 + Math.random() * 15),
      computePower: 80 + Math.floor(Math.random() * 20),
      region: ["us-east", "eu-west", "asia-pac", "us-west"][i],
      connections: ["dispatcher-1"],
    });
  }

  // Workers (outer ring)
  const workerCount = 12;
  const statuses: TopologyNode["status"][] = ["online", "busy", "idle", "offline"];
  for (let i = 0; i < workerCount; i++) {
    const orchestratorIdx = i % orchestratorCount;
    const id = `worker-${i + 1}`;
    nodes.push({
      id,
      name: `Worker Node ${i + 1}`,
      type: "worker",
      status: i === 7 ? "offline" : statuses[Math.floor(Math.random() * 3)],
      position: generateNodePosition("worker", i, workerCount),
      activity: Math.random(),
      jobsCompleted: Math.floor(500 + Math.random() * 2000),
      jobsActive: Math.floor(Math.random() * 8),
      computePower: 40 + Math.floor(Math.random() * 60),
      region: ["us-east", "eu-west", "asia-pac", "us-west"][orchestratorIdx],
      connections: [`orchestrator-${orchestratorIdx + 1}`],
    });
  }

  // Requesters (between orchestrators and workers)
  const requesterCount = 6;
  for (let i = 0; i < requesterCount; i++) {
    const orchestratorIdx = i % orchestratorCount;
    const id = `requester-${i + 1}`;
    nodes.push({
      id,
      name: `Requester ${i + 1}`,
      type: "requester",
      status: "online",
      position: generateNodePosition("requester", i, requesterCount),
      activity: 0.3 + Math.random() * 0.7,
      jobsCompleted: 0,
      jobsActive: Math.floor(1 + Math.random() * 5),
      computePower: 0,
      region: ["us-east", "eu-west", "asia-pac", "us-west"][orchestratorIdx],
      connections: [`orchestrator-${orchestratorIdx + 1}`],
    });
  }

  // Connect dispatcher to all orchestrators
  nodes[0].connections = nodes
    .filter((n) => n.type === "orchestrator")
    .map((n) => n.id);

  return nodes;
}

export const MOCK_TOPOLOGY_NODES: TopologyNode[] = createMockNodes();

// Generate mock job particles
export function generateMockParticles(nodes: TopologyNode[]): JobParticle[] {
  const particles: JobParticle[] = [];
  const jobTypes: JobParticle["jobType"][] = ["inference", "training", "embedding"];

  const activeNodes = nodes.filter((n) => n.status !== "offline");
  const requesters = activeNodes.filter((n) => n.type === "requester");
  const workers = activeNodes.filter((n) => n.type === "worker");
  const orchestrators = activeNodes.filter((n) => n.type === "orchestrator");
  const dispatchers = activeNodes.filter((n) => n.type === "dispatcher");

  // Create particles flowing through the network
  let particleId = 0;

  // Requester to Orchestrator flows
  for (let i = 0; i < 8; i++) {
    const from = requesters[Math.floor(Math.random() * requesters.length)];
    const to = orchestrators[Math.floor(Math.random() * orchestrators.length)];
    if (from && to) {
      particles.push({
        id: `particle-${particleId++}`,
        fromNodeId: from.id,
        toNodeId: to.id,
        progress: Math.random(),
        status: "traveling",
        color: "#22d3ee",
        speed: 0.5 + Math.random() * 0.5,
        size: 0.03 + Math.random() * 0.02,
        jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      });
    }
  }

  // Orchestrator to Worker flows
  for (let i = 0; i < 12; i++) {
    const from = orchestrators[Math.floor(Math.random() * orchestrators.length)];
    const to = workers[Math.floor(Math.random() * workers.length)];
    if (from && to && to.status !== "offline") {
      particles.push({
        id: `particle-${particleId++}`,
        fromNodeId: from.id,
        toNodeId: to.id,
        progress: Math.random(),
        status: Math.random() > 0.7 ? "processing" : "traveling",
        color: "#a855f7",
        speed: 0.3 + Math.random() * 0.4,
        size: 0.04 + Math.random() * 0.02,
        jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      });
    }
  }

  // Dispatcher to Orchestrator flows
  for (let i = 0; i < 6; i++) {
    const from = dispatchers[0];
    const to = orchestrators[Math.floor(Math.random() * orchestrators.length)];
    if (from && to) {
      particles.push({
        id: `particle-${particleId++}`,
        fromNodeId: from.id,
        toNodeId: to.id,
        progress: Math.random(),
        status: "traveling",
        color: "#34d399",
        speed: 0.8 + Math.random() * 0.3,
        size: 0.05,
        jobType: "inference",
      });
    }
  }

  return particles;
}

// Generate mock connections
export function generateMockConnections(nodes: TopologyNode[]): TopologyConnection[] {
  const connections: TopologyConnection[] = [];
  let connId = 0;

  for (const node of nodes) {
    for (const targetId of node.connections) {
      // Avoid duplicate connections
      if (!connections.some((c) => c.fromId === targetId && c.toId === node.id)) {
        connections.push({
          id: `conn-${connId++}`,
          fromId: node.id,
          toId: targetId,
          bandwidth: Math.random(),
          latency: 10 + Math.random() * 100,
          status: Math.random() > 0.8 ? "congested" : Math.random() > 0.3 ? "active" : "idle",
        });
      }
    }
  }

  return connections;
}

// Generate mock health state
export function generateMockHealthState(
  nodes: TopologyNode[],
  particles: JobParticle[]
): NetworkHealthState {
  const onlineNodes = nodes.filter((n) => n.status !== "offline");
  const activeJobs = particles.filter((p) => p.status === "traveling").length;
  const processingJobs = particles.filter((p) => p.status === "processing").length;

  const uptime = (onlineNodes.length / nodes.length) * 100;

  let overall: NetworkHealthState["overall"] = "healthy";
  if (uptime < 70 || activeJobs > 40) {
    overall = "degraded";
  }
  if (uptime < 50 || activeJobs > 60) {
    overall = "critical";
  }

  return {
    overall,
    latency: 15 + Math.random() * 30,
    throughput: 120 + Math.random() * 80,
    activeJobs: activeJobs + processingJobs,
    queuedJobs: Math.floor(5 + Math.random() * 20),
    nodeUptime: uptime,
  };
}
