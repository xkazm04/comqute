/**
 * AI Pipeline Types
 *
 * Type definitions for composable multi-model AI pipelines.
 * Enables users to chain multiple AI models together in workflows.
 */

import type { ModelConfig } from "@/lib/models";

// ============================================================================
// PIPELINE BLOCK TYPES
// ============================================================================

/**
 * Types of blocks that can exist in a pipeline
 */
export type PipelineBlockType =
  | "model"       // AI model inference
  | "condition"   // Conditional branching
  | "transform"   // Data transformation
  | "input"       // Pipeline input
  | "output";     // Pipeline output

/**
 * Model category for specialized routing
 */
export type ModelCategory =
  | "vision"      // Image analysis
  | "llm"         // General language model
  | "code"        // Code generation
  | "summarizer"  // Text summarization
  | "embedding"   // Vector embeddings
  | "custom";     // Custom model

/**
 * Block connection point
 */
export interface ConnectionPoint {
  id: string;
  blockId: string;
  type: "input" | "output";
  label: string;
  dataType: "text" | "image" | "code" | "json" | "any";
  connected: boolean;
  connectionId?: string;
}

/**
 * Base pipeline block interface
 */
export interface PipelineBlockBase {
  id: string;
  type: PipelineBlockType;
  position: { x: number; y: number };
  label: string;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
}

/**
 * Model block - executes AI model inference
 */
export interface ModelBlock extends PipelineBlockBase {
  type: "model";
  modelId: string;
  category: ModelCategory;
  systemPrompt?: string;
  parameters: {
    maxTokens: number;
    temperature: number;
  };
}

/**
 * Condition types for branching
 */
export type ConditionType =
  | "contains"
  | "not_contains"
  | "equals"
  | "not_equals"
  | "regex_match"
  | "length_gt"
  | "length_lt"
  | "json_path"
  | "custom";

/**
 * Condition block - enables branching based on output content
 */
export interface ConditionBlock extends PipelineBlockBase {
  type: "condition";
  conditionType: ConditionType;
  conditionValue: string;
  // Output[0] = true branch, Output[1] = false branch
}

/**
 * Transform types for data manipulation
 */
export type TransformType =
  | "extract_json"
  | "extract_code"
  | "format_template"
  | "split"
  | "merge"
  | "truncate"
  | "custom";

/**
 * Transform block - transforms data between models
 */
export interface TransformBlock extends PipelineBlockBase {
  type: "transform";
  transformType: TransformType;
  transformConfig: Record<string, unknown>;
}

/**
 * Input block - pipeline entry point
 */
export interface InputBlock extends PipelineBlockBase {
  type: "input";
  inputType: "text" | "image" | "file" | "json";
  defaultValue?: string;
}

/**
 * Output block - pipeline exit point
 */
export interface OutputBlock extends PipelineBlockBase {
  type: "output";
  outputFormat: "text" | "json" | "code" | "markdown";
}

/**
 * Union type for all pipeline blocks
 */
export type PipelineBlock =
  | ModelBlock
  | ConditionBlock
  | TransformBlock
  | InputBlock
  | OutputBlock;

// ============================================================================
// PIPELINE CONNECTIONS
// ============================================================================

/**
 * Connection between two blocks
 */
export interface PipelineConnection {
  id: string;
  sourceBlockId: string;
  sourceOutputId: string;
  targetBlockId: string;
  targetInputId: string;
  label?: string;
}

// ============================================================================
// PIPELINE DEFINITION
// ============================================================================

/**
 * Complete pipeline definition
 */
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  version: number;
  blocks: PipelineBlock[];
  connections: PipelineConnection[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
}

/**
 * Pipeline template for quick creation
 */
export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  pipeline: Omit<Pipeline, "id" | "createdAt" | "updatedAt" | "createdBy">;
  thumbnail?: string;
  usageCount: number;
}

// ============================================================================
// PIPELINE EXECUTION
// ============================================================================

/**
 * Execution status of a block
 */
export type BlockExecutionStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

/**
 * Execution state for a single block
 */
export interface BlockExecutionState {
  blockId: string;
  status: BlockExecutionStatus;
  input?: string;
  output?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  tokensUsed?: number;
  cost?: number;
}

/**
 * Pipeline execution status
 */
export type PipelineExecutionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Complete pipeline execution state
 */
export interface PipelineExecutionState {
  pipelineId: string;
  executionId: string;
  status: PipelineExecutionStatus;
  blocks: Record<string, BlockExecutionState>;
  currentBlockId?: string;
  input: string;
  output?: string;
  startedAt: number;
  completedAt?: number;
  totalCost: number;
  totalTokens: number;
  error?: string;
}

// ============================================================================
// PIPELINE BUILDER STATE
// ============================================================================

/**
 * Drag state for pipeline builder
 */
export interface DragState {
  isDragging: boolean;
  draggedBlockId?: string;
  draggedBlockType?: PipelineBlockType;
  dragOffset: { x: number; y: number };
}

/**
 * Connection drawing state
 */
export interface ConnectionDrawState {
  isDrawing: boolean;
  sourceBlockId?: string;
  sourceOutputId?: string;
  mousePosition: { x: number; y: number };
}

/**
 * Selection state
 */
