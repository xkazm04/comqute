"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "BLOCK", value: "1,847,293" },
  { label: "TPS", value: "15.2M" },
  { label: "INTENTS", value: "2,451" },
  { label: "LATENCY", value: "2.0s" },
];

export function HudCorners() {
  return (
    <div className="pointer-events-none">
      {/* Top left */}
      <div className="absolute top-20 left-8 font-mono text-[10px]">
        <motion.div
          className="flex flex-col gap-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          {stats.slice(0, 2).map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-zinc-600">{stat.label}</span>
              <span className="text-cyan-400">{stat.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Top right */}
      <div className="absolute top-20 right-8 font-mono text-[10px] text-right">
        <motion.div
          className="flex flex-col gap-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          {stats.slice(2).map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 justify-end">
              <span className="text-zinc-600">{stat.label}</span>
              <span className="text-cyan-400">{stat.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom decorative brackets */}
      <motion.div
        className="absolute bottom-8 left-8 w-24 h-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <svg viewBox="0 0 96 48" className="w-full h-full">
          <path
            d="M 0 48 L 0 0 L 48 0"
            fill="none"
            stroke="rgba(34, 211, 238, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-8 right-8 w-24 h-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <svg viewBox="0 0 96 48" className="w-full h-full">
          <path
            d="M 96 48 L 96 0 L 48 0"
            fill="none"
            stroke="rgba(34, 211, 238, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </div>
  );
}
