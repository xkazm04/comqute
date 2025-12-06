"use client";

import { useState, useEffect, useCallback } from "react";

interface HealthStatus {
  status: string;
  ollama: boolean;
  availableModels: string[];
  timestamp: number;
}

interface UseHealthReturn {
  health: HealthStatus | null;
  isLoading: boolean;
  error: Error | null;
  isOllamaOnline: boolean;
  refetch: () => Promise<void>;
}

export function useHealth(pollInterval = 10000): UseHealthReturn {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Health check failed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchHealth();
  }, [fetchHealth]);

  // Initial fetch and polling
  useEffect(() => {
    fetchHealth();

    const interval = setInterval(fetchHealth, pollInterval);

    return () => clearInterval(interval);
  }, [fetchHealth, pollInterval]);

  return {
    health,
    isLoading,
    error,
    isOllamaOnline: health?.ollama ?? false,
    refetch,
  };
}
