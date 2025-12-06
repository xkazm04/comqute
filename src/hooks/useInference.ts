"use client";

import { useState, useCallback, useRef } from "react";
import { useJobStore } from "@/stores";
import type { JobParameters } from "@/types";

interface InferenceRequest {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: Partial<JobParameters>;
}

interface UseInferenceOptions {
  onToken?: (token: string) => void;
  onComplete?: (result: { output: string; tokens: number }) => void;
  onError?: (error: string) => void;
}

interface UseInferenceReturn {
  isStreaming: boolean;
  output: string;
  tokenCount: number;
  startInference: (jobId: string, request: InferenceRequest) => Promise<void>;
  cancelInference: () => void;
}

export function useInference(options: UseInferenceOptions = {}): UseInferenceReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { appendOutput, updateJob } = useJobStore();

  const startInference = useCallback(
    async (jobId: string, request: InferenceRequest) => {
      // Cancel any existing inference
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset state
      setOutput("");
      setTokenCount(0);
      setIsStreaming(true);

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        // Update job status to streaming
        updateJob(jobId, { status: "streaming", startedAt: Date.now() });

        const response = await fetch("/api/inference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Inference request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullOutput = "";
        let tokens = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.response) {
                  fullOutput += data.response;
                  tokens++;
                  setOutput(fullOutput);
                  setTokenCount(tokens);
                  appendOutput(jobId, data.response);
                  options.onToken?.(data.response);
                }

                if (data.done) {
                  // Update job with final stats
                  updateJob(jobId, {
                    status: "complete",
                    completedAt: Date.now(),
                    outputTokens: data.eval_count || tokens,
                  });

                  options.onComplete?.({
                    output: fullOutput,
                    tokens: data.eval_count || tokens,
                  });
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                console.warn("Failed to parse SSE data:", line);
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          // Inference was cancelled
          updateJob(jobId, { status: "cancelled" });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Inference failed";
        updateJob(jobId, {
          status: "failed",
          error: errorMessage,
          completedAt: Date.now(),
        });
        options.onError?.(errorMessage);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [appendOutput, updateJob, options]
  );

  const cancelInference = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    output,
    tokenCount,
    startInference,
    cancelInference,
  };
}
