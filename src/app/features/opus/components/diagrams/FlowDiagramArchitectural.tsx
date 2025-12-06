"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FlowNodeArchitectural {
    id: string;
    label: string;
    sublabel?: string;
    icon: ReactNode;
    zone: string; // Grouping identifier
    status?: "active" | "inactive" | "warning";
    position: { x: number; y: number };
}

export interface FlowZone {
    id: string;
    label: string;
    color: "slate" | "blue" | "indigo";
    area: { x: number; y: number; width: number; height: number };
}

export interface FlowConnectionArch {
    from: string;
    to: string;
    label?: string;
    bidirectional?: boolean;
    type?: "solid" | "dashed" | "dotted";
    active?: boolean;
}

interface FlowDiagramArchitecturalProps {
    title: string;
    subtitle: string;
    nodes: FlowNodeArchitectural[];
    zones: FlowZone[];
    connections: FlowConnectionArch[];
    height?: number;
}

// ============================================================================
// ARCHITECTURAL CONNECTION
// ============================================================================

function ArchConnection({
    x1,
    y1,
    x2,
    y2,
    label,
    bidirectional = false,
    type = "solid",
    active = true,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label?: string;
    bidirectional?: boolean;
    type?: "solid" | "dashed" | "dotted";
    active?: boolean;
}) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Adjusted for new node size
    const nodeRadius = 24;
    const startX = x1 + nodeRadius * Math.cos(angle);
    const startY = y1 + nodeRadius * Math.sin(angle);
    const endX = x2 - nodeRadius * Math.cos(angle);
    const endY = y2 - nodeRadius * Math.sin(angle);

    const arrowLength = 6;

    // Arrow calculations
    const arrow1X = endX - arrowLength * Math.cos(angle);
    const arrow1Y = endY - arrowLength * Math.sin(angle);

    const arrow2X = startX + arrowLength * Math.cos(angle);
    const arrow2Y = startY + arrowLength * Math.sin(angle);

    const dashArray = type === "dashed" ? "4 4" : type === "dotted" ? "1 3" : "none";

    return (
        <g>
            {/* Connector Line */}
            <path
                d={`M ${startX} ${startY} L ${endX} ${endY}`}
                stroke={active ? "#64748b" : "#334155"}
                strokeWidth={1.5}
                strokeDasharray={dashArray}
                fill="none"
            />

            {/* Animation if active */}
            {active && (
                <motion.circle
                    r={2}
                    fill="#38bdf8"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        offsetPath: `path("M ${startX} ${startY} L ${endX} ${endY}")`,
                    }}
                />
            )}

            {/* End Arrow */}
            <polygon
                points={`${endX},${endY} ${arrow1X - 4 * Math.cos(angle - Math.PI / 2)},${arrow1Y - 4 * Math.sin(angle - Math.PI / 2)} ${arrow1X + 4 * Math.cos(angle - Math.PI / 2)},${arrow1Y + 4 * Math.sin(angle - Math.PI / 2)}`}
                fill={active ? "#64748b" : "#334155"}
            />

            {/* Start Arrow (for bidirectional) */}
            {bidirectional && (
                <polygon
                    points={`${startX},${startY} ${arrow2X - 4 * Math.cos(angle - Math.PI / 2)},${arrow2Y - 4 * Math.sin(angle - Math.PI / 2)} ${arrow2X + 4 * Math.cos(angle - Math.PI / 2)},${arrow2Y + 4 * Math.sin(angle - Math.PI / 2)}`}
                    fill={active ? "#64748b" : "#334155"}
                />
            )}

            {/* Label */}
            {label && (
                <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                        x={-label.length * 3 - 4}
                        y={-8}
                        width={label.length * 6 + 8}
                        height={16}
                        className="fill-zinc-900"
                    />
                    <text
                        textAnchor="middle"
                        dy={4}
                        className="text-[9px] fill-zinc-500 font-mono tracking-wider uppercase"
                    >
                        {label}
                    </text>
                </g>
            )}
        </g>
    );
}

