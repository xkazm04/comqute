"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

// ============================================================================
// BREATHING ANIMATION - Subtle opacity-based animation
// ============================================================================

const breathingAnimation = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ============================================================================
// SLEEPING NODE SVG - For offline/empty worker queue
// A cute sleeping server/node with Zzz's
// ============================================================================

function SleepingNodeIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="sleepNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="sleepGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Ambient glow behind the node */}
      <motion.ellipse
        cx="100"
        cy="100"
        rx="60"
        ry="30"
        fill="url(#sleepGlow)"
        {...breathingAnimation}
      />

      {/* Main server/node body */}
      <motion.rect
        x="55"
        y="45"
        width="90"
        height="70"
        rx="12"
        fill="url(#sleepNodeGradient)"
        stroke="#3f3f46"
        strokeWidth="2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Inner panel */}
      <motion.rect
        x="65"
        y="55"
        width="70"
        height="50"
        rx="6"
        fill="#18181b"
        stroke="#27272a"
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Closed eyes (sleeping) - left */}
      <motion.path
        d="M80 72 Q 85 68, 90 72"
        stroke="#52525b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />

      {/* Closed eyes (sleeping) - right */}
      <motion.path
        d="M110 72 Q 115 68, 120 72"
        stroke="#52525b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />

      {/* Sleepy smile */}
      <motion.path
        d="M90 88 Q 100 94, 110 88"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />

      {/* ZZZ floating - animated */}
      <motion.text
        x="145"
        y="45"
        fill="#8b5cf6"
        fontSize="16"
        fontWeight="bold"
        fontFamily="system-ui"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [10, 0, -5, -10]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      >
        Z
      </motion.text>
      <motion.text
        x="155"
        y="35"
        fill="#a78bfa"
        fontSize="12"
        fontWeight="bold"
        fontFamily="system-ui"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [10, 0, -5, -10]
        }}
        transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeOut" }}
      >
        z
      </motion.text>
      <motion.text
        x="162"
        y="28"
        fill="#c4b5fd"
        fontSize="9"
        fontWeight="bold"
        fontFamily="system-ui"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [10, 0, -5, -10]
        }}
        transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
      >
        z
      </motion.text>

      {/* LED indicators (dim/off) */}
      <motion.circle
        cx="70"
        cy="108"
        r="3"
        fill="#27272a"
        stroke="#3f3f46"
        strokeWidth="1"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="82"
        cy="108"
        r="3"
        fill="#27272a"
        stroke="#3f3f46"
        strokeWidth="1"
      />
      <motion.circle
        cx="94"
        cy="108"
        r="3"
        fill="#27272a"
        stroke="#3f3f46"
        strokeWidth="1"
      />

      {/* Moon decoration */}
      <motion.path
        d="M35 50 A 12 12 0 1 1 35 74 A 8 8 0 1 0 35 50"
        fill="#fbbf24"
        fillOpacity="0.2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Small stars */}
      {[
        { x: 45, y: 35, size: 4, delay: 0 },
        { x: 28, y: 65, size: 3, delay: 0.5 },
        { x: 175, y: 55, size: 3, delay: 1 },
      ].map((star, i) => (
        <motion.path
          key={i}
          d={`M${star.x} ${star.y - star.size} L${star.x + star.size * 0.3} ${star.y - star.size * 0.3} L${star.x + star.size} ${star.y} L${star.x + star.size * 0.3} ${star.y + star.size * 0.3} L${star.x} ${star.y + star.size} L${star.x - star.size * 0.3} ${star.y + star.size * 0.3} L${star.x - star.size} ${star.y} L${star.x - star.size * 0.3} ${star.y - star.size * 0.3} Z`}
          fill="#fbbf24"
          fillOpacity="0.3"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, delay: star.delay, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// PULSING RADAR SVG - For waiting-for-jobs state
// Radar sweep with scanning animation
// ============================================================================

function PulsingRadarIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer radar ring with breathing */}
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="none"
        stroke="#27272a"
        strokeWidth="1"
        {...breathingAnimation}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="40"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="1"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="25"
        fill="none"
        stroke="#52525b"
        strokeWidth="1"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Center dot */}
      <motion.circle
        cx="100"
        cy="80"
        r="8"
        fill="url(#radarGradient)"
        stroke="#06b6d4"
        strokeWidth="2"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="3"
        fill="#06b6d4"
      />

      {/* Radar sweep line - rotating */}
      <motion.line
        x1="100"
        y1="80"
        x2="100"
        y2="25"
        stroke="url(#sweepGradient)"
        strokeWidth="30"
        strokeLinecap="round"
        style={{ transformOrigin: "100px 80px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Radar sweep main line */}
      <motion.line
        x1="100"
        y1="80"
        x2="100"
        y2="28"
        stroke="#06b6d4"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transformOrigin: "100px 80px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing rings emanating outward */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="100"
          cy="80"
          r="15"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          initial={{ r: 15, opacity: 0.6 }}
          animate={{ r: 55, opacity: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.7,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Blinking dots (potential signals) */}
      {[
        { cx: 75, cy: 55, delay: 0 },
        { cx: 130, cy: 70, delay: 0.5 },
        { cx: 85, cy: 105, delay: 1 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r="3"
          fill="#10b981"
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            delay: dot.delay,
            repeat: Infinity,
          }}
        />
      ))}

      {/* "Searching..." text hint */}
      <motion.text
        x="100"
        y="150"
        textAnchor="middle"
        fill="#52525b"
        fontSize="11"
        fontFamily="system-ui"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Scanning for jobs...
      </motion.text>

      {/* Signal wave indicators */}
      <motion.path
        d="M155 80 Q 165 75, 175 80 Q 165 85, 155 80"
        stroke="#3f3f46"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: [0.3, 0.6, 0.3], x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.path
        d="M25 80 Q 35 75, 45 80 Q 35 85, 25 80"
        stroke="#3f3f46"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: [0.3, 0.6, 0.3], x: [0, -5, 0] }}
        transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
      />
    </svg>
  );
}

