import { NextRequest, NextResponse } from "next/server";
import type { Job, JobStatus } from "@/types";

// Import shared job store
// Note: In a real app, this would be a database
const jobStore = new Map<string, Job>();

// GET /api/jobs/:id - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = jobStore.get(id);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ job });
}

// PATCH /api/jobs/:id - Update a job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = jobStore.get(id);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  try {
    const updates = await request.json();

    // Validate status transitions
    if (updates.status) {
      const validTransitions: Record<JobStatus, JobStatus[]> = {
        pending: ["assigned", "cancelled"],
        assigned: ["running", "cancelled"],
        running: ["streaming", "failed", "cancelled"],
        streaming: ["complete", "failed"],
        complete: [],
        failed: [],
        cancelled: [],
      };

      if (!validTransitions[job.status]?.includes(updates.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${job.status} to ${updates.status}`,
          },
          { status: 400 }
        );
      }
    }

    // Update the job
    const updatedJob = { ...job, ...updates };
    jobStore.set(id, updatedJob);

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/:id - Cancel a pending job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = jobStore.get(id);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  if (job.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending jobs can be cancelled" },
      { status: 400 }
    );
  }

  // Update status to cancelled
  const cancelledJob = { ...job, status: "cancelled" as JobStatus };
  jobStore.set(id, cancelledJob);

  return NextResponse.json({ job: cancelledJob });
}
