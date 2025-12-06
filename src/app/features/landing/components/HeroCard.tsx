"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cpu, Network } from "lucide-react";
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
              <div className="text-zinc-500 text-xs mb-1">FINALITY</div>
              <ScrambleText text="2 SEC" delay={1400} />
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

function ActionButtons() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      <Link
        href="/mock/dashboard"
        className="group relative flex flex-col items-center justify-center p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all duration-300"
      >
        <Cpu className="w-8 h-8 mb-2 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-semibold tracking-wider">REQUESTER</span>
        <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover:border-cyan-500/50 transition-colors duration-300" />
      </Link>

      <Link
        href="/mock/worker"
        className="group relative flex flex-col items-center justify-center p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-all duration-300"
      >
        <Network className="w-8 h-8 mb-2 text-fuchsia-400 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-semibold tracking-wider">WORKER</span>
        <div className="absolute inset-0 rounded-xl border border-fuchsia-500/0 group-hover:border-fuchsia-500/50 transition-colors duration-300" />
      </Link>
    </div>
  );
}