// ============================================================================
// CHECKMARK CONSTELLATION SVG - For all-caught-up/completed state
// Stars forming a checkmark pattern with twinkling effect
// ============================================================================

function CheckmarkConstellationIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
        </linearGradient>
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background nebula effect */}
      <motion.ellipse
        cx="100"
        cy="80"
        rx="70"
        ry="50"
        fill="url(#checkGradient)"
        {...breathingAnimation}
      />

      {/* Constellation lines connecting stars */}
      <motion.path
        d="M55 80 L80 105 L145 45"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      {/* Main checkmark stars */}
      {[
        { cx: 55, cy: 80, size: 6, delay: 0 },
        { cx: 80, cy: 105, size: 8, delay: 0.3 },
        { cx: 145, cy: 45, size: 7, delay: 0.6 },
      ].map((star, i) => (
        <motion.g key={i} filter="url(#starGlow)">
          {/* Star shape */}
          <motion.path
            d={`M${star.cx} ${star.cy - star.size}
               L${star.cx + star.size * 0.4} ${star.cy - star.size * 0.4}
               L${star.cx + star.size} ${star.cy}
               L${star.cx + star.size * 0.4} ${star.cy + star.size * 0.4}
               L${star.cx} ${star.cy + star.size}
               L${star.cx - star.size * 0.4} ${star.cy + star.size * 0.4}
               L${star.cx - star.size} ${star.cy}
               L${star.cx - star.size * 0.4} ${star.cy - star.size * 0.4} Z`}
            fill="#10b981"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              delay: star.delay,
              repeat: Infinity
            }}
          />
          {/* Center glow */}
          <motion.circle
            cx={star.cx}
            cy={star.cy}
            r={star.size * 0.3}
            fill="#34d399"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, delay: star.delay, repeat: Infinity }}
          />
        </motion.g>
      ))}

      {/* Additional twinkling stars in background */}
      {[
        { cx: 35, cy: 50, size: 3, delay: 0.2 },
        { cx: 165, cy: 70, size: 4, delay: 0.7 },
        { cx: 120, cy: 120, size: 3, delay: 0.4 },
        { cx: 60, cy: 130, size: 2, delay: 0.9 },
        { cx: 155, cy: 110, size: 3, delay: 0.1 },
        { cx: 40, cy: 100, size: 2, delay: 0.6 },
        { cx: 170, cy: 35, size: 3, delay: 0.8 },
        { cx: 95, cy: 35, size: 2, delay: 0.3 },
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.cx}
          cy={star.cy}
          r={star.size}
          fill="#06b6d4"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.7, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: star.delay,
            repeat: Infinity
          }}
        />
      ))}

      {/* Sparkle effects */}
      <motion.path
        d="M100 25 L102 30 L107 30 L103 33 L105 38 L100 35 L95 38 L97 33 L93 30 L98 30 Z"
        fill="#fbbf24"
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
          rotate: [0, 15, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Success glow ring */}
      <motion.circle
        cx="100"
        cy="80"
        r="50"
        fill="none"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.2"
        animate={{
          r: [45, 55, 45],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
}

// ============================================================================
// NETWORK GRAPH SVG - For NetworkExplorer empty state
// ============================================================================

function NetworkGraphIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background breathing glow */}
      <motion.ellipse
        cx="100"
        cy="80"
        rx="70"
        ry="50"
        fill="url(#nodeGradient)"
        fillOpacity="0.1"
        {...breathingAnimation}
      />

      {/* Connection lines */}
      <motion.line
        x1="100" y1="80" x2="40" y2="40"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.line
        x1="100" y1="80" x2="160" y2="40"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <motion.line
        x1="100" y1="80" x2="40" y2="120"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.line
        x1="100" y1="80" x2="160" y2="120"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      {/* Center node */}
      <motion.circle
        cx="100"
        cy="80"
        r="16"
        fill="url(#nodeGradient)"
        stroke="#06b6d4"
        strokeWidth="2"
        filter="url(#glow)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="6"
        fill="#06b6d4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Outer nodes - pulsing with breathing animation */}
      {[
        { cx: 40, cy: 40, delay: 0.3 },
        { cx: 160, cy: 40, delay: 0.4 },
        { cx: 40, cy: 120, delay: 0.5 },
        { cx: 160, cy: 120, delay: 0.6 },
      ].map((node, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill="url(#nodeGradient)"
            stroke="#3f3f46"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: [0.6, 1, 0.6] }}
            transition={{
              scale: { duration: 0.4, delay: node.delay },
              opacity: { duration: 3, repeat: Infinity, delay: node.delay }
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill="#71717a"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, delay: node.delay, repeat: Infinity }}
          />
        </motion.g>
      ))}

      {/* Decorative dots with breathing */}
      {[
        { cx: 70, cy: 55, r: 2 },
        { cx: 130, cy: 55, r: 2 },
        { cx: 70, cy: 105, r: 2 },
        { cx: 130, cy: 105, r: 2 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="#52525b"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// JOB QUEUE SVG - For RequesterDashboard empty state
// ============================================================================

function JobQueueIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Stacked cards effect */}
      <motion.rect
        x="45"
        y="50"
        width="110"
        height="70"
        rx="8"
        fill="#18181b"
        stroke="#27272a"
        strokeWidth="1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.rect
        x="40"
        y="45"
        width="110"
        height="70"
        rx="8"
        fill="#1f1f23"
        stroke="#3f3f46"
        strokeWidth="1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Main card */}
      <motion.rect
        x="35"
        y="40"
        width="130"
        height="80"
        rx="10"
        fill="url(#cardGradient)"
        stroke="#52525b"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Card content lines */}
      <motion.rect
        x="50"
        y="55"
        width="60"
        height="6"
        rx="3"
        fill="#3f3f46"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
      <motion.rect
        x="50"
        y="68"
        width="80"
        height="4"
        rx="2"
        fill="#27272a"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.rect
        x="50"
        y="78"
        width="50"
        height="4"
        rx="2"
        fill="#27272a"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />

      {/* Status indicator */}
      <motion.circle
        cx="145"
        cy="58"
        r="8"
        fill="#27272a"
        stroke="#52525b"
        strokeWidth="1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      <motion.circle
        cx="145"
        cy="58"
        r="3"
        fill="#52525b"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, delay: 0.9, repeat: Infinity }}
      />

      {/* Sparkle decoration */}
      <motion.path
        d="M160 30 L163 35 L168 35 L164 39 L166 44 L160 41 L154 44 L156 39 L152 35 L157 35 Z"
        fill="url(#sparkGradient)"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1, 0.8], rotate: [0, 15, 0] }}
        transition={{ duration: 2, delay: 1, repeat: Infinity }}
      />

      {/* Floating plus icon hint */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <motion.circle
          cx="100"
          cy="135"
          r="12"
          fill="#27272a"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 135px" }}
        />
        <motion.path
          d="M96 135 H104 M100 131 V139"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>
    </svg>
  );
}

