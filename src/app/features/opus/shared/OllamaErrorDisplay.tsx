"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw,
  Terminal,
  ExternalLink,
} from "lucide-react";
import type { OllamaError } from "../lib/ollama-errors";
import { getErrorSeverityStyles } from "../lib/ollama-errors";

export interface OllamaErrorDisplayProps {
  error: OllamaError;
  onRetry?: () => void;
  onDismiss?: () => void;
  modelName?: string;
  compact?: boolean;
  "data-testid"?: string;
}

/**
 * Displays Ollama errors with structured error codes and actionable guidance.
 * Helps workers understand why jobs fail and how to fix issues.
 */
export function OllamaErrorDisplay({
  error,
  onRetry,
  onDismiss,
  modelName,
  compact = false,
  "data-testid": testId,
}: OllamaErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const styles = getErrorSeverityStyles(error.severity);

  const SeverityIcon = {
    critical: AlertOctagon,
    error: AlertCircle,
    warning: AlertTriangle,
  }[error.severity];

  const copyErrorDetails = async () => {
    const details = [
      `Error Code: ${error.code}`,
      `Message: ${error.message}`,
      error.details ? `Details: ${error.details}` : null,
      modelName ? `Model: ${modelName}` : null,
      `Timestamp: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy error details");
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${styles.bg} ${styles.border} border`}
        data-testid={testId || "ollama-error-compact"}
      >
        <SeverityIcon className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-medium ${styles.text}`}>
            [{error.code}]
          </span>
          <span className="text-xs text-zinc-300 ml-2">{error.message}</span>
        </div>
        {onRetry && error.recoverable && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            data-testid="ollama-error-retry-btn"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative overflow-hidden rounded-xl ${styles.bg} ${styles.border} border p-4`}
      data-testid={testId || "ollama-error-display"}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-center`}
        >
          <SeverityIcon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${styles.bg} ${styles.text} border ${styles.border}`}
              data-testid="ollama-error-code"
            >
              {error.code}
            </span>
            {error.severity === "critical" && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                Critical
              </span>
            )}
          </div>
          <p className="text-sm text-white font-medium">{error.message}</p>
          {modelName && (
            <p className="text-xs text-zinc-500 mt-1">Model: {modelName}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-zinc-800/50 transition-colors text-zinc-500 hover:text-zinc-300"
            data-testid="ollama-error-dismiss-btn"
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Guidance Section */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          How to Fix
        </h4>
        <ul className="space-y-1.5">
          {error.guidance.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-zinc-300"
            >
              <span className="text-zinc-500 font-mono mt-0.5">{idx + 1}.</span>
              <span
                className={
                  step.includes(":") && step.includes("ollama")
                    ? "font-mono bg-zinc-900/80 px-1.5 py-0.5 rounded"
                    : ""
                }
              >
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Details Toggle */}
      {error.details && (
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            data-testid="ollama-error-toggle-details-btn"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showDetails ? "Hide" : "Show"} technical details
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 overflow-hidden"
                data-testid="ollama-error-details"
              >
                <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap break-all">
                  {error.details}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/50">
        {onRetry && error.recoverable && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-colors"
            data-testid="ollama-error-retry-full-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
        <button
          onClick={copyErrorDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-xs font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
          data-testid="ollama-error-copy-btn"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
        <a
          href="https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
          data-testid="ollama-error-docs-link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ollama Docs
        </a>
      </div>
    </motion.div>
  );
}
