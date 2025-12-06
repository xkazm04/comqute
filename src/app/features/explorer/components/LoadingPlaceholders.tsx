"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ============================================================================
// LOADING PLACEHOLDERS
// ============================================================================

export function GlobeLoadingPlaceholder() {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="body-default text-zinc-400">Loading Network Globe...</span>
      </div>
    </div>
  );
}

export function TopologyLoadingPlaceholder() {
  return (
    <div className="w-full aspect-[16/9] rounded-2xl bg-zinc-950 border border-zinc-800/50 flex items-center justify-center" data-testid="topology-loading-placeholder">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
          <motion.div
            className="absolute inset-0 w-12 h-12 rounded-full border-2 border-purple-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-white">Initializing Network Topology</div>
          <div className="text-xs text-zinc-500 mt-1">Loading 3D visualization...</div>
        </div>
      </div>
    </div>
  );
}
