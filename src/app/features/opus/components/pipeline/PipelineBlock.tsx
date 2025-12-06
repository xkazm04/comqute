"use client";

import { memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Eye,
  Code,
  FileText,
  GitBranch,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Play,
  Square,
  Trash2,
  Settings,
  GripVertical,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type {
  PipelineBlock as PipelineBlockType,
  ModelBlock,
  ConditionBlock,
  ConnectionPoint,
  BlockExecutionStatus,
} from "../../lib/pipeline/types";
import { BLOCK_COLORS, MODEL_CATEGORY_COLORS } from "../../lib/pipeline/constants";

// ============================================================================
// TYPES
// ============================================================================

interface PipelineBlockProps {
  block: PipelineBlockType;
  isSelected: boolean;
  executionStatus?: BlockExecutionStatus;
  onSelect: (blockId: string, addToSelection?: boolean) => void;
  onStartDrag: (blockId: string, offset: { x: number; y: number }) => void;
  onStartConnection: (blockId: string, outputId: string) => void;
  onCompleteConnection: (blockId: string, inputId: string) => void;
  onDelete: (blockId: string) => void;
  onOpenSettings?: (blockId: string) => void;
  zoom: number;
}

// ============================================================================
// ICONS
// ============================================================================

const BLOCK_ICONS: Record<string, typeof Cpu> = {
  model: Cpu,
  vision: Eye,
  code: Code,
  llm: Cpu,
  summarizer: FileText,
  embedding: Code,
  condition: GitBranch,
  transform: Shuffle,
  input: ArrowRight,
  output: Square,
};

const STATUS_ICONS: Record<BlockExecutionStatus, typeof Loader2> = {
  pending: AlertCircle,
  queued: Loader2,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  skipped: AlertCircle,
};

// ============================================================================
// CONNECTION POINT COMPONENT
// ============================================================================

interface ConnectionPointProps {
  point: ConnectionPoint;
  type: "input" | "output";
  blockId: string;
  onStartConnection?: (blockId: string, outputId: string) => void;
  onCompleteConnection?: (blockId: string, inputId: string) => void;
}

function ConnectionPointComponent({
  point,
  type,
  blockId,
  onStartConnection,
  onCompleteConnection,
}: ConnectionPointProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (type === "output" && onStartConnection) {
        onStartConnection(blockId, point.id);
      }
    },
    [type, blockId, point.id, onStartConnection]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (type === "input" && onCompleteConnection) {
        onCompleteConnection(blockId, point.id);
      }
    },
    [type, blockId, point.id, onCompleteConnection]
  );

  const colors = {
    text: "bg-emerald-500",
    image: "bg-purple-500",
    code: "bg-blue-500",
    json: "bg-amber-500",
    any: "bg-zinc-400",
  };

  return (
    <div
      className={`flex items-center gap-2 ${type === "input" ? "flex-row" : "flex-row-reverse"}`}
      data-testid={`connection-point-${point.id}`}
    >
      <motion.div
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`
          w-3 h-3 rounded-full cursor-pointer transition-all
          ${colors[point.dataType]}
          ${point.connected ? "ring-2 ring-white/50" : ""}
          hover:ring-2 hover:ring-cyan-400
        `}
        data-testid={`connection-handle-${point.id}`}
      />
      <span className="text-[10px] text-zinc-500 font-medium">{point.label}</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PipelineBlock = memo(function PipelineBlock({
  block,
  isSelected,
  executionStatus,
  onSelect,
  onStartDrag,
  onStartConnection,
  onCompleteConnection,
  onDelete,
  onOpenSettings,
  zoom,
}: PipelineBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const rect = blockRef.current?.getBoundingClientRect();
      if (!rect) return;

      onSelect(block.id, e.shiftKey);
      onStartDrag(block.id, {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      });
    },
    [block.id, onSelect, onStartDrag, zoom]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(block.id);
    },
    [block.id, onDelete]
  );

  const handleSettings = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenSettings?.(block.id);
    },
    [block.id, onOpenSettings]
  );

  // Get block styling
  const blockType = block.type === "model" ? (block as ModelBlock).category : block.type;
  const colors = BLOCK_COLORS[block.type] || BLOCK_COLORS.model;
  const Icon = BLOCK_ICONS[blockType] || BLOCK_ICONS.model;
  const StatusIcon = executionStatus ? STATUS_ICONS[executionStatus] : null;

  // Check if this is a protected block (input/output)
  const isProtected = block.type === "input" || block.type === "output";

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        absolute cursor-move select-none
        ${isSelected ? "z-20" : "z-10"}
      `}
      style={{
        left: block.position.x,
        top: block.position.y,
        transform: "translate(-50%, -50%)",
      }}
      data-testid={`pipeline-block-${block.id}`}
    >
      {/* Main Block */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          relative min-w-[180px] rounded-xl border-2 transition-all duration-200
          ${colors.bg} ${colors.border}
          ${isSelected ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-zinc-950" : ""}
          ${executionStatus === "running" ? "animate-pulse" : ""}
        `}
      >
        {/* Header */}
        <div className={`flex items-center gap-2 px-3 py-2 border-b ${colors.border}`}>
          <GripVertical className="w-3 h-3 text-zinc-600 cursor-grab" />
          <Icon className={`w-4 h-4 ${colors.text}`} />
          <span className="flex-1 text-sm font-medium text-zinc-200 truncate">
            {block.label}
          </span>

          {/* Execution Status */}
          {StatusIcon && (
            <StatusIcon
              className={`w-4 h-4 ${
                executionStatus === "completed"
                  ? "text-emerald-400"
                  : executionStatus === "failed"
                  ? "text-red-400"
                  : executionStatus === "running"
                  ? "text-cyan-400 animate-spin"
                  : "text-zinc-500"
              }`}
            />
          )}

          {/* Actions */}
          {!isProtected && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onOpenSettings && (
                <button
                  onClick={handleSettings}
                  className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300"
                  data-testid={`block-settings-${block.id}`}
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400"
                data-testid={`block-delete-${block.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Block Type Badge */}
        {block.type === "model" && (
          <div className="px-3 py-1 border-b border-zinc-800/50">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {(block as ModelBlock).category}
            </span>
          </div>
        )}

        {/* Connection Points */}
        <div className="flex justify-between px-3 py-3">
          {/* Inputs */}
          <div className="space-y-2">
            {block.inputs.map((input) => (
              <ConnectionPointComponent
                key={input.id}
                point={input}
                type="input"
                blockId={block.id}
                onCompleteConnection={onCompleteConnection}
              />
            ))}
          </div>

          {/* Outputs */}
          <div className="space-y-2">
            {block.outputs.map((output) => (
              <ConnectionPointComponent
                key={output.id}
                point={output}
                type="output"
                blockId={block.id}
                onStartConnection={onStartConnection}
              />
            ))}
          </div>
        </div>

        {/* Condition Value (for condition blocks) */}
        {block.type === "condition" && (
          <div className="px-3 pb-2">
            <div className="text-[10px] text-zinc-500 mb-1">
              {(block as ConditionBlock).conditionType}
            </div>
            <div className="text-xs text-amber-400 font-mono truncate">
              {(block as ConditionBlock).conditionValue || "(not set)"}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});
