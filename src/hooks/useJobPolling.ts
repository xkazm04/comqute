"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Job, JobStatus } from "@/types";
import { JOB_POLL_INTERVAL } from "@/lib/constants";

interface UseJobPollingOptions {
  status?: JobStatus | JobStatus[];
  requester?: string;
  interval?: number;
  enabled?: boolean;
}

interface UseJobPollingReturn {
  jobs: Job[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useJobPolling(
  options: UseJobPollingOptions = {}
): UseJobPollingReturn {
  const {
    status,
    requester,
    interval = JOB_POLL_INTERVAL,
    enabled = true,
  } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (status) {
        // API supports single status, take first if array
        const statusValue = Array.isArray(status) ? status[0] : status;
        params.set("status", statusValue);
      }

      if (requester) {
        params.set("requester", requester);
      }

      const queryString = params.toString();
      const url = `/api/jobs${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();

      // Filter by multiple statuses if needed (client-side)
      let filteredJobs = data.jobs || [];
      if (Array.isArray(status) && status.length > 1) {
        filteredJobs = filteredJobs.filter((job: Job) =>
          status.includes(job.status)
        );
      }

      setJobs(filteredJobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch jobs"));
    } finally {
      setIsLoading(false);
    }
  }, [status, requester]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchJobs();
  }, [fetchJobs]);

  // Initial fetch and polling
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchJobs();

    // Setup polling
    intervalRef.current = setInterval(fetchJobs, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    refetch,
  };
}
