"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface StreamingOutputProps {
  output: string;
  isStreaming: boolean;
  tokenCount?: number;
  variant?: "default" | "minimal" | "terminal";
}

export function StreamingOutput({
  output,
  isStreaming,
  tokenCount = 0,
  variant = "default",
}: StreamingOutputProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output && !isStreaming) {
    return null;
  }

  if (variant === "terminal") {
    return (
      <div className="font-mono bg-black/50 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/50" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <span className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-zinc-500 ml-2">output</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div
          ref={containerRef}
          className="p-4 max-h-[400px] overflow-y-auto text-sm text-emerald-100 whitespace-pre-wrap"
        >
          {output}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-stream-cursor" />
          )}
        </div>
        {tokenCount > 0 && (
          <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
            {tokenCount} tokens generated
          </div>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="relative">
        <div
          ref={containerRef}
          className="p-4 bg-white/5 rounded-2xl max-h-[400px] overflow-y-auto text-white/90 whitespace-pre-wrap"
        >
          {output}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-white ml-0.5 animate-stream-cursor" />
          )}
        </div>
        {output && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 rounded-2xl blur-xl" />

      {/* Content */}
      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-cyan-400">Generating...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-zinc-400">Response</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {tokenCount > 0 && (
              <span className="text-xs text-zinc-500">{tokenCount} tokens</span>
            )}
            <button
              onClick={handleCopy}
              disabled={!output}
              className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div
          ref={containerRef}
          className="p-4 max-h-[400px] overflow-y-auto text-white/90 whitespace-pre-wrap leading-relaxed"
        >
          {output}
          {isStreaming && (
            <motion.span
              className="inline-block w-2 h-5 bg-cyan-400 ml-0.5"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
