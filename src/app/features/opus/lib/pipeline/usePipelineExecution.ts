/**
 * Pipeline Execution Hook
 *
 * Manages the execution state of a pipeline, including step-by-step
 * progression through blocks and handling of intermediate outputs.
 */

import { useState, useCallback, useRef } from "react";
import type {
  Pipeline,
  PipelineBlock,
  PipelineExecutionState,
  BlockExecutionState,
  PipelineExecutionStatus,
  BlockExecutionStatus,
  ConditionBlock,
  ModelBlock,
} from "./types";
import { getExecutionOrder } from "./types";
import { PIPELINE_MODELS } from "./constants";

// ============================================================================
// TYPES
// ============================================================================

interface ExecutionOptions {
  onBlockStart?: (blockId: string) => void;
  onBlockComplete?: (blockId: string, output: string) => void;
  onBlockError?: (blockId: string, error: string) => void;
  onPipelineComplete?: (output: string) => void;
  onPipelineError?: (error: string) => void;
}

// ============================================================================
// MOCK EXECUTION (for demo purposes)
// ============================================================================

async function mockModelExecution(
  block: ModelBlock,
  input: string
): Promise<{ output: string; tokensUsed: number; cost: number }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  const modelInfo = PIPELINE_MODELS.find((m) => m.modelId === block.modelId);
  const tokensUsed = Math.floor(100 + Math.random() * 400);
  const cost = Math.floor(
    (tokensUsed / 1000) * (modelInfo?.estimatedCostPer1k ?? 50000)
  );

  // Generate mock output based on model category
  let output: string;
  switch (block.category) {
    case "vision":
      output = `[Vision Analysis]\nThe image shows a modern user interface with:\n- Clean layout with clear hierarchy\n- Primary action button in cyan color\n- Dark theme with subtle gradients\n- Card-based component structure\n\nDetected elements: header, sidebar, main content area, footer navigation.`;
      break;
    case "code":
      output = `\`\`\`tsx
import React from 'react';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function GeneratedComponent({ title, onAction }: ComponentProps) {
  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400"
      >
        Take Action
      </button>
    </div>
  );
}
\`\`\``;
      break;
    case "summarizer":
      output = `**Summary:**\n${input.slice(0, 100)}...\n\n**Key Points:**\n1. Main concept identified\n2. Supporting details extracted\n3. Action items highlighted`;
      break;
    case "embedding":
      output = `[0.023, -0.156, 0.892, 0.445, -0.234, 0.678, ...]  // 768-dimensional vector`;
      break;
    default:
      output = `Processed input:\n\n${input}\n\n---\n\nAnalysis complete. The text has been processed through the ${block.label} model. Key insights have been extracted and formatted for the next stage of the pipeline.`;
  }

  return { output, tokensUsed, cost };
}

