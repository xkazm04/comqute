import { NextResponse } from "next/server";
import type { Job, Worker, JobStatus } from "@/types";
import { SUPPORTED_MODELS } from "@/lib/models";

// Note: In a real app, these would be imported from a shared module
// For demo purposes, we simulate the stats
const getNetworkStats = () => {
  // Build model stats dynamically from SUPPORTED_MODELS
  const modelStats = SUPPORTED_MODELS.reduce(
    (acc, model) => ({
      ...acc,
      [model.id]: {
        available: true,
        displayName: model.displayName,
        shortName: model.shortName,
        jobsCompleted: Math.floor(Math.random() * 30) + 5,
        avgResponseTimeMs:
          model.speed === "fast"
            ? Math.floor(Math.random() * 2000) + 1500
            : model.speed === "medium"
              ? Math.floor(Math.random() * 3000) + 2500
              : Math.floor(Math.random() * 5000) + 4000,
        isCloud: model.isCloud || false,
      },
    }),
    {} as Record<string, object>
  );

  // Simulated stats - in reality, these would come from the job and worker stores
  const stats = {
    network: {
      workersOnline: Math.floor(Math.random() * 5) + 1,
      jobsCompleted: Math.floor(Math.random() * 50) + 10,
      jobsPending: Math.floor(Math.random() * 5),
      jobsRunning: Math.floor(Math.random() * 3),
      totalVolumeQubic: Math.floor(Math.random() * 10000000) + 1000000,
      avgResponseTimeMs: Math.floor(Math.random() * 5000) + 3000,
    },
    models: modelStats,
    timestamp: Date.now(),
  };

  return stats;
};

// GET /api/stats - Get network statistics
export async function GET() {
  try {
    const stats = getNetworkStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    return NextResponse.json(
      { error: "Failed to get network stats" },
      { status: 500 }
    );
  }
}
