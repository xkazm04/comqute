"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Sliders,
  ChevronDown,
  Send,
  Loader2,
  FileText,
  Eye,
  XCircle,
  Heart,
  Star,
  Users,
  CheckCircle,
  BookOpen,
  Save,
  Play,
} from "lucide-react";
import { GlassCard, StatusBadge, ModelSelector, EmptyStateIllustration } from "../shared";
import { RequesterFlowDiagram } from "./FlowDiagram";
import { WriteReview } from "./WriteReview";
import { StarRating } from "./WorkerProfile";
import { TemplateLibrary, SaveTemplateModal, UseTemplateModal } from "./templates";
import { useWalletStore, useReviewStore, useWorkerStore } from "@/stores";
import { useJobs, useTemplates } from "@/hooks";
import { getDefaultModel, getModelById } from "@/lib/models";
import { formatQubic, formatRelativeTime, formatDuration } from "@/lib/mock-utils";
import { formatCost } from "@/lib/pricing";
import { useRequesterPipeline } from "../lib/job-pipeline";
import type { RequesterJobView } from "../lib/job-pipeline";
import type { Job, Worker } from "@/types";
import type { JobTemplate, CreateTemplateRequest } from "@/types/template";

// ============================================================================
// JOB ROW (non-glass, minimal) - Uses RequesterJobView from pipeline
// ============================================================================

