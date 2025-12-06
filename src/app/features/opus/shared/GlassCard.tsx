"use client";

import { motion } from "framer-motion";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  "data-testid"?: string;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  padding = true,
  "data-testid": testId,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2 } : undefined}
      data-testid={testId}
      className={`
        relative overflow-hidden rounded-2xl
        bg-zinc-900/60 backdrop-blur-xl
        border border-zinc-800/80
        ${padding ? "p-[var(--space-6)]" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
