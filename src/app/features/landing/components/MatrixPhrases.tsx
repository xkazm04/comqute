"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// MATRIX TYPEWRITER PHRASE
// ============================================================================

const PHRASES = [
  "Pay only what you use",
  "No data spying",
  "Blazingly fast",
  "Built different",
];

// Predefined positions for phrases (percentage-based, avoiding center)
const POSITIONS = [
  { x: 8, y: 15 },   // Top left
  { x: 75, y: 12 },  // Top right
  { x: 5, y: 75 },   // Bottom left
  { x: 70, y: 80 },  // Bottom right
  { x: 85, y: 45 },  // Right middle
  { x: 3, y: 50 },   // Left middle
  { x: 20, y: 88 },  // Bottom left-center
  { x: 78, y: 25 },  // Top right lower
];

interface TypewriterPhraseProps {
  phrase: string;
  x: number;
  y: number;
  delay: number;
  onComplete: () => void;
}

function TypewriterPhrase({ phrase, x, y, delay, onComplete }: TypewriterPhraseProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  // Matrix characters for scramble effect
  const matrixCharSet = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const chars: string[] = [];

    // Initialize with matrix characters
    for (let i = 0; i < phrase.length; i++) {
      chars.push(matrixCharSet[Math.floor(Math.random() * matrixCharSet.length)]);
    }
    setMatrixChars(chars);

    const typeInterval = setInterval(() => {
      if (currentIndex < phrase.length) {
        // Update matrix chars for remaining positions
        const newChars = [...chars];
        for (let i = currentIndex + 1; i < phrase.length; i++) {
          newChars[i] = matrixCharSet[Math.floor(Math.random() * matrixCharSet.length)];
        }
        newChars[currentIndex] = phrase[currentIndex];
        setMatrixChars(newChars);
        setDisplayText(phrase.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsComplete(true);

        // Fade out after display time
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [isTyping, phrase, onComplete, matrixCharSet]);

  if (!isTyping) return null;

  return (
    <motion.div
      className="absolute font-mono text-xs sm:text-sm pointer-events-none select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isComplete ? [1, 1, 0] : 1 }}
      transition={{ duration: isComplete ? 1.5 : 0.3, times: isComplete ? [0, 0.7, 1] : undefined }}
    >
      {/* Glowing background effect */}
      <div
        className="absolute inset-0 -m-2 rounded blur-lg"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Text with matrix effect */}
      <span className="relative">
        {/* Typed portion in cyan */}
        <span className="text-cyan-400" style={{ textShadow: "0 0 10px rgba(34, 211, 238, 0.5)" }}>
          {displayText}
        </span>
        {/* Matrix scramble portion */}
        <span className="text-emerald-500/60">
          {matrixChars.slice(displayText.length).join("")}
        </span>
        {/* Cursor */}
        {!isComplete && (
          <motion.span
            className="text-cyan-400"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            _
          </motion.span>
        )}
      </span>
    </motion.div>
  );
}

// ============================================================================
// MATRIX PHRASES CONTAINER
// ============================================================================

export function MatrixPhrases() {
  const [activePhrase, setActivePhrase] = useState<{
    phrase: string;
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [positionIndex, setPositionIndex] = useState(0);
  const [key, setKey] = useState(0);

  const spawnPhrase = useCallback(() => {
    const phrase = PHRASES[phraseIndex];
    const position = POSITIONS[positionIndex];

    setActivePhrase({
      phrase,
      x: position.x,
      y: position.y,
      id: key,
    });
    setKey((k) => k + 1);
    setPhraseIndex((i) => (i + 1) % PHRASES.length);
    setPositionIndex((i) => (i + 1) % POSITIONS.length);
  }, [phraseIndex, positionIndex, key]);

  const handleComplete = useCallback(() => {
    setActivePhrase(null);
    // Spawn next phrase after a short delay
    setTimeout(() => {
      spawnPhrase();
    }, 500);
  }, [spawnPhrase]);

  // Initial spawn
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      spawnPhrase();
    }, 2500);

    return () => clearTimeout(initialDelay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-5">
      <AnimatePresence>
        {activePhrase && (
          <TypewriterPhrase
            key={activePhrase.id}
            phrase={activePhrase.phrase}
            x={activePhrase.x}
            y={activePhrase.y}
            delay={0}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// GLOWING TAGLINE
// ============================================================================

export function GlowingTagline() {
  return (
    <motion.div
      className="mt-12 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
    >
      {/* Outer glow layers */}
      <div
        className="absolute inset-0 blur-2xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 blur-xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Main text with glow */}
      <motion.p
        className="relative text-white font-mono text-xs tracking-[0.3em] uppercase"
        style={{
          textShadow: `
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(255, 255, 255, 0.6),
            0 0 30px rgba(34, 211, 238, 0.5),
            0 0 40px rgba(34, 211, 238, 0.3)
          `,
        }}
        animate={{
          textShadow: [
            `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)`,
            `0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(255, 255, 255, 0.8), 0 0 40px rgba(34, 211, 238, 0.7), 0 0 50px rgba(34, 211, 238, 0.5)`,
            `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        &lt;/ Intelligence for Everyone /&gt;
      </motion.p>
    </motion.div>
  );
}
