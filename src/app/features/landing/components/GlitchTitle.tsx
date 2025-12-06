"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlitchTitleProps {
  text: string;
}

export function GlitchTitle({ text }: GlitchTitleProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glitch layers */}
      <AnimatePresence>
        {glitch && (
          <>
            <motion.span
              className="absolute inset-0 text-6xl md:text-9xl font-bold text-cyan-500"
              initial={{ x: 0, opacity: 0 }}
              animate={{
                x: [-5, 5, -3, 3, 0],
                opacity: [0, 0.8, 0.8, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ clipPath: "inset(10% 0 60% 0)" }}
            >
              {text}
            </motion.span>
            <motion.span
              className="absolute inset-0 text-6xl md:text-9xl font-bold text-rose-500"
              initial={{ x: 0, opacity: 0 }}
              animate={{
                x: [5, -5, 3, -3, 0],
                opacity: [0, 0.8, 0.8, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ clipPath: "inset(50% 0 20% 0)" }}
            >
              {text}
            </motion.span>
          </>
        )}
      </AnimatePresence>

      {/* Main text */}
      <motion.h1
        className="text-6xl md:text-9xl font-bold tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent"
        animate={glitch ? {
          x: [0, -2, 2, -1, 1, 0],
          skewX: [0, -1, 1, 0],
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.h1>
    </div>
  );
}
