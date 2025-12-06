"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Sliders,
  ChevronDown,
  Send,
  Loader2,
  FileText,
  Eye,
} from "lucide-react";
import { GlassCard } from "./Layout";
import { RequesterFlowDiagram } from "./FlowDiagram";
import { ModelSelector } from "../shared";
import { useWalletStore, useJobStore } from "@/stores";
import { useJobs } from "@/hooks";
import { getDefaultModel, getModelById } from "@/lib/models";
import { formatQubic, formatRelativeTime } from "@/lib/mock-utils";
import { formatCost } from "@/lib/pricing";
import type { Job, JobStatus } from "@/types";

// ============================================================================
// STATUS BADGE (non-glass)
// ============================================================================

function StatusBadge({ status }: { status: JobStatus }) {
  const config: Record<JobStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Pending" },
    assigned: { icon: Loader2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Assigned" },
    running: { icon: Loader2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Running" },
    streaming: { icon: Loader2, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", label: "Streaming" },
    complete: { icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Complete" },
    failed: { icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20", label: "Failed" },
    cancelled: { icon: AlertCircle, color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20", label: "Cancelled" },
  };

  const { icon: Icon, color, label } = config[status];
  const isAnimating = ["assigned", "running", "streaming"].includes(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${color}`}>
      <Icon className={`w-3 h-3 ${isAnimating ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

// ============================================================================
// JOB ROW (non-glass, minimal)
// ============================================================================

function JobRow({ job }: { job: Job }) {
  const model = getModelById(job.modelId);
  const hasOutput = job.output && job.output.length > 0;

  return (
    <Link href={`/opus/job/${job.id}`}>
      <motion.div
        whileHover={{ x: 2 }}
        className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all group cursor-pointer"
      >
        <StatusBadge status={job.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">
            {job.prompt.slice(0, 50)}{job.prompt.length > 50 ? "..." : ""}
          </p>
          {hasOutput && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {job.output.slice(0, 40)}...
            </p>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:block">{model?.displayName}</span>
        <span className="text-[10px] text-zinc-500">{formatRelativeTime(job.createdAt)}</span>
        {hasOutput ? (
          <Eye className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        )}
      </motion.div>
    </Link>
  );
}

// ============================================================================
// QUICK PROMPTS (non-glass)
// ============================================================================

const quickPrompts = [
  { text: "Explain quantum computing", icon: "🔮" },
  { text: "Write a sorting function", icon: "💻" },
  { text: "Brainstorm startup ideas", icon: "💡" },
  { text: "Summarize machine learning", icon: "🧠" },
];

function QuickPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickPrompts.map((item) => (
        <button
          key={item.text}
          onClick={() => onSelect(item.text)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
        >
          <span>{item.icon}</span>
          <span>{item.text}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// COST INDICATOR (non-glass, inline)
// ============================================================================

function CostIndicator({ modelId, prompt, maxTokens }: { modelId: string; prompt: string; maxTokens: number }) {
  const { estimateJobCost } = useJobs();
  const { totalCost, inputTokens, estimatedOutputTokens } = estimateJobCost(modelId, prompt, undefined, maxTokens);

  if (!prompt.trim()) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-zinc-500">
      <span>{inputTokens} input</span>
      <span>~{estimatedOutputTokens} output</span>
      <span className="text-cyan-400 font-medium">~{formatCost(totalCost)}</span>
    </div>
  );
}

// ============================================================================
// PARAMETERS INLINE (non-glass)
// ============================================================================

function ParametersInline({
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature,
  isOpen,
  setIsOpen,
}: {
  maxTokens: number;
  setMaxTokens: (v: number) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Parameters</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-6 pt-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">Max Tokens</label>
                  <span className="text-xs text-zinc-300 font-mono">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">Temperature</label>
                  <span className="text-xs text-zinc-300 font-mono">{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// JOB SUBMITTED SUCCESS MESSAGE
// ============================================================================

function JobSubmittedMessage({ job, onDismiss }: { job: Job; onDismiss: () => void }) {
  const model = getModelById(job.modelId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
        <FileText className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-emerald-400">Job Submitted to Queue</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {model?.displayName} • Waiting for worker to claim
        </p>
      </div>
      <Link
        href={`/opus/job/${job.id}`}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </Link>
      <button
        onClick={onDismiss}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export function RequesterDashboard() {
  const [selectedModel, setSelectedModel] = useState(getDefaultModel().id);
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const [showParams, setShowParams] = useState(false);
  const [submittedJob, setSubmittedJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { wallet } = useWalletStore();
  const { jobs } = useJobStore();
  const { createJob } = useJobs();

  const recentJobs = jobs.slice(0, 5);

  const handleSubmit = async () => {
    if (!prompt.trim() || !wallet.isConnected || isSubmitting) return;

    setIsSubmitting(true);

    // Create job in pending state - NO Ollama call here
    const job = createJob({
      modelId: selectedModel,
      prompt,
      systemPrompt: systemPrompt || undefined,
      parameters: { maxTokens, temperature },
    });

    if (job) {
      setSubmittedJob(job);
      setPrompt("");
      setSystemPrompt("");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Inference Request
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Submit prompts to the decentralized compute network</p>
        </div>
        {!wallet.isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400">Connect wallet to submit</span>
          </div>
        )}
      </div>

      {/* Flow Diagram - Educational */}
      <RequesterFlowDiagram />

      {/* Job Submitted Message */}
      <AnimatePresence>
        {submittedJob && (
          <JobSubmittedMessage
            job={submittedJob}
            onDismiss={() => setSubmittedJob(null)}
          />
        )}
      </AnimatePresence>

      {/* Main Input Area - Single Glass Card */}
      <GlassCard className="space-y-6">
        {/* Model Selector */}
        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Model</label>
          <ModelSelector
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
            variant="pills"
          />
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Prompt</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  handleSubmit();
                }
              }}
              placeholder="What would you like to know?"
              className="w-full min-h-[120px] p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="absolute bottom-3 right-3">
              <motion.button
                onClick={handleSubmit}
                disabled={!prompt.trim() || !wallet.isConnected || isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Queue Job
              </motion.button>
            </div>
          </div>
        </div>

        {/* Parameters & Cost */}
        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4">
          <ParametersInline
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            temperature={temperature}
            setTemperature={setTemperature}
            isOpen={showParams}
            setIsOpen={setShowParams}
          />
          <CostIndicator modelId={selectedModel} prompt={prompt} maxTokens={maxTokens} />
        </div>
      </GlassCard>

      {/* Quick Prompts */}
      <div>
        <p className="text-xs text-zinc-600 mb-3">Try a quick prompt:</p>
        <QuickPrompts onSelect={setPrompt} />
      </div>

      {/* Recent Jobs - Non-glass, simple list */}
      {recentJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              My Jobs
            </h2>
            {jobs.length > 5 && (
              <Link href="/opus/history" className="text-xs text-cyan-400 hover:text-cyan-300">
                View all
              </Link>
            )}
          </div>
          <div className="space-y-1">
            {recentJobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
