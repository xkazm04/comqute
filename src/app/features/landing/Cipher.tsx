"use client";

import { BinaryWatermark, CircuitPattern, HexGrid, PulseWave } from "../../ui/Backgrounds";
import { HudCorners, GlitchTitle, HeroCard, GlowingTagline, MatrixPhrases } from "./components";

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

      {/* Matrix typewriter phrases scattered around the page */}
      <MatrixPhrases />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Glitch title */}
        <GlitchTitle text="COMQUTE" />

        {/* Holographic card with content */}
        <HeroCard />

        {/* Glowing bottom tagline */}
        <GlowingTagline />
      </div>

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