function JobRow({ job }: { job: RequesterJobView }) {
  const model = getModelById(job.modelId);

  return (
    <Link href={`/opus/job/${job.id}`} data-testid={`job-row-${job.id}`}>
      <motion.div
        whileHover={{ x: 2 }}
        className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all group cursor-pointer"
      >
        <StatusBadge status={job.status} />
        <div className="flex-1 min-w-0">
          <p className="body-default text-zinc-300 truncate">
            {job.prompt.slice(0, 50)}{job.prompt.length > 50 ? "..." : ""}
          </p>
          {job.hasOutput && (
            <p className="caption text-zinc-500 truncate mt-0.5">
              {job.outputPreview.slice(0, 40)}...
            </p>
          )}
        </div>
        <span className="micro text-zinc-500 hidden sm:block">{model?.displayName}</span>
        <span className="micro text-zinc-500">{formatRelativeTime(job.createdAt)}</span>
        {job.hasOutput ? (
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
// COST INDICATOR (non-glass, inline) - With disclaimers and max cost support
// ============================================================================

interface CostIndicatorProps {
  modelId: string;
  prompt: string;
  maxTokens: number;
  maxCost: number | null;
  onMaxCostExceeded?: (exceeded: boolean) => void;
}

function CostIndicator({ modelId, prompt, maxTokens, maxCost, onMaxCostExceeded }: CostIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { estimateJobCost } = useJobs();
  const { totalCost, inputTokens, estimatedOutputTokens } = estimateJobCost(modelId, prompt, undefined, maxTokens);

  // Calculate worst-case cost (model uses full maxTokens output)
  const worstCaseCost = Math.ceil(
    (inputTokens / 1000) * (getModelById(modelId)?.pricing.inputPer1k ?? 0) +
    (maxTokens / 1000) * (getModelById(modelId)?.pricing.outputPer1k ?? 0)
  );

  const exceedsMaxCost = maxCost !== null && worstCaseCost > maxCost;

  // Notify parent of max cost exceeded state
  useEffect(() => {
    onMaxCostExceeded?.(exceedsMaxCost);
  }, [exceedsMaxCost, onMaxCostExceeded]);

  if (!prompt.trim()) return null;

  return (
    <div className="relative">
      <div
        className="flex items-center gap-4 text-xs text-zinc-500 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        data-testid="cost-indicator"
      >
        <span>{inputTokens} input</span>
        <span>~{estimatedOutputTokens} output</span>
        <span className={`font-medium flex items-center gap-1 ${exceedsMaxCost ? 'text-amber-400' : 'text-cyan-400'}`}>
          <span>~{formatCost(totalCost)}</span>
          <AlertCircle className="w-3 h-3 opacity-60" />
        </span>
      </div>

      {/* Cost Estimation Disclaimer Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full right-0 mb-2 w-72 p-3 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl z-50"
            data-testid="cost-disclaimer-tooltip"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Cost Estimation Disclaimer
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                This is an <strong className="text-zinc-300">estimate only</strong>. Actual costs may differ based on:
              </p>
              <ul className="text-[10px] text-zinc-500 space-y-1 ml-3">
                <li>• Actual tokens generated by the model</li>
                <li>• Network conditions and worker pricing</li>
                <li>• Model response length (up to max tokens)</li>
              </ul>
              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Estimated cost:</span>
                  <span className="text-cyan-400">{formatCost(totalCost)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Maximum possible:</span>
                  <span className="text-amber-400">{formatCost(worstCaseCost)}</span>
                </div>
                {maxCost !== null && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Your limit:</span>
                    <span className={exceedsMaxCost ? 'text-red-400' : 'text-emerald-400'}>{formatCost(maxCost)}</span>
                  </div>
                )}
              </div>
              {exceedsMaxCost && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  Worst-case cost exceeds your spending limit
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PARAMETERS INLINE (non-glass) - With max cost limit
// ============================================================================

function ParametersInline({
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature,
  maxCost,
  setMaxCost,
  maxCostEnabled,
  setMaxCostEnabled,
  isOpen,
  setIsOpen,
}: {
  maxTokens: number;
  setMaxTokens: (v: number) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  maxCost: number;
  setMaxCost: (v: number) => void;
  maxCostEnabled: boolean;
  setMaxCostEnabled: (v: boolean) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        data-testid="parameters-toggle-btn"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Parameters</span>
        {maxCostEnabled && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
            Limit: {formatCost(maxCost)}
          </span>
        )}
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
            <div className="space-y-4 pt-4">
              {/* Model Parameters Row */}
              <div className="flex gap-6">
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
                    data-testid="max-tokens-slider"
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
                    data-testid="temperature-slider"
                  />
                </div>
              </div>

              {/* Max Cost Limit Section */}
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50" data-testid="max-cost-section">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 font-medium">Spending Limit</label>
                    <div className="group relative">
                      <AlertCircle className="w-3 h-3 text-zinc-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Set a hard limit on the maximum amount you&apos;re willing to spend. Jobs exceeding this limit will be blocked.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaxCostEnabled(!maxCostEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      maxCostEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                    data-testid="max-cost-toggle"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        maxCostEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {maxCostEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Max cost per job:</span>
                        <span className="text-xs text-emerald-400 font-mono">{formatCost(maxCost)}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={100000}
                        step={1000}
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        data-testid="max-cost-slider"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>1K QUBIC</span>
                        <span>100K QUBIC</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2">
                        Jobs that could exceed this limit (worst-case scenario) will show a warning and require confirmation.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
      data-testid="job-submitted-message"
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
        data-testid="view-job-link"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </Link>
      <button
        onClick={onDismiss}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
        data-testid="dismiss-job-message-btn"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// JOB SUBMISSION ERROR MESSAGE
// ============================================================================

function JobErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
      data-testid="job-error-message"
    >
      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-400">Job Submission Failed</h3>
        <p className="text-xs text-zinc-400 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
        data-testid="dismiss-error-message-btn"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// PREFERRED WORKERS PANEL
// ============================================================================

function PreferredWorkersPanel({ requesterId }: { requesterId: string }) {
  const { getFavoriteWorkers, toggleFavorite } = useReviewStore();
  const { worker: currentWorker } = useWorkerStore();

  const favorites = getFavoriteWorkers(requesterId);

  if (favorites.length === 0) {
    return null;
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          Preferred Workers
        </h3>
        <span className="text-xs text-zinc-500">{favorites.length} saved</span>
      </div>
      <div className="space-y-3">
        {favorites.slice(0, 3).map((pref) => (
          <div
            key={pref.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
            data-testid={`preferred-worker-${pref.id}`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              {pref.workerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{pref.workerName}</p>
              <p className="text-[10px] text-zinc-500">
                {pref.totalJobsTogether} jobs together
                {pref.avgRatingGiven > 0 && ` • ${pref.avgRatingGiven.toFixed(1)}★ avg`}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(requesterId, pref.workerId, pref.workerAddress, pref.workerName)}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              data-testid={`remove-preferred-${pref.id}`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        ))}
      </div>
      {favorites.length > 3 && (
        <p className="text-xs text-zinc-500 mt-3 text-center">
          +{favorites.length - 3} more preferred workers
        </p>
      )}
    </GlassCard>
  );
}

// ============================================================================
// COMPLETED JOB WITH REVIEW OPTION - Uses RequesterJobView from pipeline
// ============================================================================

function CompletedJobRow({
  jobView,
  rawJob,
  worker,
  requesterId,
  requesterAddress,
}: {
  jobView: RequesterJobView;
  rawJob: Job;  // Needed for WriteReview component
  worker: Worker | null;
  requesterId: string;
  requesterAddress: string;
}) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const model = getModelById(jobView.modelId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50"
        data-testid={`completed-job-${jobView.id}`}
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">
            {jobView.prompt.slice(0, 40)}{jobView.prompt.length > 40 ? "..." : ""}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
            <span>{model?.displayName}</span>
            <span>•</span>
            <span>{formatRelativeTime(jobView.completedAt || jobView.createdAt)}</span>
            {jobView.processingTime && (
              <>
                <span>•</span>
                <span>{formatDuration(jobView.processingTime)}</span>
              </>
            )}
          </div>
        </div>

        {/* Review Status - uses pipeline's computed canReview/hasReview */}
        {jobView.hasReview ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-amber-400">Reviewed</span>
          </div>
        ) : jobView.canReview && worker ? (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors"
            data-testid="leave-review-btn"
          >
            <Star className="w-3.5 h-3.5" />
            Review
          </button>
        ) : null}

        <Link
          href={`/opus/job/${jobView.id}`}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          data-testid="view-completed-job-btn"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Review Modal */}
      {worker && (
        <WriteReview
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          job={rawJob}
          worker={worker}
          requesterId={requesterId}
          requesterAddress={requesterAddress}
        />
      )}
    </>
  );
}

// ============================================================================
// VIEW TABS
// ============================================================================

type ViewTab = "compose" | "templates";

// ============================================================================
// MAIN DASHBOARD - Uses JobPipeline abstraction
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cost limit state
  const [maxCost, setMaxCost] = useState(50000); // Default 50K QUBIC limit
  const [maxCostEnabled, setMaxCostEnabled] = useState(false);
  const [costExceedsLimit, setCostExceedsLimit] = useState(false);
  const [showCostWarning, setShowCostWarning] = useState(false);

  // Template state
  const [activeTab, setActiveTab] = useState<ViewTab>("compose");
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showUseTemplateModal, setShowUseTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);

  const { wallet } = useWalletStore();
  const { worker } = useWorkerStore();
  const { createJob } = useJobs();
  const { createTemplate, updateTemplate, getMostUsed } = useTemplates();

  // Get popular templates for quick access
  const popularTemplates = getMostUsed(3);

  // Use the unified JobPipeline abstraction for requester-specific state
  const {
    state: pipelineState,
    isConnected,
    requesterId,
    activeJobs,
    pendingReviews,
    completedJobs: pipelineCompletedJobs,
  } = useRequesterPipeline();

  // Get recent jobs from pipeline (first 5 active + recent completed)
  const recentJobs = pipelineState?.jobs.slice(0, 5) ?? [];
  // Get completed jobs needing review from pipeline
  const completedJobsForReview = pendingReviews.slice(0, 3);

  const handleSubmit = async (bypassWarning = false) => {
    if (!prompt.trim() || !wallet.isConnected || isSubmitting) return;

    // Check if cost exceeds limit and warning not bypassed
    if (maxCostEnabled && costExceedsLimit && !bypassWarning) {
      setShowCostWarning(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setShowCostWarning(false);

    try {
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
      } else {
        // createJob returns null if wallet not connected or insufficient balance
        if (!wallet.isConnected) {
          setSubmitError("Wallet not connected. Please connect your wallet to submit jobs.");
        } else {
          setSubmitError("Insufficient balance. Please add funds to your wallet.");
        }
      }
    } catch (error) {
      console.error("Job submission failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(`Failed to submit job: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Template handlers
  const handleSaveAsTemplate = () => {
    if (!prompt.trim()) return;
    setEditingTemplate(null);
    setShowSaveTemplateModal(true);
  };

  const handleSaveTemplate = (request: CreateTemplateRequest) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, request);
    } else {
      createTemplate(request);
    }
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template: JobTemplate) => {
    setEditingTemplate(template);
    setShowSaveTemplateModal(true);
  };

  const handleUseTemplate = (template: JobTemplate) => {
    setSelectedTemplate(template);
    setShowUseTemplateModal(true);
  };

  const handleSubmitFromTemplate = (data: {
    prompt: string;
    systemPrompt?: string;
    modelId: string;
    maxTokens: number;
    temperature: number;
  }) => {
    // Populate the form with template data and switch to compose view
    setPrompt(data.prompt);
    setSystemPrompt(data.systemPrompt || "");
    setSelectedModel(data.modelId);
    setMaxTokens(data.maxTokens);
    setTemperature(data.temperature);
    setActiveTab("compose");
    // Auto-submit if wallet is connected
    if (wallet.isConnected) {
      // Delay submit to allow state update
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  };

  return (
    <div className="space-y-[var(--space-6)]">
      {/* Page Header with Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-primary text-white flex items-center gap-[var(--space-3)]">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Inference Request
          </h1>
          <p className="text-zinc-500 body-default mt-1">Submit prompts to the decentralized compute network</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-900/60 border border-zinc-800" data-testid="view-tabs">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md caption-medium transition-all ${
                activeTab === "compose"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              data-testid="compose-tab"
            >
              <Send className="w-3.5 h-3.5" />
              Compose
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md caption-medium transition-all ${
                activeTab === "templates"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              data-testid="templates-tab"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Templates
            </button>
          </div>
          {!wallet.isConnected && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="caption text-amber-400">Connect wallet to submit</span>
            </div>
          )}
        </div>
      </div>

      {/* Flow Diagram - Educational (only in compose mode) */}
      {activeTab === "compose" && <RequesterFlowDiagram />}

      {/* Job Submitted Message */}
      <AnimatePresence>
        {submittedJob && (
          <JobSubmittedMessage
            job={submittedJob}
            onDismiss={() => setSubmittedJob(null)}
          />
        )}
      </AnimatePresence>

      {/* Job Submission Error Message */}
      <AnimatePresence>
        {submitError && (
          <JobErrorMessage
            message={submitError}
            onDismiss={() => setSubmitError(null)}
          />
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "compose" ? (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-[var(--space-6)]"
          >
            {/* Main Input Area - Single Glass Card */}
            <GlassCard className="space-y-[var(--space-6)]">
              {/* Model Selector */}
              <div>
                <label className="caption text-zinc-500 mb-2 block">Model</label>
                <ModelSelector
                  selectedModel={selectedModel}
                  onSelect={setSelectedModel}
                  variant="pills"
                />
              </div>

              {/* Prompt Input */}
              <div>
                <label className="caption text-zinc-500 mb-2 block">Prompt</label>
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
                    data-testid="job-prompt-input"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {/* Save as Template Button */}
                    {prompt.trim() && (
                      <motion.button
                        onClick={handleSaveAsTemplate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 caption-medium hover:bg-purple-500/20 transition-colors"
                        data-testid="save-as-template-btn"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Template
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleSubmit()}
                      disabled={!prompt.trim() || !wallet.isConnected || isSubmitting}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white body-medium transition-colors"
                      data-testid="submit-job-btn"
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
              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-[var(--space-4)]">
                <ParametersInline
                  maxTokens={maxTokens}
                  setMaxTokens={setMaxTokens}
                  temperature={temperature}
                  setTemperature={setTemperature}
                  maxCost={maxCost}
                  setMaxCost={setMaxCost}
                  maxCostEnabled={maxCostEnabled}
                  setMaxCostEnabled={setMaxCostEnabled}
                  isOpen={showParams}
                  setIsOpen={setShowParams}
                />
                <CostIndicator
                  modelId={selectedModel}
                  prompt={prompt}
                  maxTokens={maxTokens}
                  maxCost={maxCostEnabled ? maxCost : null}
                  onMaxCostExceeded={setCostExceedsLimit}
                />
              </div>

              {/* Cost Limit Warning */}
              <AnimatePresence>
                {showCostWarning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                      data-testid="cost-limit-warning"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-amber-400">Spending Limit Warning</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          The worst-case cost for this job may exceed your spending limit of{" "}
                          <span className="text-amber-400 font-medium">{formatCost(maxCost)}</span>.
                          This could happen if the model generates the maximum number of tokens ({maxTokens}).
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-2">
                          Note: Blockchain transactions are irreversible. Once escrowed funds are committed,
                          they cannot be recovered if the actual cost differs from the estimate.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleSubmit(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors"
                            data-testid="proceed-anyway-btn"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Proceed Anyway
                          </button>
                          <button
                            onClick={() => setShowCostWarning(false)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs hover:text-zinc-300 transition-colors"
                            data-testid="cancel-submit-btn"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setShowCostWarning(false);
                              setShowParams(true);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            data-testid="adjust-limit-btn"
                          >
                            Adjust Limit
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Quick Prompts & Popular Templates */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Quick Prompts */}
              <div className="flex-1">
                <p className="text-xs text-zinc-600 mb-3">Try a quick prompt:</p>
                <QuickPrompts onSelect={setPrompt} />
              </div>

              {/* Popular Templates - Quick Access */}
              {popularTemplates.length > 0 && (
                <div className="flex-1">
                  <p className="text-xs text-zinc-600 mb-3 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Popular templates:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full caption text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                        data-testid={`quick-template-${template.id}`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{template.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveTab("templates")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full caption text-zinc-500 hover:text-zinc-300 transition-colors"
                      data-testid="view-all-templates-link"
                    >
                      View all
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TemplateLibrary
              onUseTemplate={handleUseTemplate}
              onCreateNew={() => {
                setEditingTemplate(null);
                setPrompt("");
                setShowSaveTemplateModal(true);
              }}
              onEditTemplate={handleEditTemplate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout for jobs and preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
        {/* Recent Jobs - Non-glass, simple list - Uses pipeline views */}
        <div className="lg:col-span-2" data-testid="requester-jobs-section">
          {recentJobs.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading-tertiary text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  My Jobs
                  {pipelineState && pipelineState.stats.totalJobs > 0 && (
                    <span className="micro text-zinc-500">
                      ({pipelineState.stats.pendingCount} pending, {pipelineState.stats.processingCount} processing)
                    </span>
                  )}
                </h2>
                {pipelineState && pipelineState.stats.totalJobs > 5 && (
                  <Link href="/opus/history" className="caption text-cyan-400 hover:text-cyan-300" data-testid="view-all-jobs-link">
                    View all
                  </Link>
                )}
              </div>
              <div className="space-y-1" data-testid="job-list">
                {recentJobs.map((jobView) => (
                  <JobRow key={jobView.id} job={jobView} />
                ))}
              </div>
            </div>
          ) : (
            <GlassCard>
              <EmptyStateIllustration
                variant={wallet.isConnected ? "jobs" : "network"}
                title={wallet.isConnected ? "No jobs yet" : "Connect your wallet"}
                description={wallet.isConnected
                  ? "Enter a prompt above to submit your first inference request to the decentralized compute network."
                  : "Connect your Qubic wallet to start submitting inference requests and accessing the distributed AI network."
                }
                ctaLabel={wallet.isConnected ? "Compose a Prompt" : "Connect Wallet"}
                ctaIcon={wallet.isConnected ? Sparkles : undefined}
                onCtaClick={() => {
                  if (wallet.isConnected) {
                    document.querySelector<HTMLTextAreaElement>('[data-testid="job-prompt-input"]')?.focus();
                  } else {
                    document.querySelector<HTMLButtonElement>('[data-testid="wallet-button"]')?.click();
                  }
                }}
                data-testid="requester-empty-state"
              />
            </GlassCard>
          )}

          {/* Completed Jobs needing reviews - Uses pipeline's pendingReviews */}
          {completedJobsForReview.length > 0 && (
            <div className="mt-6" data-testid="reviews-section">
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading-tertiary text-zinc-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Leave a Review
                  <span className="micro text-zinc-500">
                    ({completedJobsForReview.length} pending)
                  </span>
                </h2>
              </div>
              <div className="space-y-2">
                {completedJobsForReview.map((jobView) => (
                  <CompletedJobRow
                    key={jobView.id}
                    jobView={jobView}
                    rawJob={{
                      id: jobView.id,
                      modelId: jobView.modelId,
                      prompt: jobView.prompt,
                      status: jobView.status,
                      requester: requesterId,
                      createdAt: jobView.createdAt,
                      startedAt: jobView.startedAt,
                      completedAt: jobView.completedAt,
                      assignedWorker: jobView.assignedWorker,
                      estimatedCost: jobView.estimatedCost,
                      actualCost: jobView.actualCost,
                      inputTokens: 0,
                      outputTokens: jobView.outputTokens,
                      output: jobView.outputPreview,
                      parameters: { maxTokens: 500, temperature: 0.7, topP: 0.9 },
                      mockTxHash: "",
                      mockBlockNumber: 0,
                    } as Job}
                    worker={worker}
                    requesterId={requesterId}
                    requesterAddress={wallet.address}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preferred Workers Panel */}
        <div>
          {isConnected && requesterId && (
            <PreferredWorkersPanel requesterId={requesterId} />
          )}
        </div>
      </div>

      {/* Template Modals */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => {
          setShowSaveTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        initialData={
          editingTemplate
            ? undefined
            : {
                prompt,
                systemPrompt,
                modelId: selectedModel,
                maxTokens,
                temperature,
              }
        }
        existingTemplate={editingTemplate || undefined}
      />

      <UseTemplateModal
        isOpen={showUseTemplateModal}
        onClose={() => {
          setShowUseTemplateModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSubmit={handleSubmitFromTemplate}
      />
    </div>
  );
}
