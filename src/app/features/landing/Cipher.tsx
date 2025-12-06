"use client";

import { motion } from "framer-motion";
import { BinaryWatermark, CircuitPattern, HexGrid, PulseWave } from "../../ui/Backgrounds";
import { HudCorners, GlitchTitle, HeroCard, FeatureCards } from "./components";

export default function Cipher() {
  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden text-white font-sans selection:bg-cyan-500/30">
      {/* Background layers */}
      <BinaryWatermark />
      <CircuitPattern />
      <HexGrid />
      <PulseWave />

      {/* HUD elements */}
      <HudCorners />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Glitch title */}
        <GlitchTitle text="COMQUTE" />

        {/* Holographic card with content */}
        <HeroCard />

        {/* Bottom tagline */}
        <motion.p
          className="mt-12 text-zinc-600 font-mono text-xs tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          &lt;/ Intelligence for Everyone /&gt;
        </motion.p>
      </div>

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(9, 9, 11, 0.8) 100%)",
        }}
      />

      {/* Add keyframes for border animation */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1600;
          }
        }
      `}</style>
    </div>
  );
}