function evaluateCondition(
  block: ConditionBlock,
  input: string
): boolean {
  switch (block.conditionType) {
    case "contains":
      return input.toLowerCase().includes(block.conditionValue.toLowerCase());
    case "not_contains":
      return !input.toLowerCase().includes(block.conditionValue.toLowerCase());
    case "equals":
      return input === block.conditionValue;
    case "not_equals":
      return input !== block.conditionValue;
    case "regex_match":
      try {
        return new RegExp(block.conditionValue).test(input);
      } catch {
        return false;
      }
    case "length_gt":
      return input.length > parseInt(block.conditionValue, 10);
    case "length_lt":
      return input.length < parseInt(block.conditionValue, 10);
    default:
      return true;
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function usePipelineExecution() {
  const [executionState, setExecutionState] = useState<PipelineExecutionState | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // ----------------------------------------------------------------------------
  // STATE HELPERS
  // ----------------------------------------------------------------------------

  const updateBlockState = useCallback(
    (blockId: string, updates: Partial<BlockExecutionState>) => {
      setExecutionState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: {
            ...prev.blocks,
            [blockId]: {
              ...prev.blocks[blockId],
              ...updates,
            },
          },
        };
      });
    },
    []
  );

  const updateExecutionStatus = useCallback(
    (status: PipelineExecutionStatus, updates?: Partial<PipelineExecutionState>) => {
      setExecutionState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status,
          ...updates,
        };
      });
    },
    []
  );

  // ----------------------------------------------------------------------------
  // EXECUTION
  // ----------------------------------------------------------------------------

  const execute = useCallback(
    async (pipeline: Pipeline, input: string, options: ExecutionOptions = {}) => {
      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Initialize execution state
      const executionId = `exec-${Date.now()}`;
      const blockStates: Record<string, BlockExecutionState> = {};

      for (const block of pipeline.blocks) {
        blockStates[block.id] = {
          blockId: block.id,
          status: "pending",
        };
      }

      const initialState: PipelineExecutionState = {
        pipelineId: pipeline.id,
        executionId,
        status: "running",
        blocks: blockStates,
        input,
        startedAt: Date.now(),
        totalCost: 0,
        totalTokens: 0,
      };

      setExecutionState(initialState);

      // Get execution order
      const executionOrder = getExecutionOrder(pipeline);
      const blockMap = new Map(pipeline.blocks.map((b) => [b.id, b]));
      const outputs: Record<string, string> = {};

      try {
        for (const blockId of executionOrder) {
          // Check for abort
          if (abortControllerRef.current?.signal.aborted) {
            updateExecutionStatus("cancelled");
            return;
          }

          const block = blockMap.get(blockId);
          if (!block) continue;

          // Update current block
          setExecutionState((prev) =>
            prev ? { ...prev, currentBlockId: blockId } : prev
          );

          // Get input for this block
          let blockInput: string;

          if (block.type === "input") {
            blockInput = input;
            outputs[blockId] = input;
            updateBlockState(blockId, {
              status: "completed",
              input,
              output: input,
              completedAt: Date.now(),
            });
            continue;
          }

          // Find connected input
          const incomingConnection = pipeline.connections.find(
            (c) => c.targetBlockId === blockId
          );

          if (incomingConnection) {
            blockInput = outputs[incomingConnection.sourceBlockId] || "";
          } else {
            blockInput = "";
          }

          // Start block execution
          options.onBlockStart?.(blockId);
          updateBlockState(blockId, {
            status: "running",
            input: blockInput,
            startedAt: Date.now(),
          });

          try {
            let blockOutput: string;

            if (block.type === "model") {
              // Execute model
              const result = await mockModelExecution(block as ModelBlock, blockInput);
              blockOutput = result.output;

              updateBlockState(blockId, {
                status: "completed",
                output: blockOutput,
                tokensUsed: result.tokensUsed,
                cost: result.cost,
                completedAt: Date.now(),
              });

              // Update totals
              setExecutionState((prev) =>
                prev
                  ? {
                      ...prev,
                      totalCost: prev.totalCost + result.cost,
                      totalTokens: prev.totalTokens + result.tokensUsed,
                    }
                  : prev
              );
            } else if (block.type === "condition") {
              // Evaluate condition
              const conditionBlock = block as ConditionBlock;
              const result = evaluateCondition(conditionBlock, blockInput);

              // Pass input through to the appropriate branch
              blockOutput = blockInput;

              // Mark appropriate connections as active
              const trueOutput = block.outputs[0]; // True branch
              const falseOutput = block.outputs[1]; // False branch

              // Store which branch was taken
              outputs[`${blockId}-branch`] = result ? "true" : "false";

              updateBlockState(blockId, {
                status: "completed",
                output: `Condition: ${result ? "TRUE" : "FALSE"}`,
                completedAt: Date.now(),
              });
            } else if (block.type === "output") {
              // Final output
              blockOutput = blockInput;
              outputs[blockId] = blockOutput;

              updateBlockState(blockId, {
                status: "completed",
                input: blockInput,
                output: blockOutput,
                completedAt: Date.now(),
              });

              // Pipeline complete
              updateExecutionStatus("completed", {
                output: blockOutput,
                completedAt: Date.now(),
              });

              options.onPipelineComplete?.(blockOutput);
              return;
            } else {
              // Transform or other block types
              blockOutput = blockInput;
              updateBlockState(blockId, {
                status: "completed",
                output: blockOutput,
                completedAt: Date.now(),
              });
            }

            outputs[blockId] = blockOutput;
            options.onBlockComplete?.(blockId, blockOutput);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            updateBlockState(blockId, {
              status: "failed",
              error: errorMessage,
              completedAt: Date.now(),
            });
            options.onBlockError?.(blockId, errorMessage);
            throw error;
          }
        }

        // If we get here without hitting an output block, mark as complete
        updateExecutionStatus("completed", {
          completedAt: Date.now(),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Pipeline execution failed";
        updateExecutionStatus("failed", {
          error: errorMessage,
          completedAt: Date.now(),
        });
        options.onPipelineError?.(errorMessage);
      }
    },
    [updateBlockState, updateExecutionStatus]
  );

  // ----------------------------------------------------------------------------
  // CONTROL
  // ----------------------------------------------------------------------------

  const pause = useCallback(() => {
    setExecutionState((prev) =>
      prev && prev.status === "running"
        ? { ...prev, status: "paused" }
        : prev
    );
  }, []);

  const resume = useCallback(() => {
    setExecutionState((prev) =>
      prev && prev.status === "paused"
        ? { ...prev, status: "running" }
        : prev
    );
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setExecutionState((prev) =>
      prev
        ? {
            ...prev,
            status: "cancelled",
            completedAt: Date.now(),
          }
        : prev
    );
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setExecutionState(null);
  }, []);

  // ----------------------------------------------------------------------------
  // COMPUTED
  // ----------------------------------------------------------------------------

  const isRunning = executionState?.status === "running";
  const isPaused = executionState?.status === "paused";
  const isComplete =
    executionState?.status === "completed" ||
    executionState?.status === "failed" ||
    executionState?.status === "cancelled";

  const currentBlockId = executionState?.currentBlockId;
  const progress = executionState
    ? Object.values(executionState.blocks).filter(
        (b) => b.status === "completed" || b.status === "failed"
      ).length / Object.keys(executionState.blocks).length
    : 0;

  // ----------------------------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------------------------

  return {
    // State
    executionState,
    isRunning,
    isPaused,
    isComplete,
    currentBlockId,
    progress,

    // Actions
    execute,
    pause,
    resume,
    cancel,
    reset,

    // Block state access
    getBlockState: (blockId: string) => executionState?.blocks[blockId],
  };
}
