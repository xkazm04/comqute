"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import {
  Code,
  Server,
  Cpu,
  Wallet,
  ArrowRightLeft,
  ChevronRight,
  Play,
  Pause
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  zone: string;
  status?: "active" | "inactive" | "warning";
  position: { x: number; y: number };
}

export interface FlowZone {
  id: string;
  label: string;
  color: "slate" | "blue" | "indigo";
  area: { x: number; y: number; width: number; height: number };
}

export interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  bidirectional?: boolean;
  type?: "solid" | "dashed" | "dotted";
  active?: boolean;
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  activeNodes: string[];
  activeConnections: number[]; // Indices of connections
}

interface FlowDiagramProps {
  title: string;
  subtitle: string;
  nodes: FlowNode[];
  zones: FlowZone[];
  connections: FlowConnection[];
  steps: FlowStep[];
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

  const nodeRadius = 32; // Larger radius for w-16 nodes
  const startX = x1 + nodeRadius * Math.cos(angle);
  const startY = y1 + nodeRadius * Math.sin(angle);
  const endX = x2 - nodeRadius * Math.cos(angle);
  const endY = y2 - nodeRadius * Math.sin(angle);

  const arrowLength = 8;
  const arrow1X = endX - arrowLength * Math.cos(angle);
  const arrow1Y = endY - arrowLength * Math.sin(angle);
  const arrow2X = startX + arrowLength * Math.cos(angle);
  const arrow2Y = startY + arrowLength * Math.sin(angle);

  // Dash array logic
  const dashArray = type === "dashed" ? "8 6" : type === "dotted" ? "2 4" : "none";

  return (
    <g className="transition-all duration-500">
      {/* Base Line */}
      <path
        d={`M ${startX} ${startY} L ${endX} ${endY}`}
        stroke={active ? "#94a3b8" : "#334155"}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={dashArray}
        fill="none"
        className="transition-colors duration-500"
      />

      {/* Animated Traffic - Dashed Effect Movement */}
      {active && (
        <motion.path
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke="#38bdf8"
          strokeWidth={2}
          strokeDasharray="8 6"
          fill="none"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -28 }} // specific loop length
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* End Arrow */}
      <polygon
        points={`${endX},${endY} ${arrow1X - 5 * Math.cos(angle - Math.PI / 2)},${arrow1Y - 5 * Math.sin(angle - Math.PI / 2)} ${arrow1X + 5 * Math.cos(angle - Math.PI / 2)},${arrow1Y + 5 * Math.sin(angle - Math.PI / 2)}`}
        fill={active ? "#38bdf8" : "#334155"}
        className="transition-colors duration-500"
      />

      {/* Start Arrow (for bidirectional) */}
      {bidirectional && (
        <polygon
          points={`${startX},${startY} ${arrow2X - 5 * Math.cos(angle - Math.PI / 2)},${arrow2Y - 5 * Math.sin(angle - Math.PI / 2)} ${arrow2X + 5 * Math.cos(angle - Math.PI / 2)},${arrow2Y + 5 * Math.sin(angle - Math.PI / 2)}`}
          fill={active ? "#38bdf8" : "#334155"}
          className="transition-colors duration-500"
        />
      )}

