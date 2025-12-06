import { NextRequest, NextResponse } from "next/server";
import type { Worker, WorkerStatus } from "@/types";

// In-memory worker storage
const workerStore = new Map<string, Worker>();

// GET /api/workers - List all workers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as WorkerStatus | null;

  let workers = Array.from(workerStore.values());

  // Filter by status
  if (status) {
    workers = workers.filter((worker) => worker.status === status);
  }

  // Sort by reputation (highest first)
  workers.sort((a, b) => b.stats.reputation - a.stats.reputation);

  return NextResponse.json({ workers });
}

// POST /api/workers - Register a new worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const worker: Worker = body.worker;

    if (!worker || !worker.id) {
      return NextResponse.json(
        { error: "Invalid worker data" },
        { status: 400 }
      );
    }

    // Store the worker
    workerStore.set(worker.id, worker);

    return NextResponse.json({ worker }, { status: 201 });
  } catch (error) {
    console.error("Error registering worker:", error);
    return NextResponse.json(
      { error: "Failed to register worker" },
      { status: 500 }
    );
  }
}

// PATCH /api/workers - Update worker by address
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, ...updates } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Worker address required" },
        { status: 400 }
      );
    }

    // Find worker by address
    let worker: Worker | undefined;
    for (const w of workerStore.values()) {
      if (w.address === address) {
        worker = w;
        break;
      }
    }

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Update the worker
    const updatedWorker = { ...worker, ...updates, lastSeenAt: Date.now() };
    workerStore.set(worker.id, updatedWorker);

    return NextResponse.json({ worker: updatedWorker });
  } catch (error) {
    console.error("Error updating worker:", error);
    return NextResponse.json(
      { error: "Failed to update worker" },
      { status: 500 }
    );
  }
}

// Export worker store for use in stats
export { workerStore };
