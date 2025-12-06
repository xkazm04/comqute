"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { DollarSign, Shield, Zap } from "lucide-react";

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

function AnimatedCounter({
  value,
  suffix = "",
  duration = 2
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const stepTime = (duration * 1000) / end;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ============================================================================
// PRICING CARD
// ============================================================================

function PricingCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card */}
      <div className="relative h-full p-6 rounded-2xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="priceGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#priceGrid)" />
          </svg>
        </div>

        {/* Floating coins animation */}
        <div className="absolute top-4 right-4 opacity-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-emerald-400"
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
              style={{ left: i * 12, top: i * 8 }}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="relative mb-4">
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30"
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DollarSign className="w-7 h-7 text-emerald-400" />
          </motion.div>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-emerald-400"
            animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          Fair Pricing
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          Revolutionary cost model built for accessibility
        </p>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">$</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Pay Only What You Use</div>
              <div className="text-zinc-500 text-xs">Per-token billing, no minimums</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 text-lg font-bold">0</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Zero Platform Fees</div>
              <div className="text-zinc-500 text-xs">100% goes to compute</div>
            </div>
          </div>
        </div>

        {/* Bottom stat */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs font-mono">AVG SAVINGS</span>
            <span className="text-emerald-400 font-bold text-lg">
              <AnimatedCounter value={73} suffix="%" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PRIVACY CARD
// ============================================================================

function PrivacyCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card */}
      <div className="relative h-full p-6 rounded-2xl border border-violet-500/20 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
        {/* Encrypted data stream background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <motion.div
            className="font-mono text-[8px] text-violet-400 whitespace-pre leading-tight"
            animate={{ y: [0, -100] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {Array(20).fill("█▓▒░ ENCRYPTED ░▒▓█ ").join("\n")}
          </motion.div>
        </div>

        {/* Shield animation */}
        <div className="absolute top-4 right-4">
          <motion.div
            className="w-16 h-16 opacity-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </motion.div>
        </div>

        {/* Icon */}
        <div className="relative mb-4">
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="w-7 h-7 text-violet-400" />

            {/* Lock indicator */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
              animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          Privacy First
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          Your data remains yours, always
        </p>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium text-sm">No Data Spying</div>
              <div className="text-zinc-500 text-xs">End-to-end encryption</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-fuchsia-500/5 border border-fuchsia-500/10">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium text-sm">No Model Training</div>
              <div className="text-zinc-500 text-xs">Your prompts stay private</div>
            </div>
          </div>
        </div>

        {/* Bottom stat */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs font-mono">DATA RETENTION</span>
            <span className="text-violet-400 font-bold text-lg">0 days</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SPEED CARD
// ============================================================================

function SpeedCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [latency, setLatency] = useState(2.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(2 + Math.random() * 0.8);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card */}
      <div className="relative h-full p-6 rounded-2xl border border-amber-500/20 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
        {/* Speed lines background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
              style={{ top: `${20 + i * 15}%`, width: "100%" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="relative mb-4">
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30"
            animate={isHovered ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Zap className="w-7 h-7 text-amber-400" />
          </motion.div>

          {/* Energy pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          Blazing Speed
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          Powered by Qubic&apos;s high-performance backbone
        </p>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">&lt;3s</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Prompt to Response</div>
              <div className="text-zinc-500 text-xs">Sub-3 second inference</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Qubic Backbone</div>
              <div className="text-zinc-500 text-xs">15M+ TPS infrastructure</div>
            </div>
          </div>
        </div>

        {/* Live latency indicator */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE LATENCY
            </span>
            <motion.span
              className="text-amber-400 font-bold text-lg font-mono"
              key={latency}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {latency.toFixed(1)}s
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FEATURE CARDS CONTAINER
// ============================================================================

export function FeatureCards() {
  return (
    <motion.section
      className="w-full max-w-5xl mx-auto px-4 py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-400 tracking-wider">WHY COMQUTE</span>
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Built Different
        </motion.h2>

        <motion.p
          className="text-zinc-400 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          The infrastructure AI deserves — fair, private, and fast
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingCard />
        <PrivacyCard />
        <SpeedCard />
      </div>
    </motion.section>
  );
}
