"use client";

import { motion } from "framer-motion";
import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import {
  Code,
  Server,
  Cpu,
  Wallet,
  ArrowRightLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
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

export interface FlowDiagramConfig {
  title: string;
  nodes: FlowNode[];
  zones: FlowZone[];
  connections: FlowConnection[];
  steps: FlowStep[];
}

interface FlowDiagramProps {
  config: FlowDiagramConfig;
  height?: number;
  autoPlayInterval?: number;
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

// Breakpoint for mobile detection
const MOBILE_BREAKPOINT = 768;
// Minimum width for diagram content (enables horizontal scroll on very small screens)
const MIN_DIAGRAM_WIDTH = 920;

// Hook to detect container width and mobile state
function useResponsiveLayout(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [containerWidth, setContainerWidth] = useState(MIN_DIAGRAM_WIDTH);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setIsMobile(width < MOBILE_BREAKPOINT);
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return { containerWidth, isMobile };
}

// Calculate responsive positions based on container width
function getResponsivePosition(
  originalX: number,
  originalY: number,
  containerWidth: number,
  isMobile: boolean,
  nodeIndex: number,
  totalNodes: number
): { x: number; y: number } {
  // Original design width for reference
  const DESIGN_WIDTH = 920;

  if (isMobile) {
    // On mobile, stack nodes vertically with centered X
    const mobileNodeSpacing = 140;
    const startY = 100;
    return {
      x: containerWidth / 2,
      y: startY + nodeIndex * mobileNodeSpacing
    };
  }

  // For wider screens, use percentage-based scaling
  const scale = Math.max(containerWidth / DESIGN_WIDTH, 0.6);
  return {
    x: (originalX / DESIGN_WIDTH) * containerWidth,
    y: originalY * scale
  };
}

// Calculate responsive zone dimensions
function getResponsiveZone(
  zone: FlowZone,
  containerWidth: number,
  isMobile: boolean,
  zoneIndex: number,
  totalZones: number
): { x: number; y: number; width: number; height: number } {
  const DESIGN_WIDTH = 920;

  if (isMobile) {
    // On mobile, zones stack vertically
    const zoneHeight = 200;
    const padding = 10;
    return {
      x: padding,
      y: 40 + zoneIndex * (zoneHeight + 20),
      width: containerWidth - padding * 2,
      height: zoneHeight
    };
  }

  // Percentage-based scaling for wider screens
  const scale = Math.max(containerWidth / DESIGN_WIDTH, 0.6);
  return {
    x: (zone.area.x / DESIGN_WIDTH) * containerWidth,
    y: zone.area.y,
    width: (zone.area.width / DESIGN_WIDTH) * containerWidth,
    height: zone.area.height * scale
  };
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
            className={`micro font-bold tracking-wider uppercase transition-colors duration-500 ${active ? "fill-cyan-400" : "fill-zinc-600"}`}
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

interface ResponsiveZoneRectProps {
  zone: FlowZone;
  responsiveArea: { x: number; y: number; width: number; height: number };
}

function ZoneRect({ zone, responsiveArea }: ResponsiveZoneRectProps) {
  const colors = {
    slate: "border-slate-800 bg-slate-900/20 text-slate-500",
    blue: "border-blue-900/50 bg-blue-900/10 text-blue-500",
    indigo: "border-indigo-900/50 bg-indigo-900/10 text-indigo-500",
  };

  return (
    <div
      className={`absolute border-2 border-dashed rounded-xl transition-all duration-300 ${colors[zone.color]}`}
      style={{
        left: responsiveArea.x,
        top: responsiveArea.y,
        width: responsiveArea.width,
        height: responsiveArea.height
      }}
      data-testid={`flow-zone-${zone.id}`}
    >
      <span className="absolute -top-3 left-6 px-2 bg-zinc-950 micro font-bold uppercase tracking-widest">
        {zone.label}
      </span>
    </div>
  );
}

interface ResponsiveArchNodeProps {
  node: FlowNode;
  isActive: boolean;
  responsivePosition: { x: number; y: number };
  isMobile: boolean;
}

function ArchNode({ node, isActive, responsivePosition, isMobile }: ResponsiveArchNodeProps) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: isActive ? 1 : 0.6
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 md:gap-3 group cursor-pointer transition-all duration-300"
      style={{ left: responsivePosition.x, top: responsivePosition.y }}
      data-testid={`flow-node-${node.id}`}
    >
      <div className={`
              relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl
              flex items-center justify-center
              bg-zinc-900 border-2 transition-all duration-500
              shadow-xl
              ${isActive ? "border-cyan-500 shadow-cyan-500/20" : "border-zinc-700"}
              z-10
          `}>
        <div className={`transition-colors duration-500 ${isActive ? "text-cyan-400" : "text-zinc-500"} ${isMobile ? "[&>svg]:w-6 [&>svg]:h-6" : ""}`}>
          {node.icon}
        </div>
      </div>

      <div className="text-center z-20">
        <div className={`micro md:caption font-bold uppercase tracking-wide transition-colors duration-500 ${isActive ? "text-white" : "text-zinc-500"}`}>
          {node.label}
        </div>
        {node.sublabel && (
          <div className="micro text-zinc-600 font-medium">
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
  onPrevStep,
  onNextStep,
}: {
  step: FlowStep,
  stepIndex: number,
  totalSteps: number,
  isPlaying: boolean,
  onTogglePlay: () => void,
  onPrevStep: () => void,
  onNextStep: () => void,
}) {
  return (
    <div className="min-h-[80px] md:h-24 bg-zinc-900/80 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 py-3 md:py-0 gap-3 md:gap-6 backdrop-blur-md">
      {/* Controls - Mobile: show navigation arrows */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        {/* Previous Step - Mobile only */}
        <button
          onClick={onPrevStep}
          className="md:hidden w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition-colors"
          data-testid="flow-stepper-prev-btn"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors shrink-0"
          data-testid="flow-stepper-toggle-btn"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current pl-0.5" />}
        </button>

        {/* Next Step - Mobile only */}
        <button
          onClick={onNextStep}
          className="md:hidden w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition-colors"
          data-testid="flow-stepper-next-btn"
          aria-label="Next step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Step Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
          <span className="micro font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
            Step {stepIndex + 1}/{totalSteps}
          </span>
          <h4 className="body-medium md:heading-tertiary text-zinc-200 truncate">{step.title}</h4>
        </div>
        <p className="caption md:body-default text-zinc-400 leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-none">
          {step.description}
        </p>
      </div>

      {/* Progress Bar - Hidden on very small mobile, visible on larger */}
      <div className="hidden sm:flex gap-1 shrink-0">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 md:w-8 rounded-full transition-colors duration-300 ${i === stepIndex ? "bg-cyan-500" : "bg-zinc-800"}`}
            data-testid={`flow-stepper-progress-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BASE FLOW DIAGRAM COMPONENT
// ============================================================================

export function FlowDiagram({ config, height = 400, autoPlayInterval = 4000 }: FlowDiagramProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { title, nodes, zones, connections, steps } = config;
  const { containerWidth, isMobile } = useResponsiveLayout(containerRef);

  // Calculate responsive height based on content
  const responsiveHeight = isMobile ? nodes.length * 140 + 100 : height;

  // Calculate responsive positions for nodes
  const responsiveNodes = nodes.map((node, index) => ({
    ...node,
    responsivePosition: getResponsivePosition(
      node.position.x,
      node.position.y,
      containerWidth,
      isMobile,
      index,
      nodes.length
    )
  }));

  // Calculate responsive zones
  const responsiveZones = zones.map((zone, index) => ({
    ...zone,
    responsiveArea: getResponsiveZone(zone, containerWidth, isMobile, index, zones.length)
  }));

  // Create node map with responsive positions
  const nodeMap = new Map(responsiveNodes.map((n) => [n.id, n]));

  // Step navigation handlers
  const handlePrevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
    setIsPlaying(false);
  }, [steps.length]);

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setIsPlaying(false);
  }, [steps.length]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length, autoPlayInterval]);

  const activeStep = steps[currentStep];

  const currentConnections = connections.map((conn, index) => ({
    ...conn,
    active: activeStep.activeConnections.includes(index)
  }));

  // Determine if horizontal scroll fallback is needed
  const needsHorizontalScroll = containerWidth < MIN_DIAGRAM_WIDTH && !isMobile;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono shadow-2xl"
      data-testid="flow-diagram-container"
    >
      {/* Header */}
      <div className="flex border-b border-zinc-800">
        <div className="px-3 md:px-4 py-2 md:py-3 bg-zinc-900/50 border-r border-zinc-800">
          <div className="micro md:caption font-bold text-zinc-400 uppercase tracking-widest">SYS.ARCH</div>
        </div>
        <div className="px-3 md:px-5 py-2 md:py-3 flex-1 bg-zinc-900/30 flex justify-between items-center">
          <div>
            <h3 className="caption md:body-medium font-bold text-zinc-200 uppercase tracking-wide">{title}</h3>
          </div>
          <div className="micro text-zinc-600 font-bold bg-zinc-900 px-2 py-0.5 rounded">LIVE</div>
        </div>
      </div>

      {/* Diagram Area - with horizontal scroll fallback for tablet/medium screens */}
      <div
        ref={scrollContainerRef}
        className={`relative ${needsHorizontalScroll ? 'overflow-x-auto snap-x snap-mandatory scroll-smooth' : 'overflow-hidden'}`}
        style={{
          minHeight: isMobile ? responsiveHeight : height,
          WebkitOverflowScrolling: 'touch' // iOS momentum scrolling
        }}
        data-testid="flow-diagram-scroll-container"
      >
        <div
          className="relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] transition-all duration-300"
          style={{
            height: isMobile ? responsiveHeight : height,
            minWidth: needsHorizontalScroll ? MIN_DIAGRAM_WIDTH : '100%',
            width: needsHorizontalScroll ? MIN_DIAGRAM_WIDTH : '100%'
          }}
        >
          {/* Scroll snap targets for complex diagrams */}
          {needsHorizontalScroll && (
            <>
              <div className="absolute left-0 top-0 w-1 h-full snap-start" />
              <div className="absolute left-1/3 top-0 w-1 h-full snap-center" />
              <div className="absolute left-2/3 top-0 w-1 h-full snap-center" />
              <div className="absolute right-0 top-0 w-1 h-full snap-end" />
            </>
          )}

          <svg
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              width: needsHorizontalScroll ? MIN_DIAGRAM_WIDTH : '100%',
              height: isMobile ? responsiveHeight : height
            }}
          >
            {currentConnections.map((conn, i) => {
              const fromNode = nodeMap.get(conn.from);
              const toNode = nodeMap.get(conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <ArchConnection
                  key={`${conn.from}-${conn.to}-${i}`}
                  x1={fromNode.responsivePosition.x}
                  y1={fromNode.responsivePosition.y}
                  x2={toNode.responsivePosition.x}
                  y2={toNode.responsivePosition.y}
                  label={conn.label}
                  bidirectional={conn.bidirectional}
                  type={conn.type}
                  active={conn.active}
                />
              );
            })}
          </svg>

          {/* Hide zones on mobile for cleaner vertical layout */}
          {!isMobile && responsiveZones.map(zone => (
            <ZoneRect
              key={zone.id}
              zone={zone}
              responsiveArea={zone.responsiveArea}
            />
          ))}

          {responsiveNodes.map((node) => (
            <ArchNode
              key={node.id}
              node={node}
              isActive={activeStep.activeNodes.includes(node.id)}
              responsivePosition={node.responsivePosition}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      {needsHorizontalScroll && (
        <div className="flex justify-center py-2 bg-zinc-900/50 border-t border-zinc-800" data-testid="flow-scroll-indicator">
          <div className="flex items-center gap-2 micro text-zinc-500">
            <ChevronLeft className="w-3 h-3" />
            <span>Scroll to explore</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Stepper Panel */}
      <FlowStepper
        step={activeStep}
        stepIndex={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
      />
    </div>
  );
}

// ============================================================================
// WORKER FLOW DIAGRAM CONFIG
// ============================================================================

const workerFlowConfig: FlowDiagramConfig = {
  title: "Worker Flow Architecture",
  zones: [
    { id: "compute", label: "Compute Layer", color: "blue", area: { x: 20, y: 40, width: 280, height: 320 } },
    { id: "protocol", label: "Protocol Layer", color: "indigo", area: { x: 320, y: 40, width: 280, height: 320 } },
    { id: "client", label: "Client Layer", color: "slate", area: { x: 620, y: 40, width: 280, height: 320 } },
  ],
  nodes: [
    { id: "llm", label: "LLM Engine", sublabel: "Ollama / Exo", icon: <Cpu className="w-8 h-8" />, zone: "compute", position: { x: 160, y: 120 } },
    { id: "worker", label: "Orchestrator", sublabel: "Your Node", icon: <Server className="w-8 h-8" />, zone: "compute", position: { x: 160, y: 260 } },
    { id: "dispatcher", label: "Dispatcher", sublabel: "Job Queue", icon: <ArrowRightLeft className="w-8 h-8" />, zone: "protocol", position: { x: 460, y: 190 } },
    { id: "app", label: "Requester", sublabel: "Job Origin", icon: <Code className="w-8 h-8" />, zone: "client", position: { x: 760, y: 120 } },
    { id: "wallet", label: "Payment", sublabel: "QUBIC Reward", icon: <Wallet className="w-8 h-8" />, zone: "client", position: { x: 760, y: 260 } },
  ],
  connections: [
    { from: "dispatcher", to: "worker", label: "Claim", active: false },
    { from: "worker", to: "llm", label: "Process", type: "dashed", active: false },
    { from: "llm", to: "worker", label: "Response", active: false },
    { from: "worker", to: "dispatcher", label: "Submit", active: false },
    { from: "dispatcher", to: "wallet", label: "Reward", type: "dotted", active: false },
  ],
  steps: [
    {
      id: "listen",
      title: "Listen for Jobs",
      description: "Your worker node monitors the dispatcher for available jobs that match your supported models and hardware capabilities.",
      activeNodes: ["worker", "dispatcher"],
      activeConnections: [0]
    },
    {
      id: "claim",
      title: "Claim Job",
      description: "When a matching job appears, claim it from the queue. The job is locked to your node and the reward is escrowed.",
      activeNodes: ["worker", "dispatcher"],
      activeConnections: [0]
    },
    {
      id: "process",
      title: "Process with Ollama",
      description: "Send the prompt to your local LLM engine (Ollama). The model generates tokens and streams the response back.",
      activeNodes: ["worker", "llm"],
      activeConnections: [1, 2]
    },
    {
      id: "submit",
      title: "Submit & Earn",
      description: "Submit the completed response to the dispatcher. Upon verification, the escrowed QUBIC reward is released to your wallet.",
      activeNodes: ["worker", "dispatcher", "wallet"],
      activeConnections: [3, 4]
    }
  ]
};

// ============================================================================
// REQUESTER FLOW DIAGRAM CONFIG
// ============================================================================

const requesterFlowConfig: FlowDiagramConfig = {
  title: "Requester Flow Architecture",
  zones: [
    { id: "client", label: "Client Layer", color: "slate", area: { x: 20, y: 40, width: 280, height: 320 } },
    { id: "protocol", label: "Protocol Layer", color: "indigo", area: { x: 320, y: 40, width: 280, height: 320 } },
    { id: "compute", label: "Compute Layer", color: "blue", area: { x: 620, y: 40, width: 280, height: 320 } },
  ],
  nodes: [
    { id: "app", label: "Application", sublabel: "Next.js / React", icon: <Code className="w-8 h-8" />, zone: "client", position: { x: 160, y: 120 } },
    { id: "wallet", label: "Wallet", sublabel: "Signature", icon: <Wallet className="w-8 h-8" />, zone: "client", position: { x: 160, y: 260 } },
    { id: "dispatcher", label: "Dispatcher", sublabel: "Job Routing", icon: <ArrowRightLeft className="w-8 h-8" />, zone: "protocol", position: { x: 460, y: 190 } },
    { id: "worker", label: "Orchestrator", sublabel: "Job Claim", icon: <Server className="w-8 h-8" />, zone: "compute", position: { x: 760, y: 120 } },
    { id: "llm", label: "LLM Engine", sublabel: "Ollama / Exo", icon: <Cpu className="w-8 h-8" />, zone: "compute", position: { x: 760, y: 260 } },
  ],
  connections: [
    { from: "app", to: "dispatcher", label: "Request", bidirectional: true, active: false },
    { from: "wallet", to: "dispatcher", label: "Sign", type: "dotted", active: false },
    { from: "dispatcher", to: "worker", label: "Distribute", active: false },
    { from: "worker", to: "llm", label: "Exec", type: "dashed", active: false },
  ],
  steps: [
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
  ]
};

// ============================================================================
// THIN WRAPPERS
// ============================================================================

export function WorkerFlowDiagram() {
  return <FlowDiagram config={workerFlowConfig} data-testid="worker-flow-diagram" />;
}

export function RequesterFlowDiagram() {
  return <FlowDiagram config={requesterFlowConfig} data-testid="requester-flow-diagram" />;
}
