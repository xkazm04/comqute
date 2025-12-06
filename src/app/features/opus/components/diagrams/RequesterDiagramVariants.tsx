"use client";

import { Code, FileText, Globe, Zap, Server, Cpu, Wallet, Layers, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { FlowDiagramExpanded, FlowNodeExpanded } from "./FlowDiagramExpanded";
import { FlowDiagramArchitectural, FlowNodeArchitectural, FlowZone, FlowConnectionArch } from "./FlowDiagramArchitectural";

// ============================================================================
// EXPANDED VARIANT DATA
// ============================================================================

export function RequesterExpandedVariant() {
    const nodes: FlowNodeExpanded[] = [
        {
            id: "sdk",
            label: "Client SDK",
            icon: <Code className="w-6 h-6" />,
            description: "Integration Point",
            features: ["Typescript Support", "Auto-retry logic", "State management"],
            color: "cyan",
            position: { x: 120, y: 180 },
        },
        {
            id: "manager",
            label: "State Manager",
            icon: <Layers className="w-6 h-6" />,
            description: "Request Handling",
            features: ["Queueing", "Deduplication", "Optimistic updates"],
            color: "amber",
            position: { x: 380, y: 180 },
        },
        {
            id: "network",
            label: "Qubuc Network",
            icon: <Globe className="w-6 h-6" />,
            description: "Decentralized Grid",
            features: ["Global routing", "Worker discovery", "Consensus"],
            color: "purple",
            position: { x: 640, y: 180 },
        },
        {
            id: "result",
            label: "Inference",
            icon: <Zap className="w-6 h-6" />,
            description: "LLM Execution",
            features: ["Streaming tokens", "Verification", "Final Answer"],
            color: "emerald",
            position: { x: 900, y: 180 },
        },
    ];

    const connections = [
        { from: "sdk", to: "manager", label: "Submit Request" },
        { from: "manager", to: "network", label: "Broadcast Job" },
        { from: "network", to: "result", label: "Process & Return" },
    ];

    return (
        <FlowDiagramExpanded
            title="Requester Flow (Expanded View)"
            description="Detailed view of the client-side integration and request lifecycle."
            nodes={nodes}
            connections={connections}
        />
    );
}

// ============================================================================
// ARCHITECTURAL VARIANT DATA
// ============================================================================

export function RequesterArchitecturalVariant() {
    const zones: FlowZone[] = [
        { id: "client", label: "Client Layer", color: "slate", area: { x: 20, y: 40, width: 280, height: 320 } },
        { id: "protocol", label: "Protocol Layer", color: "indigo", area: { x: 320, y: 40, width: 280, height: 320 } },
        { id: "compute", label: "Compute Layer", color: "blue", area: { x: 620, y: 40, width: 280, height: 320 } },
    ];

    const nodes: FlowNodeArchitectural[] = [
        // Client Zone
        {
            id: "app",
            label: "Application",
            sublabel: "Next.js / React",
            icon: <Code className="w-5 h-5" />,
            zone: "client",
            status: "active",
            position: { x: 160, y: 120 },
        },
        {
            id: "wallet",
            label: "Wallet",
            sublabel: "Signature",
            icon: <Wallet className="w-5 h-5" />,
            zone: "client",
            status: "active",
            position: { x: 160, y: 260 },
        },
        // Protocol Zone
        {
            id: "dispatcher",
            label: "Dispatcher",
            sublabel: "Job Routing",
            icon: <ArrowRightLeft className="w-5 h-5" />,
            zone: "protocol",
            status: "active",
            position: { x: 460, y: 190 },
        },
        // Compute Zone
        {
            id: "worker",
            label: "Orchestrator",
            sublabel: "Job Claim",
            icon: <Server className="w-5 h-5" />,
            zone: "compute",
            status: "active",
            position: { x: 760, y: 120 },
        },
        {
            id: "llm",
            label: "LLM Engine",
            sublabel: "Ollama / Exo",
            icon: <Cpu className="w-5 h-5" />,
            zone: "compute",
            status: "active",
            position: { x: 760, y: 260 },
        },
    ];

    const connections: FlowConnectionArch[] = [
        { from: "app", to: "dispatcher", label: "Request", bidirectional: true, active: true },
        { from: "wallet", to: "dispatcher", label: "Sign", type: "dotted", active: false },
        { from: "dispatcher", to: "worker", label: "Distribute", active: true },
        { from: "worker", to: "llm", label: "Exec", type: "dashed", active: true },
    ];

    return (
        <FlowDiagramArchitectural
            title="System Architecture"
            subtitle="Req/Res Flow v2"
            nodes={nodes}
            zones={zones}
            connections={connections}
        />
    );
}
