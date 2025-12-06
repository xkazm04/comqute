"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo,
  Redo,
  Save,
  Settings,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit3,
} from "lucide-react";
import { BlockPalette } from "./BlockPalette";
import { PipelineBlock } from "./PipelineBlock";
import { PipelineConnection, DrawingConnection } from "./PipelineConnection";
import { usePipelineBuilder, usePipelineExecution } from "../../lib/pipeline";
import type { ModelCategory, Pipeline } from "../../lib/pipeline/types";
import { GlassCard } from "../../shared";
import { formatCost } from "@/lib/pricing";

// ============================================================================
// TYPES
// ============================================================================

interface PipelineBuilderProps {
  userId: string;
  onSave?: (pipeline: Pipeline) => void;
  onClose?: () => void;
  initialPipeline?: Pipeline;
}

// ============================================================================
// TOOLBAR
// ============================================================================

interface ToolbarProps {
  pipelineName: string;
  onNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  isValid: boolean;
  isModified: boolean;
  onSave: () => void;
  onClose?: () => void;
}

function Toolbar({
  pipelineName,
  onNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  isValid,
  isModified,
  onSave,
  onClose,
}: ToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(pipelineName);

  const handleNameSubmit = () => {
    onNameChange(editedName);
    setIsEditingName(false);
  };

  return (
    <div
      className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl"
      data-testid="pipeline-toolbar"
    >
      {/* Left: Name & Status */}
      <div className="flex items-center gap-4">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") setIsEditingName(false);
            }}
            className="px-2 py-1 bg-zinc-800 border border-cyan-500 rounded text-white font-medium focus:outline-none"
            autoFocus
            data-testid="pipeline-name-input"
          />
        ) : (
          <button
            onClick={() => {
              setEditedName(pipelineName);
              setIsEditingName(true);
            }}
            className="flex items-center gap-2 text-white font-medium hover:text-cyan-400 transition-colors"
            data-testid="pipeline-name-btn"
          >
            <span>{pipelineName}</span>
            <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        )}

        {isModified && (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Unsaved
          </span>
        )}

        {!isValid && (
          <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Incomplete
          </span>
        )}
      </div>

      {/* Center: Undo/Redo & Zoom */}
      <div className="flex items-center gap-2">
        {/* History */}
        <div className="flex items-center gap-1 px-2 border-r border-zinc-700">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo"
            data-testid="undo-btn"
          >
            <Undo className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
            data-testid="redo-btn"
          >
            <Redo className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Zoom Out"
            data-testid="zoom-out-btn"
          >
            <ZoomOut className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-xs text-zinc-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Zoom In"
            data-testid="zoom-in-btn"
          >
            <ZoomIn className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={onResetView}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Reset View"
            data-testid="reset-view-btn"
          >
            <Maximize2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!isValid}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          data-testid="save-pipeline-btn"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Close"
            data-testid="close-pipeline-btn"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXECUTION PANEL
// ============================================================================