export interface SelectionState {
  selectedBlockIds: string[];
  selectedConnectionIds: string[];
}

/**
 * Pipeline builder state
 */
export interface PipelineBuilderState {
  pipeline: Pipeline;
  drag: DragState;
  connection: ConnectionDrawState;
  selection: SelectionState;
  zoom: number;
  pan: { x: number; y: number };
  history: Pipeline[];
  historyIndex: number;
  isModified: boolean;
}

// ============================================================================
// MODEL BLOCK CATALOG
// ============================================================================

/**
 * Available model for pipeline blocks
 */
export interface PipelineModelOption {
  modelId: string;
  category: ModelCategory;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  estimatedCostPer1k: number;
}

/**
 * Block palette category
 */
export interface BlockPaletteCategory {
  id: string;
  label: string;
  icon: string;
  blocks: PipelineModelOption[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new empty pipeline
 */
export function createEmptyPipeline(createdBy: string): Pipeline {
  const inputId = `input-${Date.now()}`;
  const outputId = `output-${Date.now() + 1}`;

  return {
    id: `pipeline-${Date.now()}`,
    name: "New Pipeline",
    description: "",
    version: 1,
    blocks: [
      {
        id: inputId,
        type: "input",
        position: { x: 100, y: 200 },
        label: "Input",
        inputType: "text",
        inputs: [],
        outputs: [
          {
            id: `${inputId}-out-1`,
            blockId: inputId,
            type: "output",
            label: "Text",
            dataType: "text",
            connected: false,
          },
        ],
      },
      {
        id: outputId,
        type: "output",
        position: { x: 700, y: 200 },
        label: "Output",
        outputFormat: "text",
        inputs: [
          {
            id: `${outputId}-in-1`,
            blockId: outputId,
            type: "input",
            label: "Result",
            dataType: "any",
            connected: false,
          },
        ],
        outputs: [],
      },
    ],
    connections: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
    isPublic: false,
    tags: [],
  };
}

/**
 * Create a model block with defaults
 */
export function createModelBlock(
  modelId: string,
  category: ModelCategory,
  label: string,
  position: { x: number; y: number }
): ModelBlock {
  const blockId = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: blockId,
    type: "model",
    position,
    label,
    modelId,
    category,
    parameters: {
      maxTokens: 500,
      temperature: 0.7,
    },
    inputs: [
      {
        id: `${blockId}-in-1`,
        blockId,
        type: "input",
        label: "Input",
        dataType: category === "vision" ? "image" : "text",
        connected: false,
      },
    ],
    outputs: [
      {
        id: `${blockId}-out-1`,
        blockId,
        type: "output",
        label: "Output",
        dataType: category === "code" ? "code" : "text",
        connected: false,
      },
    ],
  };
}

/**
 * Create a condition block
 */
export function createConditionBlock(
  position: { x: number; y: number }
): ConditionBlock {
  const blockId = `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: blockId,
    type: "condition",
    position,
    label: "Condition",
    conditionType: "contains",
    conditionValue: "",
    inputs: [
      {
        id: `${blockId}-in-1`,
        blockId,
        type: "input",
        label: "Value",
        dataType: "any",
        connected: false,
      },
    ],
    outputs: [
      {
        id: `${blockId}-out-1`,
        blockId,
        type: "output",
        label: "True",
        dataType: "any",
        connected: false,
      },
      {
        id: `${blockId}-out-2`,
        blockId,
        type: "output",
        label: "False",
        dataType: "any",
        connected: false,
      },
    ],
  };
}

/**
 * Create a connection between blocks
 */
export function createConnection(
  sourceBlockId: string,
  sourceOutputId: string,
  targetBlockId: string,
  targetInputId: string
): PipelineConnection {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceBlockId,
    sourceOutputId,
    targetBlockId,
    targetInputId,
  };
}

/**
 * Validate if a connection is valid
 */
export function isValidConnection(
  pipeline: Pipeline,
  sourceBlockId: string,
  targetBlockId: string
): { valid: boolean; reason?: string } {
  // Can't connect to self
  if (sourceBlockId === targetBlockId) {
    return { valid: false, reason: "Cannot connect block to itself" };
  }

  // Check for cycles (simplified check)
  const visited = new Set<string>();
  const queue = [targetBlockId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceBlockId) {
      return { valid: false, reason: "Connection would create a cycle" };
    }
    if (visited.has(current)) continue;
    visited.add(current);

    // Find connections from current block
    const outgoingConnections = pipeline.connections.filter(
      (c) => c.sourceBlockId === current
    );
    for (const conn of outgoingConnections) {
      queue.push(conn.targetBlockId);
    }
  }

  return { valid: true };
}

/**
 * Get execution order of blocks (topological sort)
 */
export function getExecutionOrder(pipeline: Pipeline): string[] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  // Initialize
  for (const block of pipeline.blocks) {
    inDegree[block.id] = 0;
    adjacency[block.id] = [];
  }

  // Build graph
  for (const conn of pipeline.connections) {
    adjacency[conn.sourceBlockId].push(conn.targetBlockId);
    inDegree[conn.targetBlockId]++;
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const blockId of Object.keys(inDegree)) {
    if (inDegree[blockId] === 0) {
      queue.push(blockId);
    }
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    for (const neighbor of adjacency[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order;
}
