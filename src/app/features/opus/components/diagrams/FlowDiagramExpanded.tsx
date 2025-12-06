"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FlowNodeExpanded {
    id: string;
    label: string;
    icon: ReactNode;
    description?: string;
    features?: string[]; // New: Bullet points
    color?: "cyan" | "emerald" | "amber" | "purple" | "blue" | "zinc";
    position: { x: number; y: number };
}

export interface FlowConnection {
    from: string;
    to: string;
    label?: string;
    animated?: boolean;
    dashed?: boolean;
}

interface FlowDiagramExpandedProps {
    title: string;
    description: string;
    nodes: FlowNodeExpanded[];
    connections: FlowConnection[];
    height?: number;
}

// ============================================================================
// ANIMATED CONNECTION LINE
// ============================================================================

function ConnectionLine({
    x1,
    y1,
    x2,
    y2,
    label,
    animated = true,
    dashed = false,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label?: string;
    animated?: boolean;
    dashed?: boolean;
}) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10; // Slightly larger arrow
    const arrowX = x2 - arrowLength * Math.cos(angle);
    const arrowY = y2 - arrowLength * Math.sin(angle);

    return (
        <g>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(63, 63, 70, 0.5)"
                strokeWidth={3} // Thicker line
                strokeDasharray={dashed ? "6 6" : "none"}
            />

            {animated && (
                <motion.line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#flowGradientExpanded)"
                    strokeWidth={3}
                    strokeDasharray={length}
                    initial={{ strokeDashoffset: length }}
                    animate={{ strokeDashoffset: [length, 0, -length] }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            )}

            {animated && (
                <motion.circle
                    r={4} // Larger dot
                    fill="#22d3ee"
                    filter="url(#glowExpanded)"
                    initial={{ cx: x1, cy: y1 }}
                    animate={{ cx: x2, cy: y2 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}

            <polygon
                points={`${x2},${y2} ${arrowX - 5 * Math.cos(angle - Math.PI / 2)},${arrowY - 5 * Math.sin(angle - Math.PI / 2)} ${arrowX + 5 * Math.cos(angle - Math.PI / 2)},${arrowY + 5 * Math.sin(angle - Math.PI / 2)}`}
                fill="rgba(34, 211, 238, 0.8)"
            />

            {label && (
                <g transform={`translate(${midX}, ${midY - 12})`}>
                    <rect
                        x={-label.length * 4 - 8}
                        y={-10}
                        width={label.length * 8 + 16}
                        height={20}
                        rx={6}
                        fill="rgba(24, 24, 27, 0.95)"
                        stroke="rgba(63, 63, 70, 0.8)"
                        strokeWidth={1}
                    />
                    <text
                        textAnchor="middle"
                        dy={4}
                        className="text-[11px] fill-zinc-300 font-semibold"
                    >
                        {label}
                    </text>
                </g>
            )}
        </g>
    );
}

// ============================================================================
// FLOW NODE EXPANDED
// ============================================================================

const colorClasses = {
    cyan: {
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        icon: "text-cyan-400",
        ring: "ring-cyan-500/20",
        feature: "text-cyan-300",
    },
    emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: "text-emerald-400",
        ring: "ring-emerald-500/20",
        feature: "text-emerald-300",
    },
    amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: "text-amber-400",
        ring: "ring-amber-500/20",
        feature: "text-amber-300",
    },
    purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        icon: "text-purple-400",
        ring: "ring-purple-500/20",
        feature: "text-purple-300",
    },
    blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        icon: "text-blue-400",
        ring: "ring-blue-500/20",
        feature: "text-blue-300",
    },
    zinc: {
        bg: "bg-zinc-800/50",
        border: "border-zinc-700/50",
        icon: "text-zinc-400",
        ring: "ring-zinc-500/20",
        feature: "text-zinc-400",
    },
};

function FlowNodeComponent({ node, index }: { node: FlowNodeExpanded; index: number }) {
    const colors = colorClasses[node.color || "cyan"];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4, type: "spring" }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.position.x, top: node.position.y }}
        >
            <div
                className={`
          relative flex flex-col gap-3 p-4 rounded-2xl
          ${colors.bg} border ${colors.border}
          ring-1 ${colors.ring}
          backdrop-blur-md shadow-xl
          min-w-[160px] max-w-[200px]
        `}
            >
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                    <div className={`p-2 rounded-lg bg-black/20 ${colors.icon}`}>
                        {node.icon}
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-white whitespace-nowrap">
                            {node.label}
                        </span>
                        {node.description && (
                            <span className="block text-[10px] text-zinc-400 leading-tight">
                                {node.description}
                            </span>
                        )}
                    </div>
                </div>

                {node.features && node.features.length > 0 && (
                    <ul className="space-y-1.5 pl-1">
                        {node.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                                <span className={`mt-1 h-1 w-1 rounded-full flex-shrink-0 ${colors.icon}`} />
                                <span className="leading-tight">{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    );
}

// ============================================================================
// MAIN DIAGRAM EXPANDED
// ============================================================================

export function FlowDiagramExpanded({
    title,
    description,
    nodes,
    connections,
    height = 360,
}: FlowDiagramExpandedProps) {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
                <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{description}</p>
                </div>
                <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
            </div>

            <div className="relative w-full" style={{ height }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="flowGradientExpanded" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                            <stop offset="50%" stopColor="rgba(34, 211, 238, 1)" />
                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                        </linearGradient>
                        <filter id="glowExpanded">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {connections.map((conn, i) => {
                        const fromNode = nodeMap.get(conn.from);
                        const toNode = nodeMap.get(conn.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <ConnectionLine
                                key={`${conn.from}-${conn.to}-${i}`}
                                x1={fromNode.position.x}
                                y1={fromNode.position.y}
                                x2={toNode.position.x}
                                y2={toNode.position.y}
                                label={conn.label}
                                animated={conn.animated !== false}
                                dashed={conn.dashed}
                            />
                        );
                    })}
                </svg>

                {nodes.map((node, i) => (
                    <FlowNodeComponent key={node.id} node={node} index={i} />
                ))}
            </div>
        </div>
    );
}