// ============================================================================
// WORKER NODE SVG - For WorkerDashboard empty state
// ============================================================================

function WorkerNodeIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="serverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Server rack */}
      <motion.rect
        x="60"
        y="35"
        width="80"
        height="90"
        rx="6"
        fill="url(#serverGradient)"
        stroke="#3f3f46"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Server slots */}
      {[0, 1, 2].map((i) => (
        <motion.g key={i}>
          <motion.rect
            x="70"
            y={50 + i * 25}
            width="60"
            height="18"
            rx="3"
            fill="#18181b"
            stroke="#27272a"
            strokeWidth="1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
          />
          {/* LED indicators */}
          <motion.circle
            cx="80"
            cy={59 + i * 25}
            r="3"
            fill={i === 0 ? "#52525b" : "#27272a"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.15 }}
          />
          <motion.rect
            x="90"
            y={56 + i * 25}
            width="30"
            height="6"
            rx="1"
            fill="#27272a"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
          />
        </motion.g>
      ))}

      {/* Pulsing connection waves */}
      <motion.circle
        cx="100"
        cy="80"
        r="50"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="50"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1"
        strokeOpacity="0.1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
      />

      {/* Arrow pointing down - "jobs incoming" hint */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.path
          d="M100 130 L90 140 L95 140 L95 150 L105 150 L105 140 L110 140 Z"
          fill="#52525b"
          stroke="#71717a"
          strokeWidth="1"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>

      {/* Data stream dots */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={30 + i * 10}
          cy={60 + i * 15}
          r="3"
          fill="#06b6d4"
          opacity="0.3"
          animate={{
            x: [0, 30, 60],
            opacity: [0.3, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={160 + i * 10}
          cy={100 - i * 15}
          r="3"
          fill="#8b5cf6"
          opacity="0.3"
          animate={{
            x: [0, -30, -60],
            opacity: [0.3, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3 + 0.5,
            repeat: Infinity,
          }}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// OFFLINE STATE SVG - For worker offline state
// ============================================================================

// ============================================================================
// TEMPLATES SVG - For TemplateLibrary empty state
// ============================================================================

function TemplatesIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="templateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Stacked template cards */}
      <motion.rect
        x="55"
        y="55"
        width="90"
        height="60"
        rx="6"
        fill="#18181b"
        stroke="#27272a"
        strokeWidth="1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.rect
        x="50"
        y="50"
        width="90"
        height="60"
        rx="6"
        fill="#1f1f23"
        stroke="#3f3f46"
        strokeWidth="1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Main template card */}
      <motion.rect
        x="45"
        y="45"
        width="110"
        height="70"
        rx="8"
        fill="url(#templateGradient)"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Template header */}
      <motion.rect
        x="55"
        y="55"
        width="50"
        height="8"
        rx="4"
        fill="#8b5cf6"
        fillOpacity="0.4"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />

      {/* Template lines */}
      <motion.rect
        x="55"
        y="70"
        width="80"
        height="4"
        rx="2"
        fill="#3f3f46"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.rect
        x="55"
        y="80"
        width="60"
        height="4"
        rx="2"
        fill="#27272a"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />
      <motion.rect
        x="55"
        y="90"
        width="70"
        height="4"
        rx="2"
        fill="#27272a"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />

      {/* Category badges */}
      <motion.rect
        x="120"
        y="55"
        width="25"
        height="12"
        rx="6"
        fill="#06b6d4"
        fillOpacity="0.2"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      />

      {/* Sparkle decoration */}
      <motion.path
        d="M160 40 L163 45 L168 45 L164 49 L166 54 L160 51 L154 54 L156 49 L152 45 L157 45 Z"
        fill="#8b5cf6"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1, 0.8], rotate: [0, 15, 0] }}
        transition={{ duration: 2, delay: 1, repeat: Infinity }}
      />

      {/* Add template button hint */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <motion.circle
          cx="100"
          cy="135"
          r="12"
          fill="#27272a"
          stroke="#8b5cf6"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 135px" }}
        />
        <motion.path
          d="M96 135 H104 M100 131 V139"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>
    </svg>
  );
}

function OfflineIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="offlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Power button circle */}
      <motion.circle
        cx="100"
        cy="75"
        r="40"
        fill="url(#offlineGradient)"
        stroke="#52525b"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      />
      <motion.circle
        cx="100"
        cy="75"
        r="30"
        fill="#18181b"
        stroke="#3f3f46"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />

      {/* Power icon */}
      <motion.path
        d="M100 55 V70"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
      <motion.path
        d="M85 65 A20 20 0 1 0 115 65"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />

      {/* Status text area */}
      <motion.rect
        x="60"
        y="125"
        width="80"
        height="20"
        rx="4"
        fill="#27272a"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.circle
        cx="75"
        cy="135"
        r="4"
        fill="#f59e0b"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.rect
        x="85"
        y="132"
        width="45"
        height="6"
        rx="2"
        fill="#3f3f46"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />

      {/* Decorative corners */}
      <motion.path
        d="M30 40 L30 30 L40 30"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      <motion.path
        d="M170 40 L170 30 L160 30"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.55 }}
      />
      <motion.path
        d="M30 120 L30 130 L40 130"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.path
        d="M170 120 L170 130 L160 130"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.65 }}
      />
    </svg>
  );
}