      {/* Label */}
      {label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-label.length * 4 - 6}
            y={-10}
            width={label.length * 8 + 12}
            height={20}
            rx={4}
            className="fill-zinc-900/90 stroke-zinc-800"
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            dy={4}
            className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-500 ${active ? "fill-cyan-400" : "fill-zinc-600"}`}
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
      className={`absolute border-2 border-dashed rounded-xl ${colors[zone.color]}`}
      style={{
        left: zone.area.x,
        top: zone.area.y,
        width: zone.area.width,
        height: zone.area.height
      }}
    >
      <span className="absolute -top-3 left-6 px-2 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest">
        {zone.label}
      </span>
    </div>
  );
}

function ArchNode({ node, isActive }: { node: FlowNode; isActive: boolean }) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: isActive ? 1 : 0.6
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 group cursor-pointer"
      style={{ left: node.position.x, top: node.position.y }}
    >
      <div className={`
              relative w-16 h-16 rounded-2xl 
              flex items-center justify-center 
              bg-zinc-900 border-2 transition-all duration-500
              shadow-xl
              ${isActive ? "border-cyan-500 shadow-cyan-500/20" : "border-zinc-700"}
              z-10
          `}>
        <div className={`transition-colors duration-500 ${isActive ? "text-cyan-400" : "text-zinc-500"}`}>
          {node.icon}
        </div>
      </div>

      <div className="text-center z-20">
        <div className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${isActive ? "text-white" : "text-zinc-500"}`}>
          {node.label}
        </div>
        {node.sublabel && (
          <div className="text-[10px] text-zinc-600 font-medium">
            {node.sublabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// STEPPER PANEL
// ============================================================================

function FlowStepper({
  step,
  stepIndex,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev
}: {
  step: FlowStep,
  stepIndex: number,
  totalSteps: number,
  isPlaying: boolean,
  onTogglePlay: () => void,
  onNext: () => void,
  onPrev: () => void
}) {
  return (
    <div className="h-24 bg-zinc-900/80 border-t border-zinc-800 flex items-center px-6 gap-6 backdrop-blur-md">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current pl-0.5" />}
        </button>
      </div>

      {/* Step Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            Step {stepIndex + 1}/{totalSteps}
          </span>
          <h4 className="text-base font-bold text-zinc-200">{step.title}</h4>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          {step.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            onClick={() => i === stepIndex ? onTogglePlay : null} // Allow clicking for jump? maybe simpler just visuals
            className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${i === stepIndex ? "bg-cyan-500" : "bg-zinc-800"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DIAGRAM COMPONENT
// ============================================================================

export function RequesterFlowDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // DATA DEFINITIONS
  const zones: FlowZone[] = [
    { id: "client", label: "Client Layer", color: "slate", area: { x: 20, y: 40, width: 280, height: 320 } },
    { id: "protocol", label: "Protocol Layer", color: "indigo", area: { x: 320, y: 40, width: 280, height: 320 } },
    { id: "compute", label: "Compute Layer", color: "blue", area: { x: 620, y: 40, width: 280, height: 320 } },
  ];

  const nodes: FlowNode[] = [
    { id: "app", label: "Application", sublabel: "Next.js / React", icon: <Code className="w-8 h-8" />, zone: "client", position: { x: 160, y: 120 } },
    { id: "wallet", label: "Wallet", sublabel: "Signature", icon: <Wallet className="w-8 h-8" />, zone: "client", position: { x: 160, y: 260 } },
    { id: "dispatcher", label: "Dispatcher", sublabel: "Job Routing", icon: <ArrowRightLeft className="w-8 h-8" />, zone: "protocol", position: { x: 460, y: 190 } },
    { id: "worker", label: "Orchestrator", sublabel: "Job Claim", icon: <Server className="w-8 h-8" />, zone: "compute", position: { x: 760, y: 120 } },
    { id: "llm", label: "LLM Engine", sublabel: "Ollama / Exo", icon: <Cpu className="w-8 h-8" />, zone: "compute", position: { x: 760, y: 260 } },
  ];

  const connections: FlowConnection[] = [
    { from: "app", to: "dispatcher", label: "Request", bidirectional: true, active: false },      // 0
    { from: "wallet", to: "dispatcher", label: "Sign", type: "dotted", active: false },           // 1
    { from: "dispatcher", to: "worker", label: "Distribute", active: false },                     // 2
    { from: "worker", to: "llm", label: "Exec", type: "dashed", active: false },                  // 3
  ];

  const steps: FlowStep[] = [
    {
      id: "init",
      title: "Initialization",
      description: "The application prepares the job request. The user signs the transaction via their wallet to authorize the compute spend.",
      activeNodes: ["app", "wallet"],
      activeConnections: [1]
    },
    {
      id: "dispatch",
      title: "Dispatch",
      description: "The signed request is sent to the Protocol Dispatcher, which broadcasts the job availability to the decentralized network.",
      activeNodes: ["app", "dispatcher"],
      activeConnections: [0]
    },
    {
      id: "claim",
      title: "Worker Claim",
      description: "An available Orchestrator node claims the job from the queue, locking the reward and preparing for execution.",
      activeNodes: ["dispatcher", "worker"],
      activeConnections: [2]
    },
    {
      id: "exec",
      title: "Execution",
      description: "The Orchestrator feeds the prompt to the local LLM Engine (e.g., Ollama). Tokens are streamed back through the tunnel.",
      activeNodes: ["worker", "llm"],
      activeConnections: [3]
    }
  ];

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000); // 4 seconds per step

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const activeStep = steps[currentStep];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Calculate connections based on current step
  const currentConnections = connections.map((conn, index) => ({
    ...conn,
    active: activeStep.activeConnections.includes(index)
  }));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono shadow-2xl">
      {/* Header */}
      <div className="flex border-b border-zinc-800">
        <div className="px-4 py-3 bg-zinc-900/50 border-r border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">SYS.ARCH</div>
        </div>
        <div className="px-5 py-3 flex-1 bg-zinc-900/30 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">Requester Flow Architecture</h3>
          </div>
          <div className="text-[10px] text-zinc-600 font-bold bg-zinc-900 px-2 py-0.5 rounded">LIVE</div>
        </div>
      </div>

      {/* Diagram Area */}
      <div className="relative w-full bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]" style={{ height: 400 }}>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {currentConnections.map((conn, i) => {
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

        {zones.map(zone => <ZoneRect key={zone.id} zone={zone} />)}

        {nodes.map((node) => (
          <ArchNode
            key={node.id}
            node={node}
            isActive={activeStep.activeNodes.includes(node.id)}
          />
        ))}
      </div>

      {/* Stepper Panel */}
      <FlowStepper
        step={activeStep}
        stepIndex={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={() => setCurrentStep((c) => (c + 1) % steps.length)}
        onPrev={() => setCurrentStep((c) => (c - 1 + steps.length) % steps.length)}
      />
    </div>
  );
}
