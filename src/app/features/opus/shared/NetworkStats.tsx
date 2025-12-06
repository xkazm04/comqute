"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Zap, Clock } from "lucide-react";

interface NetworkStatsProps {
  variant?: "minimal" | "detailed" | "compact";
  className?: string;
}

const stats = [
  { label: "WORKERS", value: "12", icon: Cpu, color: "cyan" },
  { label: "JOBS/MIN", value: "847", icon: Activity, color: "emerald" },
  { label: "AVG LATENCY", value: "2.3s", icon: Clock, color: "amber" },
  { label: "TPS", value: "15.2M", icon: Zap, color: "fuchsia" },
];

export function NetworkStats({ variant = "detailed", className = "" }: NetworkStatsProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-4 font-mono text-xs ${className}`}>
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span className="text-zinc-500">{stat.label}</span>
            <span className={`text-${stat.color}-400`}>{stat.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`grid grid-cols-4 gap-2 ${className}`}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-3 rounded-lg bg-white/5 backdrop-blur-sm"
          >
            <div className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</div>
            <div className="text-[10px] text-zinc-500 tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-${stat.color}-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`relative p-4 rounded-xl border border-${stat.color}-500/20 bg-zinc-900/50 backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <div className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