// ============================================================================
// ZONE & NODE COMPONENTS
// ============================================================================

function ZoneRect({ zone }: { zone: FlowZone }) {
    const colors = {
        slate: "border-slate-800 bg-slate-900/20 text-slate-500",
        blue: "border-blue-900/50 bg-blue-900/10 text-blue-500",
        indigo: "border-indigo-900/50 bg-indigo-900/10 text-indigo-500",
    };

    return (
        <div
            className={`absolute border-2 border-dashed rounded-lg ${colors[zone.color]}`}
            style={{
                left: zone.area.x,
                top: zone.area.y,
                width: zone.area.width,
                height: zone.area.height
            }}
        >
            <span className="absolute -top-3 left-4 px-2 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest">
                {zone.label}
            </span>
        </div>
    );
}

function ArchNode({ node, index }: { node: FlowNodeArchitectural; index: number }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
            style={{ left: node.position.x, top: node.position.y }}
        >
            <div className={`
                relative w-12 h-12 rounded-lg 
                flex items-center justify-center 
                bg-zinc-900 border border-zinc-700 
                shadow-lg group-hover:border-zinc-500 group-hover:bg-zinc-800 transition-all
                z-10
            `}>
                <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {node.icon}
                </div>

                {/* Status Indicator */}
                {node.status === 'active' && <div className="absolute top-[-4px] right-[-4px] w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />}
                {node.status === 'warning' && <div className="absolute top-[-4px] right-[-4px] w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-950" />}
            </div>

            <div className="text-center bg-zinc-950/80 px-2 rounded-md border border-zinc-800/0 group-hover:border-zinc-800 transition-all backdrop-blur-sm z-20">
                <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-tight">{node.label}</div>
                {node.sublabel && <div className="text-[9px] text-zinc-600 group-hover:text-zinc-500">{node.sublabel}</div>}
            </div>
        </motion.div>
    );
}


// ============================================================================
// MAIN DIAGRAM ARCHITECTURAL
// ============================================================================

export function FlowDiagramArchitectural({
    title,
    subtitle,
    nodes,
    zones,
    connections,
    height = 400,
}: FlowDiagramArchitecturalProps) {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-950 overflow-hidden font-mono">
            <div className="flex border-b border-zinc-800">
                <div className="px-4 py-3 bg-zinc-900/50 border-r border-zinc-800">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">SYS.ARCH</div>
                </div>
                <div className="px-4 py-3 flex-1 bg-zinc-900/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-200 uppercase">{title}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{subtitle}</p>
                    </div>
                    <div className="text-[10px] text-zinc-600">v1.0.4</div>
                </div>
            </div>

            <div className="relative w-full bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" style={{ height }}>

                {/* Connection Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {connections.map((conn, i) => {
                        const fromNode = nodeMap.get(conn.from);
                        const toNode = nodeMap.get(conn.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <ArchConnection
                                key={`${conn.from}-${conn.to}-${i}`}
                                x1={fromNode.position.x}
                                y1={fromNode.position.y}
                                x2={toNode.position.x}
                                y2={toNode.position.y}
                                label={conn.label}
                                bidirectional={conn.bidirectional}
                                type={conn.type}
                                active={conn.active}
                            />
                        );
                    })}
                </svg>

                {/* Zones Layer */}
                {zones.map(zone => <ZoneRect key={zone.id} zone={zone} />)}

                {/* Nodes Layer */}
                {nodes.map((node, i) => (
                    <ArchNode key={node.id} node={node} index={i} />
                ))}
            </div>

            <div className="grid grid-cols-4 border-t border-zinc-800 bg-zinc-900/50 divide-x divide-zinc-800">
                {zones.map((zone) => (
                    <div key={zone.id} className="py-2 text-center">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">{zone.label}</div>
                        <div className="text-[9px] text-zinc-600">Active</div>
                    </div>
                ))}
                {/* If zones < 4 we might have empty cells, but this footer is just for show */}
            </div>
        </div>
    );
}
