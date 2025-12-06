"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ============================================================================
// GLITCH TEXT EFFECT
// ============================================================================

export function GlitchText({ text, className }: { text: string; className?: string }) {
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 200);
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("relative inline-block", className)}>
            {/* Glitch layers */}
            <AnimatePresence>
                {glitch && (
                    <>
                        <motion.span
                            className="absolute inset-0 opacity-50 text-cyan-500"
                            initial={{ x: 0 }}
                            animate={{ x: [-2, 2, -1, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ clipPath: "inset(10% 0 60% 0)" }}
                        >
                            {text}
                        </motion.span>
                        <motion.span
                            className="absolute inset-0 opacity-50 text-rose-500"
                            initial={{ x: 0 }}
                            animate={{ x: [2, -2, 1, -1, 0] }}
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
            <motion.span
                className="block"
                animate={glitch ? {
                    x: [0, -1, 1, -1, 1, 0],
                    skewX: [0, -2, 2, 0],
                } : {}}
                transition={{ duration: 0.2 }}
            >
                {text}
            </motion.span>
        </div>
    );
}

// ============================================================================
// TEXT SCRAMBLE EFFECT
// ============================================================================

export function ScrambleText({
    text,
    delay = 0,
    className,
    scrambleSpeed = 30
}: {
    text: string;
    delay?: number;
    className?: string;
    scrambleSpeed?: number;
}) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF";

    useEffect(() => {
        const timeout = setTimeout(() => {
            let iteration = 0;
            const maxIterations = text.length * 3;

            const interval = setInterval(() => {
                setDisplayText(
                    text
                        .split("")
                        .map((char, i) => {
                            if (char === " ") return " ";
                            if (i < Math.floor(iteration / 3)) return text[i];
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("")
                );

                iteration++;

                if (iteration >= maxIterations) {
                    clearInterval(interval);
                    setDisplayText(text);
                    setIsComplete(true);
                }
            }, scrambleSpeed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, delay, scrambleSpeed]);

    return (
        <span className={cn("font-mono transition-colors duration-300", isComplete ? "text-inherit" : "text-cyan-400", className)}>
            {displayText || text.replace(/./g, "_")}
        </span>
    );
}