interface ExecutionPanelProps {
  onExecute: (input: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  progress: number;
  output?: string;
  totalCost: number;
  totalTokens: number;
  error?: string;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onReset: () => void;
}

function ExecutionPanel({
  onExecute,
  isRunning,
  isPaused,
  isComplete,
  progress,
  output,
  totalCost,
  totalTokens,
  error,
  onPause,
  onResume,
  onCancel,
  onReset,
}: ExecutionPanelProps) {
  const [input, setInput] = useState("");

  const handleExecute = () => {
    if (input.trim()) {
      onExecute(input);
    }
  };

  return (
    <div
      className="w-80 border-l border-zinc-800 bg-zinc-900/80 backdrop-blur-xl flex flex-col"
      data-testid="execution-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          Execute Pipeline
        </h3>
      </div>

      {/* Input */}
      <div className="p-4 border-b border-zinc-800/50">
        <label className="text-xs text-zinc-500 mb-2 block">Pipeline Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input for the pipeline..."
          className="w-full h-24 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
          disabled={isRunning}
          data-testid="pipeline-input-textarea"
        />
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-zinc-800/50 flex items-center gap-2">
        {!isRunning && !isComplete && (
          <button
            onClick={handleExecute}
            disabled={!input.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            data-testid="execute-pipeline-btn"
          >
            <Play className="w-4 h-4" />
            Run Pipeline
          </button>
        )}

        {isRunning && !isPaused && (
          <>
            <button
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors"
              data-testid="pause-pipeline-btn"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={onCancel}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              data-testid="cancel-pipeline-btn"
            >
              <Square className="w-4 h-4" />
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={onResume}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
              data-testid="resume-pipeline-btn"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
            <button
              onClick={onCancel}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </>
        )}

        {isComplete && (
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            data-testid="reset-pipeline-btn"
          >
            Run Again
          </button>
        )}
      </div>

      {/* Progress */}
      {(isRunning || isComplete) && (
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Progress</span>
            <span className="text-xs text-zinc-400">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              className={`h-full ${
                error ? "bg-red-500" : isComplete ? "bg-emerald-500" : "bg-cyan-500"
              }`}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500">
            <span>{totalTokens} tokens</span>
            <span>{formatCost(totalCost)}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 border-b border-zinc-800/50">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Error
            </div>
            <p className="text-xs text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Output */}
      <div className="flex-1 p-4 overflow-auto">
        <label className="text-xs text-zinc-500 mb-2 block">Output</label>
        {output ? (
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        ) : (
          <div className="text-xs text-zinc-600 italic">
            Run the pipeline to see output...
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS
// ============================================================================

interface CanvasProps {
  children: React.ReactNode;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (pan: { x: number; y: number }) => void;
  onDrop: (e: React.DragEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function Canvas({
  children,
  zoom,
  pan,
  onPan,
  onDrop,
  onMouseMove,
  onMouseUp,
  onClick,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    onMouseMove(e);

    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      onPan({ x: pan.x + dx, y: pan.y + dy });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    onMouseUp(e);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Pan with scroll
    if (!e.ctrlKey) {
      onPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-zinc-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      data-testid="pipeline-canvas"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, #27272a 1px, transparent 1px)
          `,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Transformed content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>

      {/* Help hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600">
        Alt+Drag or Middle-click to pan • Scroll to navigate
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PipelineBuilder({
  userId,
  onSave,
  onClose,
  initialPipeline,
}: PipelineBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pipeline builder state
  const builder = usePipelineBuilder(userId);

  // Pipeline execution state
  const execution = usePipelineExecution();

  // Load initial pipeline if provided
  useEffect(() => {
    if (initialPipeline) {
      builder.loadPipeline(initialPipeline);
    }
  }, [initialPipeline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag state for palette blocks
  const [draggedBlock, setDraggedBlock] = useState<{
    modelId: string;
    category: ModelCategory;
    displayName: string;
  } | null>(null);

  // ----------------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------------

  const handlePaletteDragStart = useCallback(
    (
      modelId: string,
      category: ModelCategory,
      displayName: string,
      e: React.DragEvent
    ) => {
      setDraggedBlock({ modelId, category, displayName });
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!draggedBlock || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - builder.pan.x) / builder.zoom;
      const y = (e.clientY - rect.top - builder.pan.y) / builder.zoom;

      builder.addModelBlock(
        draggedBlock.modelId,
        draggedBlock.category,
        draggedBlock.displayName,
        { x, y }
      );

      setDraggedBlock(null);
    },
    [draggedBlock, builder]
  );

  const handleAddCondition = useCallback(() => {
    // Add condition block in the center of the visible canvas
    const x = (400 - builder.pan.x) / builder.zoom;
    const y = (300 - builder.pan.y) / builder.zoom;
    builder.addConditionBlock({ x, y });
  }, [builder]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (builder.isDragging && builder.draggedBlockId) {
        const canvas = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - canvas.left - builder.pan.x) / builder.zoom;
        const y = (e.clientY - canvas.top - builder.pan.y) / builder.zoom;
        builder.moveBlock(builder.draggedBlockId, { x, y });
      }

      if (builder.isDrawingConnection) {
        const canvas = e.currentTarget.getBoundingClientRect();
        builder.updateConnectionMouse({
          x: (e.clientX - canvas.left - builder.pan.x) / builder.zoom,
          y: (e.clientY - canvas.top - builder.pan.y) / builder.zoom,
        });
      }
    },
    [builder]
  );

  const handleMouseUp = useCallback(() => {
    builder.stopDragging();
    if (builder.isDrawingConnection) {
      builder.cancelDrawingConnection();
    }
  }, [builder]);

  const handleCanvasClick = useCallback(() => {
    builder.clearSelection();
  }, [builder]);

  const handleSave = useCallback(() => {
    onSave?.(builder.pipeline);
  }, [builder.pipeline, onSave]);

  const handleExecute = useCallback(
    (input: string) => {
      execution.execute(builder.pipeline, input, {
        onBlockStart: (blockId) => {
          console.log("Block started:", blockId);
        },
        onBlockComplete: (blockId, output) => {
          console.log("Block completed:", blockId, output.slice(0, 50));
        },
        onPipelineComplete: (output) => {
          console.log("Pipeline completed:", output.slice(0, 100));
        },
        onPipelineError: (error) => {
          console.error("Pipeline error:", error);
        },
      });
    },
    [builder.pipeline, execution]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          builder.selection.selectedBlockIds.length > 0 ||
          builder.selection.selectedConnectionIds.length > 0
        ) {
          e.preventDefault();
          builder.deleteSelected();
        }
      }

      if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          builder.redo();
        } else {
          builder.undo();
        }
      }

      if (e.key === "Escape") {
        builder.clearSelection();
        builder.cancelDrawingConnection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [builder]);

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <div
      className="h-[600px] flex flex-col rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950"
      data-testid="pipeline-builder"
    >
      {/* Toolbar */}
      <Toolbar
        pipelineName={builder.pipeline.name}
        onNameChange={(name) => builder.updatePipelineInfo({ name })}
        canUndo={builder.canUndo}
        canRedo={builder.canRedo}
        onUndo={builder.undo}
        onRedo={builder.redo}
        zoom={builder.zoom}
        onZoomIn={() => builder.setZoom(builder.zoom + 0.1)}
        onZoomOut={() => builder.setZoom(builder.zoom - 0.1)}
        onResetView={builder.resetView}
        isValid={builder.isValid}
        isModified={builder.isModified}
        onSave={handleSave}
        onClose={onClose}
      />

      {/* Main Area */}
      <div className="flex-1 flex">
        {/* Block Palette */}
        <BlockPalette
          onDragStart={handlePaletteDragStart}
          onAddCondition={handleAddCondition}
        />

        {/* Canvas */}
        <Canvas
          zoom={builder.zoom}
          pan={builder.pan}
          onPan={builder.setPan}
          onDrop={handleCanvasDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        >
          {/* SVG Layer for Connections */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ width: "100%", height: "100%" }}
          >
            {/* Existing connections */}
            {builder.pipeline.connections.map((connection) => (
              <PipelineConnection
                key={connection.id}
                connection={connection}
                blocks={builder.pipeline.blocks}
                isSelected={builder.selection.selectedConnectionIds.includes(
                  connection.id
                )}
                isActive={
                  execution.executionState?.blocks[connection.sourceBlockId]
                    ?.status === "completed"
                }
                onSelect={builder.selectConnection}
              />
            ))}

            {/* Drawing connection */}
            {builder.isDrawingConnection &&
              builder.connectionSourceBlockId &&
              builder.connectionSourceOutputId && (
                <DrawingConnection
                  sourceBlockId={builder.connectionSourceBlockId}
                  sourceOutputId={builder.connectionSourceOutputId}
                  blocks={builder.pipeline.blocks}
                  mousePosition={builder.connectionMousePosition}
                />
              )}
          </svg>

          {/* Blocks */}
          <AnimatePresence>
            {builder.pipeline.blocks.map((block) => (
              <PipelineBlock
                key={block.id}
                block={block}
                isSelected={builder.selection.selectedBlockIds.includes(block.id)}
                executionStatus={
                  execution.executionState?.blocks[block.id]?.status
                }
                onSelect={builder.selectBlock}
                onStartDrag={builder.startDragging}
                onStartConnection={builder.startDrawingConnection}
                onCompleteConnection={(blockId, inputId) => {
                  if (
                    builder.connectionSourceBlockId &&
                    builder.connectionSourceOutputId
                  ) {
                    builder.addConnection(
                      builder.connectionSourceBlockId,
                      builder.connectionSourceOutputId,
                      blockId,
                      inputId
                    );
                  }
                }}
                onDelete={builder.removeBlock}
                zoom={builder.zoom}
              />
            ))}
          </AnimatePresence>
        </Canvas>

        {/* Execution Panel */}
        <ExecutionPanel
          onExecute={handleExecute}
          isRunning={execution.isRunning}
          isPaused={execution.isPaused}
          isComplete={execution.isComplete}
          progress={execution.progress}
          output={execution.executionState?.output}
          totalCost={execution.executionState?.totalCost ?? 0}
          totalTokens={execution.executionState?.totalTokens ?? 0}
          error={execution.executionState?.error}
          onPause={execution.pause}
          onResume={execution.resume}
          onCancel={execution.cancel}
          onReset={execution.reset}
        />
      </div>
    </div>
  );
}
