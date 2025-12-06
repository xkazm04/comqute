"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ============================================================================
// HOLOGRAPHIC CARD
// ============================================================================

export function HoloCard({
    children,
    className,
    noHover = false
}: {
    children: React.ReactNode;
    className?: string;
    noHover?: boolean;
}) {
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || noHover) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        });
    };

    return (
        <motion.div
            ref={cardRef}
            className={cn("relative p-6 rounded-2xl overflow-hidden cursor-default group bg-zinc-900/40 backdrop-blur-sm", className)}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                background: !noHover ? `
          linear-gradient(
            ${mousePos.x * 360}deg,
            rgba(34, 211, 238, 0.05) 0%,
            rgba(99, 102, 241, 0.02) 50%,
            rgba(168, 85, 247, 0.05) 100%
          )
        ` : undefined,
            }}
        >
            {/* Border glow */}
            <div className={cn(
                "absolute inset-0 rounded-2xl border transition-colors duration-500",
                noHover ? "border-zinc-800" : "border-cyan-500/20 group-hover:border-cyan-500/40"
            )} />

            {/* Animated border trace */}
            {!noHover && (
                <svg className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none">
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="none"
                        stroke="url(#borderGradient)"
                        strokeWidth="2"
                        rx="16"
                        strokeDasharray="400 1200"
                        className="animate-[dash_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <defs>
                        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                            <stop offset="50%" stopColor="rgba(34, 211, 238, 1)" />
                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            {/* Scan line */}
            {!noHover && (
                <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

export type StatusType = "watching" | "executed" | "pending" | "expired" | "cancelled";

const statusStyles: Record<StatusType, string> = {
    watching: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    executed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    expired: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ status, children }: { status: StatusType; children?: React.ReactNode }) {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            statusStyles[status]
        )}>
            <span className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                status === "watching" && "bg-cyan-400",
                status === "executed" && "bg-emerald-400",
                status === "pending" && "bg-yellow-400",
                status === "expired" && "bg-zinc-400",
                status === "cancelled" && "bg-red-400",
            )} />
            {children || status.toUpperCase()}
        </span>
    );
}