// ============================================================================
// EMPTY STATE WRAPPER COMPONENT
// ============================================================================

export type EmptyStateVariant =
  | "network"
  | "jobs"
  | "worker"
  | "offline"
  | "templates"
  | "sleeping"    // Sleeping node - for offline/empty worker queue
  | "radar"       // Pulsing radar - for waiting-for-jobs
  | "complete";   // Checkmark constellation - for all-caught-up

export interface EmptyStateIllustrationProps {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: LucideIcon;
  onCtaClick?: () => void;
  "data-testid"?: string;
}

const illustrationMap: Record<EmptyStateVariant, React.FC> = {
  network: NetworkGraphIllustration,
  jobs: JobQueueIllustration,
  worker: PulsingRadarIllustration,   // Updated to use radar for waiting state
  offline: SleepingNodeIllustration,  // Updated to use sleeping node
  templates: TemplatesIllustration,
  sleeping: SleepingNodeIllustration,
  radar: PulsingRadarIllustration,
  complete: CheckmarkConstellationIllustration,
};

export function EmptyStateIllustration({
  variant,
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaIcon: CtaIcon,
  onCtaClick,
  "data-testid": testId,
}: EmptyStateIllustrationProps) {
  const Illustration = illustrationMap[variant];

  const ctaContent = ctaLabel && (
    <motion.span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {CtaIcon && <CtaIcon className="w-4 h-4" />}
      {ctaLabel}
    </motion.span>
  );

  return (
    <motion.div
      className="text-center py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid={testId}
    >
      <Illustration />
      <motion.h3
        className="text-zinc-300 font-medium mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {description}
      </motion.p>
      {ctaLabel && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {ctaHref ? (
            <Link href={ctaHref} data-testid={`${testId}-cta`}>
              {ctaContent}
            </Link>
          ) : onCtaClick ? (
            <button onClick={onCtaClick} data-testid={`${testId}-cta`}>
              {ctaContent}
            </button>
          ) : (
            ctaContent
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
