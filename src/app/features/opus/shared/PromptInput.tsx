"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { countTokens } from "@/lib/mock-utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  showSystemPrompt?: boolean;
  systemPrompt?: string;
  onSystemPromptChange?: (value: string) => void;
  variant?: "default" | "minimal" | "terminal";
  maxTokens?: number;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Ask anything...",
  showSystemPrompt = false,
  systemPrompt = "",
  onSystemPromptChange,
  variant = "default",
  maxTokens = 500,
}: PromptInputProps) {
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tokenCount = countTokens(value);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  if (variant === "terminal") {
    return (
      <div className="font-mono">
        <div className="flex items-start gap-2 bg-black/50 rounded-lg p-4 border border-zinc-800">
          <span className="text-emerald-400 select-none">{">"}</span>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-emerald-100 placeholder-zinc-600 resize-none focus:outline-none min-h-[24px]"
            rows={1}
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-600">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{tokenCount} tokens</span>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-white/20 transition-colors min-h-[48px]"
          rows={1}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* System prompt toggle */}
      {showSystemPrompt && (
        <div className="space-y-2">
          <button
            onClick={() => setIsSystemOpen(!isSystemOpen)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>System Prompt</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSystemOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {isSystemOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange?.(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />
        <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-4 py-4 bg-transparent text-white placeholder-zinc-500 resize-none focus:outline-none min-h-[56px]"
            rows={1}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{tokenCount} tokens</span>
              <span className="text-zinc-700">|</span>
              <span>~{Math.ceil(tokenCount * 0.05)}K QUBIC</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={!value.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
