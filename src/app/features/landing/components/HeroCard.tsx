"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ScrambleText } from "../../../ui/Typography";
import { HoloCard } from "../../../ui/Card";

export function HeroCard() {
  return (
    <div className="mt-12 max-w-lg w-full">
      <HoloCard>
        <div className="space-y-6">
          {/* Scramble text lines */}
          <div className="text-xl md:text-2xl text-center">
            <ScrambleText text="Decentralized AI Inference" delay={800} />
          </div>

          {/* Divider */}
          <motion.div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />

          {/* Stats row */}
          <div className="flex justify-between text-sm font-mono">
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-xs mb-1">FEES</div>
              <ScrambleText text="ZERO" delay={1200} />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-xs mb-1">SECURITY</div>
              <ScrambleText text="PRIVATE" delay={1400} />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-xs mb-1">THROUGHPUT</div>
              <ScrambleText text="UNLIMITED" delay={1600} />
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButtons />
        </div>
      </HoloCard>
    </div>
  );
}

// ============================================================================
// DEVELOPER DECORATION - Code/API themed SVG
// ============================================================================

function DeveloperDecoration() {
  return (
    <div className="relative w-16 h-16 mb-3">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(34, 211, 238, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        </svg>
      </motion.div>

      {/* Inner pulsing glow */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Code brackets icon */}
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full">
        {/* Left bracket < */}
        <motion.path
          d="M24 20 L14 32 L24 44"
          fill="none"
          stroke="rgba(34, 211, 238, 0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        {/* Right bracket > */}
        <motion.path
          d="M40 20 L50 32 L40 44"
          fill="none"
          stroke="rgba(34, 211, 238, 0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
        {/* Slash / */}
        <motion.path
          d="M36 18 L28 46"
          fill="none"
          stroke="rgba(34, 211, 238, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        />
      </svg>

      {/* Floating data nodes */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
          style={{
            left: `${20 + i * 20}%`,
            top: "10%",
          }}
          animate={{
            y: [0, 40, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// WORKER DECORATION - Network/GPU themed SVG
// ============================================================================

function WorkerDecoration() {
  return (
    <div className="relative w-16 h-16 mb-3">
      {/* Outer rotating ring - opposite direction */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(232, 121, 249, 0.2)"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
        </svg>
      </motion.div>

      {/* Inner pulsing glow */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(232, 121, 249, 0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* GPU/Network grid icon */}
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full">
        {/* Central chip */}
        <motion.rect
          x="22"
          y="22"
          width="20"
          height="20"
          rx="3"
          fill="none"
          stroke="rgba(232, 121, 249, 0.9)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />

        {/* Inner grid lines */}
        <motion.line x1="32" y1="22" x2="32" y2="42" stroke="rgba(232, 121, 249, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.8 }} />
        <motion.line x1="22" y1="32" x2="42" y2="32" stroke="rgba(232, 121, 249, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.9 }} />

        {/* Connection lines - top */}
        <motion.line x1="27" y1="22" x2="27" y2="14" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1 }} />
        <motion.line x1="37" y1="22" x2="37" y2="14" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.1 }} />

        {/* Connection lines - bottom */}
        <motion.line x1="27" y1="42" x2="27" y2="50" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.2 }} />
        <motion.line x1="37" y1="42" x2="37" y2="50" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.3 }} />

        {/* Connection lines - left */}
        <motion.line x1="22" y1="27" x2="14" y2="27" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.4 }} />
        <motion.line x1="22" y1="37" x2="14" y2="37" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.5 }} />

        {/* Connection lines - right */}
        <motion.line x1="42" y1="27" x2="50" y2="27" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.6 }} />
        <motion.line x1="42" y1="37" x2="50" y2="37" stroke="rgba(232, 121, 249, 0.6)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.7 }} />
      </svg>

      {/* Pulsing corner nodes */}
      {[
        { x: 14, y: 14 },
        { x: 50, y: 14 },
        { x: 14, y: 50 },
        { x: 50, y: 50 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-fuchsia-400"
          style={{
            left: `${(pos.x / 64) * 100}%`,
            top: `${(pos.y / 64) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ACTION BUTTONS
// ============================================================================

function ActionButtons() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      <Link
        href="/opus"
        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all duration-300"
      >
        <DeveloperDecoration />
        <span className="text-sm font-semibold tracking-wider text-cyan-100 group-hover:text-white transition-colors">DEVELOPER</span>
        <span className="text-[10px] text-zinc-500 mt-1 font-mono">API &amp; SDK</span>
        <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover:border-cyan-500/50 transition-colors duration-300" />

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)",
          }}
        />
      </Link>

      <Link
        href="/opus"
        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-all duration-300"
      >
        <WorkerDecoration />
        <span className="text-sm font-semibold tracking-wider text-fuchsia-100 group-hover:text-white transition-colors">WORKER</span>
        <span className="text-[10px] text-zinc-500 mt-1 font-mono">Earn Rewards</span>
        <div className="absolute inset-0 rounded-xl border border-fuchsia-500/0 group-hover:border-fuchsia-500/50 transition-colors duration-300" />

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(232, 121, 249, 0.1) 0%, transparent 70%)",
          }}
        />
      </Link>
    </div>
  );
}
