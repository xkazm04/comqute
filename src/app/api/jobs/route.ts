import { NextRequest, NextResponse } from "next/server";
import type { Job, JobStatus } from "@/types";

// In-memory job storage (resets on server restart)
const jobStore = new Map<string, Job>();

// GET /api/jobs - List jobs with optional filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as JobStatus | null;
  const requester = searchParams.get("requester");

  let jobs = Array.from(jobStore.values());

  // Filter by status
  if (status) {
    jobs = jobs.filter((job) => job.status === status);
  }

  // Filter by requester
  if (requester) {
    jobs = jobs.filter((job) => job.requester === requester);
  }

  // Sort by creation time (newest first)
  jobs.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ jobs });
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job: Job = body.job;

    if (!job || !job.id) {
      return NextResponse.json(
        { error: "Invalid job data" },
        { status: 400 }
      );
    }

    // Store the job
    jobStore.set(job.id, job);

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

// Export job store for use in other routes
export { jobStore };
