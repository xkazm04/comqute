"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ============================================================================
// HEXAGONAL GRID
// ============================================================================

export function HexGrid() {
    const hexagons = useMemo(() => {
        const items = [];
        const size = 60;
        const rows = 15;
        const cols = 20;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * size * 1.5;
                const y = row * size * Math.sqrt(3) + (col % 2 ? size * Math.sqrt(3) / 2 : 0);
                items.push({ x, y, delay: (row + col) * 0.02 });
            }
        }
        return items;
    }, []);

    return (
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <defs>
                <pattern id="hexPattern" width="90" height="104" patternUnits="userSpaceOnUse">
                    <path
                        d="M45 0 L90 26 L90 78 L45 104 L0 78 L0 26 Z"
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.3)"
                        strokeWidth="0.5"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
    );
}

// ============================================================================
// PULSE WAVE
// ============================================================================

export function PulseWave() {
    const prefersReducedMotion = useReducedMotion();

    // For reduced motion, show a static subtle ring instead of animated pulses
    if (prefersReducedMotion) {
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute rounded-full border border-cyan-500/10 w-[400px] h-[400px]" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-cyan-500/20"
                    initial={{ width: 100, height: 100, opacity: 0.5 }}
                    animate={{
                        width: [100, 800],
                        height: [100, 800],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}

// ============================================================================
// BINARY WATERMARK
// ============================================================================

// Seeded random number generator for consistent SSR/client rendering
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Pre-generated binary string to avoid hydration mismatch
const BINARY_PATTERN = (() => {
    let str = "";
    for (let i = 0; i < 500; i++) {
        str += seededRandom(i * 12345) > 0.5 ? "1 " : "0 ";
    }
    return str;
})();

export function BinaryWatermark() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02] font-mono text-xs leading-relaxed whitespace-pre-wrap break-all p-8">
            {BINARY_PATTERN}
        </div>
    );
}

// ============================================================================
// CIRCUIT PATTERN
// ============================================================================

export function CircuitPattern() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
            <defs>
                <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path
                        d="M 0 50 L 30 50 L 35 45 L 65 45 L 70 50 L 100 50"
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.5)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M 50 0 L 50 30 L 45 35 L 45 65 L 50 70 L 50 100"
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.5)"
                        strokeWidth="0.5"
                    />
                    <circle cx="50" cy="50" r="3" fill="rgba(34, 211, 238, 0.3)" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
    );
}
