"use client";

import { Map, List, Box } from "lucide-react";

// ============================================================================
// VIEW TOGGLE
// ============================================================================

export type ViewMode = "topology" | "globe" | "list";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700" data-testid="network-view-toggle">
      <button
        onClick={() => onViewChange("topology")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md caption transition-colors ${
          view === "topology"
            ? "bg-purple-500/20 text-purple-400"
            : "text-zinc-400 hover:text-zinc-300"
        }`}
        data-testid="network-view-topology-btn"
      >
        <Box className="w-3.5 h-3.5" />
        Topology
      </button>
      <button
        onClick={() => onViewChange("globe")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md caption transition-colors ${
          view === "globe"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-zinc-400 hover:text-zinc-300"
        }`}
        data-testid="network-view-globe-btn"
      >
        <Map className="w-3.5 h-3.5" />
        Globe
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md caption transition-colors ${
          view === "list"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-zinc-400 hover:text-zinc-300"
        }`}
        data-testid="network-view-list-btn"
      >
        <List className="w-3.5 h-3.5" />
        List
      </button>
    </div>
  );
}
