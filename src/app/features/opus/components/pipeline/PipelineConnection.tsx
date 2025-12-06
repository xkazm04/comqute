"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { PipelineConnection as PipelineConnectionType, PipelineBlock } from "../../lib/pipeline/types";

// ============================================================================
// TYPES
// ============================================================================

interface PipelineConnectionProps {
  connection: PipelineConnectionType;
  blocks: PipelineBlock[];
  isSelected: boolean;
  isActive?: boolean;
  onSelect: (connectionId: string) => void;
}

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isSelected: boolean;
  isActive?: boolean;
  animated?: boolean;
}

// ============================================================================
// CONNECTION LINE COMPONENT
// ============================================================================

function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  isSelected,
  isActive,
  animated,
}: ConnectionLineProps) {
  // Calculate control points for a smooth bezier curve
  const dx = x2 - x1;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const path = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

  return (
    <g>
      {/* Background line for easier selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
      />

      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? "#22d3ee" : isActive ? "#10b981" : "#3f3f46"}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-colors duration-200"
      />

      {/* Animated flow indicator */}
      {(isActive || animated) && (
        <motion.circle
          r={4}
          fill="#22d3ee"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath: `path("${path}")`,
          }}
        />
      )}

      {/* Arrow at the end */}
      <circle
        cx={x2}
        cy={y2}
        r={4}
        fill={isSelected ? "#22d3ee" : isActive ? "#10b981" : "#3f3f46"}
        className="transition-colors duration-200"
      />
    </g>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PipelineConnection = memo(function PipelineConnection({
  connection,
  blocks,
  isSelected,
  isActive,
  onSelect,
}: PipelineConnectionProps) {
  // Find source and target blocks
  const { sourcePos, targetPos } = useMemo(() => {
    const sourceBlock = blocks.find((b) => b.id === connection.sourceBlockId);
    const targetBlock = blocks.find((b) => b.id === connection.targetBlockId);

    if (!sourceBlock || !targetBlock) {
      return { sourcePos: null, targetPos: null };
    }

    // Calculate connection point positions
    // Output points are on the right side of the block
    // Input points are on the left side of the block
    const blockWidth = 180;
    const blockHeight = 100;

    // Find the output point index
    const outputIndex = sourceBlock.outputs.findIndex(
      (o) => o.id === connection.sourceOutputId
    );
    const outputCount = sourceBlock.outputs.length;
    const outputOffset = ((outputIndex + 1) / (outputCount + 1)) * blockHeight;

    // Find the input point index
    const inputIndex = targetBlock.inputs.findIndex(
      (i) => i.id === connection.targetInputId
    );
    const inputCount = targetBlock.inputs.length;
    const inputOffset = ((inputIndex + 1) / (inputCount + 1)) * blockHeight;

    return {
      sourcePos: {
        x: sourceBlock.position.x + blockWidth / 2,
        y: sourceBlock.position.y - blockHeight / 2 + outputOffset,
      },
      targetPos: {
        x: targetBlock.position.x - blockWidth / 2,
        y: targetBlock.position.y - blockHeight / 2 + inputOffset,
      },
    };
  }, [connection, blocks]);

  if (!sourcePos || !targetPos) {
    return null;
  }

  return (
    <g
      onClick={() => onSelect(connection.id)}
      className="cursor-pointer"
      data-testid={`pipeline-connection-${connection.id}`}
    >
      <ConnectionLine
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        isSelected={isSelected}
        isActive={isActive}
        animated={isActive}
      />
    </g>
  );
});

// ============================================================================
// DRAWING CONNECTION (while user is dragging)
// ============================================================================

interface DrawingConnectionProps {
  sourceBlockId: string;
  sourceOutputId: string;
  blocks: PipelineBlock[];
  mousePosition: { x: number; y: number };
}

export function DrawingConnection({
  sourceBlockId,
  sourceOutputId,
  blocks,
  mousePosition,
}: DrawingConnectionProps) {
  const sourcePos = useMemo(() => {
    const sourceBlock = blocks.find((b) => b.id === sourceBlockId);
    if (!sourceBlock) return null;

    const blockWidth = 180;
    const blockHeight = 100;

    const outputIndex = sourceBlock.outputs.findIndex(
      (o) => o.id === sourceOutputId
    );
    const outputCount = sourceBlock.outputs.length;
    const outputOffset = ((outputIndex + 1) / (outputCount + 1)) * blockHeight;

    return {
      x: sourceBlock.position.x + blockWidth / 2,
      y: sourceBlock.position.y - blockHeight / 2 + outputOffset,
    };
  }, [sourceBlockId, sourceOutputId, blocks]);

  if (!sourcePos) return null;

  // Calculate bezier curve
  const dx = mousePosition.x - sourcePos.x;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const path = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + controlOffset} ${sourcePos.y}, ${mousePosition.x - controlOffset} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;

  return (
    <g data-testid="drawing-connection">
      <path
        d={path}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2}
        strokeDasharray="8 4"
        opacity={0.7}
      />
      <motion.circle
        r={4}
        fill="#22d3ee"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          offsetPath: `path("${path}")`,
        }}
      />
    </g>
  );
}
