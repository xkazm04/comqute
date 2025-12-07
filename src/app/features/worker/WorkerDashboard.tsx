"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Power,
  Cpu,
  HardDrive,
  Activity,
  Coins,
  Clock,
  Star,
  Zap,
  Play,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Network,
  Settings,
  Server,
  UserPlus,
  MessageSquare,
  Users,
  TrendingUp,
  Award,
  Flame,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import {
  GlassCard,
  StatItem,
  Toggle,
  LabeledToggle,
  EmptyStateIllustration,
  OllamaErrorDisplay,
  OllamaErrorBoundary,
  parseOllamaError,
  isConnectionError,
  InfoRow,
} from "../opus/shared";
import type { OllamaError } from "../opus/shared";
import { WorkerFlowDiagram } from "../opus/components/FlowDiagram";
import { WorkerOnboarding } from "./WorkerOnboarding";
import { StarRating, ReputationBadge } from "./WorkerProfile";
import { useWorker } from "@/hooks";
import { useInference } from "@/hooks";
import { useReviewStore, useWalletStore } from "@/stores";
import { formatQubic, formatDuration, formatRelativeTime } from "@/lib/mock-utils";
import { getModelById } from "@/lib/models";
import { useWorkerPipeline } from "../opus/lib/job-pipeline";
import type { WorkerJobView } from "../opus/lib/job-pipeline";
import type { Job } from "@/types";

// ============================================================================
// TAB SWITCHER
// ============================================================================

type WorkerTab = "manage" | "onboarding";

function WorkerTabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: WorkerTab;
  onTabChange: (tab: WorkerTab) => void;
}) {
  const tabs = [
    { id: "manage" as WorkerTab, label: "Worker Node", icon: Network, description: "Manage active worker" },
    { id: "onboarding" as WorkerTab, label: "Setup Wizard", icon: UserPlus, description: "Register new worker" },
  ];

  return (
    <div className="flex gap-[var(--space-2)] p-[var(--space-1)] rounded-xl bg-zinc-900/50 border border-zinc-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-[var(--space-2)] px-[var(--space-4)] py-2.5 rounded-lg transition-all
              ${isActive
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="body-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// WORKER STATUS TOGGLE (non-glass, prominent) - With micro-interactions
// ============================================================================

function WorkerStatusToggle({
  status,
  onToggle,
}: {
  status: "online" | "busy" | "offline";
  onToggle: () => void;
}) {
  const isOnline = status !== "offline";
  const isBusy = status === "busy";
  const prevStatusRef = useRef<typeof status | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Track status changes for animation
  useEffect(() => {
    if (prevStatusRef.current !== null && prevStatusRef.current !== status) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);

  // Spring bounce animation for status changes
  const bounceVariants = {
    initial: { scale: 1 },
    bounce: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
        times: [0, 0.5, 1],
      },
    },
  };

  return (
    <motion.div
      data-testid="worker-status-toggle"
      className="flex items-center justify-between p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800"
      variants={bounceVariants}
      initial="initial"
      animate={shouldAnimate ? "bounce" : "initial"}
      style={{
        transition: "border-color 200ms ease-out",
      }}
    >
      <div className="flex items-center gap-[var(--space-4)]">
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isOnline ? "bg-emerald-500/20" : "bg-zinc-800"
          }`}
          animate={shouldAnimate ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            transition: "background-color 200ms ease-out",
          }}
        >
          <Power className={`w-6 h-6 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`} style={{ transition: "color 200ms ease-out" }} />
        </motion.div>
        <div>
          <motion.h3
            className="font-semibold text-white"
            key={status} // Re-animate on status change
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isBusy ? "Processing Job" : isOnline ? "Online" : "Offline"}
          </motion.h3>
          <p className="caption text-zinc-500">
            {isBusy ? "Currently processing with Ollama" : isOnline ? "Ready to claim jobs" : "Not accepting jobs"}
          </p>
        </div>
      </div>

      <Toggle
        enabled={isOnline}
        onToggle={onToggle}
        disabled={isBusy}
        size="lg"
        activeColor="bg-emerald-500"
        data-testid="worker-toggle"
      />
    </motion.div>
  );
}

// ============================================================================
// INFERENCE PROGRESS STATE
// ============================================================================

type InferencePhase = "idle" | "warmup" | "generating" | "complete" | "error";

interface InferenceProgressState {
  phase: InferencePhase;
  tokenCount: number;
  estimatedMaxTokens: number;
  tokensPerSecond: number;
  warmupProgress: number; // 0-100 for model loading
  elapsedMs: number;
  estimatedRemainingMs: number;
  streamPreview: string;
}

const getDefaultInferenceProgress = (): InferenceProgressState => ({
  phase: "idle",
  tokenCount: 0,
  estimatedMaxTokens: 256, // Default estimate
  tokensPerSecond: 0,
  warmupProgress: 0,
  elapsedMs: 0,
  estimatedRemainingMs: 0,
  streamPreview: "",
});

// ============================================================================
// INFERENCE PROGRESS BAR - Determinate progress indicator
// ============================================================================

interface InferenceProgressBarProps {
  progress: InferenceProgressState;
  "data-testid"?: string;
}

function InferenceProgressBar({ progress, "data-testid": testId }: InferenceProgressBarProps) {
  const { phase, tokenCount, estimatedMaxTokens, warmupProgress, tokensPerSecond, estimatedRemainingMs } = progress;

  // Calculate progress percentage
  const progressPercent = phase === "warmup"
    ? warmupProgress
    : phase === "generating" || phase === "complete"
    ? Math.min((tokenCount / estimatedMaxTokens) * 100, 100)
    : 0;

  // Format remaining time
  const formatRemainingTime = (ms: number): string => {
    if (ms <= 0) return "—";
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${minutes}m ${secs}s`;
  };

  // Get phase-specific colors and labels
  const getPhaseConfig = () => {
    switch (phase) {
      case "warmup":
        return {
          barColor: "bg-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-400",
          icon: <Flame className="w-3 h-3 text-amber-400 animate-pulse" />,
          label: "Warming up model...",
        };
      case "generating":
        return {
          barColor: "bg-cyan-500",
          bgColor: "bg-cyan-500/10",
          borderColor: "border-cyan-500/30",
          textColor: "text-cyan-400",
          icon: <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />,
          label: "Generating...",
        };
      case "complete":
        return {
          barColor: "bg-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400",
          icon: <CheckCircle className="w-3 h-3 text-emerald-400" />,
          label: "Complete",
        };
      case "error":
        return {
          barColor: "bg-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          textColor: "text-red-400",
          icon: <AlertTriangle className="w-3 h-3 text-red-400" />,
          label: "Error",
        };
      default:
        return {
          barColor: "bg-zinc-600",
          bgColor: "bg-zinc-800",
          borderColor: "border-zinc-700",
          textColor: "text-zinc-500",
          icon: <Play className="w-3 h-3 text-zinc-500" />,
          label: "Ready",
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <div className="space-y-2" data-testid={testId}>
      {/* Progress Bar */}
      <div className={`h-2 rounded-full ${config.bgColor} border ${config.borderColor} overflow-hidden`}>
        <motion.div
          className={`h-full ${config.barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          data-testid={testId ? `${testId}-bar` : undefined}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`micro ${config.textColor}`} data-testid={testId ? `${testId}-phase-label` : undefined}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-3 micro text-zinc-500">
          {phase === "generating" && (
            <>
              <span data-testid={testId ? `${testId}-tokens` : undefined}>
                {tokenCount} / ~{estimatedMaxTokens} tokens
              </span>
              {tokensPerSecond > 0 && (
                <span data-testid={testId ? `${testId}-speed` : undefined}>
                  {tokensPerSecond.toFixed(1)} tok/s
                </span>
              )}
              <span className={config.textColor} data-testid={testId ? `${testId}-remaining` : undefined}>
                {formatRemainingTime(estimatedRemainingMs)}
              </span>
            </>
          )}
          {phase === "warmup" && (
            <span data-testid={testId ? `${testId}-warmup-percent` : undefined}>
              {Math.round(warmupProgress)}% loaded
            </span>
          )}
          {phase === "complete" && (
            <span className="text-emerald-400" data-testid={testId ? `${testId}-complete-tokens` : undefined}>
              {tokenCount} tokens generated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STREAMING OUTPUT PREVIEW - Inline preview in the row
// ============================================================================

interface StreamingPreviewProps {
  output: string;
  isStreaming: boolean;
  maxLength?: number;
  "data-testid"?: string;
}

function StreamingPreview({ output, isStreaming, maxLength = 120, "data-testid": testId }: StreamingPreviewProps) {
  if (!output && !isStreaming) return null;

  const displayText = output.length > maxLength ? `...${output.slice(-maxLength)}` : output;

  return (
    <div
      className="mt-2 p-2 rounded-lg bg-black/40 border border-zinc-800/50 font-mono text-xs overflow-hidden"
      data-testid={testId}
    >
      <div className="flex items-start gap-2">
        <Server className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-emerald-400/90 whitespace-pre-wrap break-all line-clamp-2">
          {displayText}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// PENDING JOB ROW (non-glass) - Enhanced with progress indicators
// ============================================================================

interface PendingJobRowProps {
  jobView: WorkerJobView;
  onClaim: () => void;
  isProcessing: boolean;
  inferenceProgress?: InferenceProgressState;
  streamOutput?: string;
  isStreaming?: boolean;
  isWalletConnected?: boolean;
}

function PendingJobRow({
  jobView,
  onClaim,
  isProcessing,
  inferenceProgress,
  streamOutput = "",
  isStreaming = false,
  isWalletConnected = true,
}: PendingJobRowProps) {
  const model = getModelById(jobView.modelId);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use provided progress or default
  const progress = inferenceProgress || getDefaultInferenceProgress();

  // Determine if we're actively processing this job
  const isActivelyProcessing = isProcessing && progress.phase !== "idle";

  // Auto-expand when processing starts
  useEffect(() => {
    if (isActivelyProcessing && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isActivelyProcessing, isExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg bg-zinc-900/30 border transition-colors ${
        isActivelyProcessing
          ? "border-cyan-500/30 bg-zinc-900/50"
          : "border-zinc-800/50 hover:border-zinc-700"
      }`}
      data-testid={`pending-job-${jobView.id}`}
    >
      {/* Main Row */}
      <div className="flex items-center gap-4 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isActivelyProcessing ? (
              <span className="px-2 py-0.5 rounded-full micro bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Processing
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full micro bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Pending
              </span>
            )}
            <span className="micro text-zinc-500">{model?.displayName}</span>
            {/* Show queue duration from pipeline */}
            {!isActivelyProcessing && (
              <span className="micro text-zinc-600">
                • {formatDuration(jobView.queueDuration)} in queue
              </span>
            )}
          </div>
          <p className="body-default text-zinc-300 truncate">
            {jobView.prompt.slice(0, 60)}{jobView.prompt.length > 60 ? "..." : ""}
          </p>
          <div className="flex items-center gap-3 micro text-zinc-500 mt-1">
            <span>{formatRelativeTime(jobView.createdAt)}</span>
            {/* Use potentialEarnings from pipeline view */}
            <span className="text-emerald-400">{formatQubic(jobView.potentialEarnings)} QUBIC</span>
          </div>

          {/* Inline streaming preview when processing but not expanded */}
          {isActivelyProcessing && !isExpanded && streamOutput && (
            <StreamingPreview
              output={streamOutput}
              isStreaming={isStreaming}
              maxLength={80}
              data-testid={`pending-job-${jobView.id}-inline-preview`}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse button when processing */}
          {isActivelyProcessing && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              data-testid={`pending-job-${jobView.id}-expand-btn`}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Claim button */}
          <motion.button
            onClick={onClaim}
            disabled={isProcessing || !jobView.canClaim || !isWalletConnected}
            whileHover={{ scale: isWalletConnected ? 1.05 : 1 }}
            whileTap={{ scale: isWalletConnected ? 0.95 : 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg caption-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isWalletConnected
                ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
            data-testid={`claim-job-btn-${jobView.id}`}
            title={!isWalletConnected ? "Connect wallet to claim jobs" : undefined}
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : !isWalletConnected ? (
              <Wallet className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isActivelyProcessing ? "Processing..." : !isWalletConnected ? "Connect Wallet" : "Claim & Process"}
          </motion.button>
        </div>
      </div>

      {/* Expanded Progress Section */}
      <AnimatePresence>
        {isExpanded && isActivelyProcessing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-zinc-800/50 pt-3">
              {/* Progress Bar */}
              <InferenceProgressBar
                progress={progress}
                data-testid={`pending-job-${jobView.id}-progress`}
              />

              {/* Streaming Output Preview */}
              {streamOutput && (
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Server className="w-3 h-3 text-purple-400" />
                    <span className="micro text-zinc-500">Ollama Response</span>
                    {isStreaming && (
                      <span className="px-1.5 py-0.5 rounded micro bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="max-h-[100px] overflow-y-auto">
                    <p
                      className="text-emerald-400/90 whitespace-pre-wrap break-words"
                      data-testid={`pending-job-${jobView.id}-stream-output`}
                    >
                      {streamOutput}
                      {isStreaming && (
                        <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// CURRENT JOB PANEL (Glass - processing with Ollama) - Uses WorkerJobView
// ============================================================================

interface CurrentJobPanelProps {
  jobView: WorkerJobView;
  ollamaError?: OllamaError | null;
  onRetry?: () => void;
}

function CurrentJobPanel({ jobView, ollamaError, onRetry }: CurrentJobPanelProps) {
  const model = getModelById(jobView.modelId);
  const { output, isStreaming, tokenCount } = useInference();

  return (
    <OllamaErrorBoundary modelName={model?.displayName}>
      <GlassCard data-testid="current-job-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              ollamaError ? "bg-red-500/20" : "bg-cyan-500/20"
            }`}>
              {ollamaError ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="heading-tertiary text-white">
                {ollamaError ? "Inference Failed" : "Processing with Ollama"}
              </h3>
              <p className="caption text-zinc-500">{model?.displayName} • {model?.ollamaName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="body-medium text-emerald-400">
              {formatQubic(jobView.potentialEarnings)} QUBIC
            </p>
            {/* Show output progress from pipeline */}
            {!ollamaError && (
              <p className="micro text-zinc-500">
                {tokenCount} tokens • {Math.round(jobView.outputProgress)}% complete
              </p>
            )}
          </div>
        </div>

        {/* Ollama Error Display */}
        {ollamaError && (
          <div className="mb-4" data-testid="current-job-error">
            <OllamaErrorDisplay
              error={ollamaError}
              onRetry={onRetry}
              modelName={model?.ollamaName}
              data-testid="current-job-ollama-error"
            />
          </div>
        )}

        <div className="mb-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <p className="micro text-zinc-500 mb-1">Prompt</p>
          <p className="body-default text-zinc-300">{jobView.prompt}</p>
        </div>

        {!ollamaError && (output || isStreaming) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[10px] text-zinc-500">Ollama Response (Streaming)</p>
            </div>
            <div className="max-h-[200px] overflow-y-auto rounded-lg bg-black/50 p-3 border border-zinc-800 font-mono text-sm">
              <p className="text-emerald-400 whitespace-pre-wrap">
                {output}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                )}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </OllamaErrorBoundary>
  );
}

// AutoClaimToggle now uses LabeledToggle from shared

// ============================================================================
// REPUTATION PANEL
// ============================================================================

function ReputationPanel({ workerId }: { workerId: string }) {
  const { getReviewsByWorker, getAverageRating, getRatingDistribution } = useReviewStore();

  const reviews = getReviewsByWorker(workerId);
  const avgRating = getAverageRating(workerId);
  const distribution = getRatingDistribution(workerId);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-tertiary text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Your Reputation
        </h3>
        <ReputationBadge
          rating={avgRating}
          totalReviews={reviews.length}
          completionRate={100}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 rounded-xl bg-zinc-900/50">
          <p className="text-3xl font-bold text-white">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </p>
          <div className="flex justify-center mt-1">
            <StarRating rating={avgRating} size="sm" showValue={false} />
          </div>
          <p className="caption text-zinc-500 mt-1">Average Rating</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-zinc-900/50">
          <p className="text-3xl font-bold text-white">{reviews.length}</p>
          <p className="caption text-zinc-500 mt-1">Total Reviews</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        <h4 className="caption text-zinc-500 mb-2">Rating Breakdown</h4>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating] || 0;
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="caption text-zinc-400 w-6">{rating}★</span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
              <span className="caption text-zinc-500 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews Preview */}
      {reviews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <h4 className="caption text-zinc-500 mb-3 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Recent Feedback
          </h4>
          <div className="space-y-3">
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="p-3 rounded-lg bg-zinc-900/50">
                <div className="flex items-center justify-between mb-1">
                  <StarRating rating={review.rating} size="sm" showValue={false} />
                  <span className="micro text-zinc-500">
                    {formatRelativeTime(review.createdAt)}
                  </span>
                </div>
                <p className="caption text-zinc-400 line-clamp-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ============================================================================
// OLLAMA CONNECTION PANEL - Enhanced with error states
// ============================================================================

interface OllamaConnectionPanelProps {
  ollamaError: OllamaError | null;
  onCheckConnection?: () => void;
}

function OllamaConnectionPanel({ ollamaError, onCheckConnection }: OllamaConnectionPanelProps) {
  const hasError = ollamaError !== null;
  const isOffline = hasError && isConnectionError(ollamaError);

  return (
    <div
      className={`p-[var(--space-4)] rounded-xl bg-zinc-900/30 border ${
        hasError ? "border-red-500/30" : "border-zinc-800/50"
      }`}
      data-testid="ollama-connection-panel"
    >
      <h3 className="heading-tertiary text-zinc-400 mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
        <Server className="w-4 h-4" />
        Ollama Connection
      </h3>

      <div className="flex items-center justify-between py-2">
        <span className="caption text-zinc-500">Status</span>
        {hasError ? (
          <span className="flex items-center gap-1.5 caption text-red-400" data-testid="ollama-status-error">
            <AlertTriangle className="w-3 h-3" />
            {isOffline ? "Offline" : "Error"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 caption text-emerald-400" data-testid="ollama-status-connected">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="caption text-zinc-500">Endpoint</span>
        <span className="type-mono text-zinc-300">localhost:11434</span>
      </div>

      {/* Show error code if there's an error */}
      {hasError && (
        <div className="mt-2 pt-2 border-t border-zinc-800/50">
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 rounded type-mono-sm bg-red-500/10 text-red-400 border border-red-500/20"
              data-testid="ollama-error-code-badge"
            >
              {ollamaError.code}
            </span>
            {onCheckConnection && (
              <button
                onClick={onCheckConnection}
                className="micro text-cyan-400 hover:text-cyan-300 transition-colors"
                data-testid="ollama-retry-connection-btn"
              >
                Retry
              </button>
            )}
          </div>
          <p className="micro text-zinc-500 mt-1">{ollamaError.message}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CUSTOM HOOK: useInferenceProgress - Track detailed inference progress
// ============================================================================

function useInferenceProgress(currentJobId: string | null, isProcessing: boolean) {
  const { output, isStreaming, tokenCount } = useInference();
  const [progress, setProgress] = useState<InferenceProgressState>(getDefaultInferenceProgress());
  const startTimeRef = useRef<number | null>(null);
  const lastTokenCountRef = useRef(0);
  const tokenTimestampsRef = useRef<number[]>([]);

  // Estimate max tokens based on model (simplified for demo)
  const estimatedMaxTokens = 256;

  // Reset when job changes
  useEffect(() => {
    if (!currentJobId) {
      setProgress(getDefaultInferenceProgress());
      startTimeRef.current = null;
      lastTokenCountRef.current = 0;
      tokenTimestampsRef.current = [];
    }
  }, [currentJobId]);

  // Track inference progress
  useEffect(() => {
    if (!isProcessing || !currentJobId) return;

    const now = Date.now();

    // Initialize start time on first processing
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
      // Simulate warmup phase for the first ~1 second
      setProgress((prev) => ({
        ...prev,
        phase: "warmup",
        warmupProgress: 0,
      }));

      // Simulate warmup progress
      const warmupInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev.phase !== "warmup") {
            clearInterval(warmupInterval);
            return prev;
          }
          const newWarmup = Math.min(prev.warmupProgress + 15, 100);
          if (newWarmup >= 100) {
            clearInterval(warmupInterval);
            return { ...prev, phase: "generating", warmupProgress: 100 };
          }
          return { ...prev, warmupProgress: newWarmup };
        });
      }, 150);

      return () => clearInterval(warmupInterval);
    }

    // Track tokens per second
    if (tokenCount > lastTokenCountRef.current) {
      tokenTimestampsRef.current.push(now);
      // Keep last 10 token timestamps for speed calculation
      if (tokenTimestampsRef.current.length > 10) {
        tokenTimestampsRef.current.shift();
      }
    }
    lastTokenCountRef.current = tokenCount;

    // Calculate tokens per second
    let tokensPerSecond = 0;
    if (tokenTimestampsRef.current.length >= 2) {
      const firstTimestamp = tokenTimestampsRef.current[0];
      const lastTimestamp = tokenTimestampsRef.current[tokenTimestampsRef.current.length - 1];
      const timeSpanSec = (lastTimestamp - firstTimestamp) / 1000;
      if (timeSpanSec > 0) {
        tokensPerSecond = tokenTimestampsRef.current.length / timeSpanSec;
      }
    }

    // Calculate estimated remaining time
    const remainingTokens = Math.max(0, estimatedMaxTokens - tokenCount);
    const estimatedRemainingMs = tokensPerSecond > 0
      ? (remainingTokens / tokensPerSecond) * 1000
      : 0;

    const elapsedMs = now - startTimeRef.current;

    setProgress((prev) => ({
      ...prev,
      phase: isStreaming ? "generating" : tokenCount > 0 ? "complete" : prev.phase,
      tokenCount,
      estimatedMaxTokens,
      tokensPerSecond,
      elapsedMs,
      estimatedRemainingMs,
      streamPreview: output.slice(-200), // Keep last 200 chars for preview
    }));
  }, [isProcessing, currentJobId, tokenCount, isStreaming, output, estimatedMaxTokens]);

  return {
    progress,
    output,
    isStreaming,
    tokenCount,
  };
}

// ============================================================================
// WALLET DISCONNECTED WARNING - Inline banner for wallet state
// ============================================================================

interface WalletDisconnectedWarningProps {
  onConnect: () => void;
}

function WalletDisconnectedWarning({ onConnect }: WalletDisconnectedWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-[var(--space-4)] rounded-xl bg-amber-500/10 border border-amber-500/30"
      data-testid="wallet-disconnected-warning"
    >
      <div className="flex items-center gap-[var(--space-3)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20">
          <Wallet className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-400">Wallet Disconnected</h3>
          <p className="caption text-zinc-400">
            Connect your wallet to claim jobs and receive payments
          </p>
        </div>
      </div>
      <motion.button
        onClick={onConnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors"
        data-testid="wallet-connect-btn"
      >
        <Wallet className="w-4 h-4" />
        Connect
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// WORKER MANAGEMENT CONTENT - Uses JobPipeline abstraction
// ============================================================================

function WorkerManagement() {
  const {
    worker,
    isAutoClaimEnabled,
    pendingJobs,
    currentJob,
    isProcessing,
    initializeWorker,
    goOnline,
    goOffline,
    toggleAutoClaim,
    claimJob,
  } = useWorker();

  // Get wallet connection state
  const { wallet, connect: connectWallet } = useWalletStore();

  // Use the unified JobPipeline abstraction for worker-specific views
  const {
    state: pipelineState,
    isOnline,
    availableJobs,
    currentJob: pipelineCurrentJob,
  } = useWorkerPipeline();

  // Track inference progress for the current job
  const {
    progress: inferenceProgress,
    output: streamOutput,
    isStreaming,
  } = useInferenceProgress(currentJob?.id || null, isProcessing);

  // Track which job is actively being processed
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [ollamaError, setOllamaError] = useState<OllamaError | null>(null);
  const [lastFailedJobId, setLastFailedJobId] = useState<string | null>(null);

  // Track initialization state to prevent re-render issues on first switch
  const hasInitializedRef = useRef(false);

  // Initialize worker once on mount. The initializeWorker function is stable
  // (memoized via useCallback in useWorker hook), but we explicitly use an empty
  // dependency array to ensure single initialization and prevent any potential
  // infinite loop if upstream dependencies change.
  useEffect(() => {
    // Only initialize if we haven't already and worker is not present
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeWorker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force re-initialization if worker becomes null after initial mount
  // This handles the case where switching tabs causes hydration issues
  useEffect(() => {
    if (hasInitializedRef.current && !worker) {
      initializeWorker();
    }
  }, [worker, initializeWorker]);

  // Track which job is being processed
  useEffect(() => {
    if (isProcessing && currentJob?.id) {
      setProcessingJobId(currentJob.id);
    } else if (!isProcessing) {
      setProcessingJobId(null);
    }
  }, [isProcessing, currentJob?.id]);

  // Monitor current job for failures and parse errors
  useEffect(() => {
    if (currentJob?.status === "failed" && currentJob.error) {
      const parsedError = parseOllamaError(currentJob.error);
      setOllamaError(parsedError);
      setLastFailedJobId(currentJob.id);
    }
  }, [currentJob?.status, currentJob?.error, currentJob?.id]);

  // Clear error when a new job starts successfully
  useEffect(() => {
    if (currentJob?.status === "streaming" || currentJob?.status === "complete") {
      setOllamaError(null);
      setLastFailedJobId(null);
    }
  }, [currentJob?.status]);

  const handleToggleStatus = () => {
    if (worker?.status === "offline") {
      goOnline();
    } else {
      goOffline();
    }
  };

  const handleClaimJob = async (jobId: string) => {
    // Check wallet connection before claiming - prevents escrowing issues
    if (!wallet.isConnected) {
      // Show wallet disconnected state - user needs to reconnect
      console.warn("Cannot claim job: Wallet is disconnected");
      return;
    }

    // Clear previous error state
    setOllamaError(null);
    // This will claim the job AND process it with Ollama
    await claimJob(jobId);
  };

  const handleRetryJob = async () => {
    if (lastFailedJobId) {
      setOllamaError(null);
      await claimJob(lastFailedJobId);
    }
  };

  const handleCheckOllamaConnection = () => {
    // Attempt to clear error and check connection by going offline/online
    setOllamaError(null);
    // In production, this would ping the Ollama API
  };

  if (!worker) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="worker-loading">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      {/* Wallet Disconnected Warning */}
      <AnimatePresence>
        {!wallet.isConnected && (
          <WalletDisconnectedWarning onConnect={connectWallet} />
        )}
      </AnimatePresence>

      {/* Flow Diagram - Educational */}
      <WorkerFlowDiagram />

      {/* Status Toggle */}
      <WorkerStatusToggle
        status={worker.status}
        onToggle={handleToggleStatus}
      />

      {/* Current Job - Glass Card (processing with Ollama) - Uses pipeline view */}
      {pipelineCurrentJob && (
        <CurrentJobPanel
          jobView={pipelineCurrentJob}
          ollamaError={ollamaError}
          onRetry={handleRetryJob}
        />
      )}

      {/* Show error notification if no current job but last job failed */}
      {!pipelineCurrentJob && ollamaError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          data-testid="ollama-error-notification"
        >
          <OllamaErrorDisplay
            error={ollamaError}
            onRetry={handleRetryJob}
            onDismiss={() => setOllamaError(null)}
            compact
          />
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
        {/* Pending Jobs - Glass Card (larger) - Uses pipeline's availableJobs */}
        <div className="lg:col-span-2" data-testid="available-jobs-section">
          <GlassCard>
            <div className="flex items-center justify-between mb-[var(--space-4)]">
              <h3 className="heading-tertiary text-white flex items-center gap-[var(--space-2)]">
                <Activity className="w-4 h-4 text-amber-400" />
                Available Jobs
                {availableJobs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full micro bg-amber-400/10 text-amber-400">
                    {availableJobs.length}
                  </span>
                )}
              </h3>
              <LabeledToggle
                icon={Zap}
                label="Auto-claim"
                description="Auto claim & process jobs"
                enabled={isAutoClaimEnabled}
                onToggle={toggleAutoClaim}
                data-testid="auto-claim-toggle"
              />
            </div>

            {worker.status === "offline" ? (
              <EmptyStateIllustration
                variant="sleeping"
                title="Worker is offline"
                description="Your node is resting peacefully. Go online to start earning QUBIC by processing inference requests from the network."
                ctaLabel="Go Online"
                ctaIcon={Power}
                onCtaClick={handleToggleStatus}
                data-testid="worker-offline-message"
              />
            ) : availableJobs.length === 0 ? (
              <EmptyStateIllustration
                variant="radar"
                title="No jobs in queue"
                description="Scanning the network for available jobs. When requesters submit inference tasks, they'll appear here for you to claim and process."
                data-testid="no-jobs-message"
              />
            ) : (
              <div className="space-y-2" data-testid="pending-jobs-list">
                <AnimatePresence>
                  {/* Use pipeline's availableJobs with WorkerJobView */}
                  {availableJobs.slice(0, 5).map((jobView) => {
                    const isThisJobProcessing = processingJobId === jobView.id;
                    return (
                      <PendingJobRow
                        key={jobView.id}
                        jobView={jobView}
                        onClaim={() => handleClaimJob(jobView.id)}
                        isProcessing={isProcessing}
                        inferenceProgress={isThisJobProcessing ? inferenceProgress : undefined}
                        streamOutput={isThisJobProcessing ? streamOutput : undefined}
                        isStreaming={isThisJobProcessing ? isStreaming : false}
                        isWalletConnected={wallet.isConnected}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Settings Panel */}
        <div className="space-y-[var(--space-4)]">
          {/* Hardware */}
          <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="heading-tertiary text-zinc-400 mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
              <HardDrive className="w-4 h-4" />
              Hardware
            </h3>
            <div className="divide-y divide-zinc-800/50">
              <InfoRow icon={Cpu} label="GPU" value={worker.hardware.gpu} color="text-blue-400" data-testid="hardware-gpu" />
              <InfoRow icon={HardDrive} label="VRAM" value={`${worker.hardware.vram} GB`} color="text-purple-400" data-testid="hardware-vram" />
              <InfoRow icon={Activity} label="CPU" value={worker.hardware.cpu} color="text-emerald-400" data-testid="hardware-cpu" />
              <InfoRow icon={HardDrive} label="RAM" value={`${worker.hardware.ram} GB`} color="text-amber-400" data-testid="hardware-ram" />
            </div>
          </div>

          {/* Ollama Connection - Enhanced with error states */}
          <OllamaConnectionPanel
            ollamaError={ollamaError}
            onCheckConnection={handleCheckOllamaConnection}
          />

          {/* Supported Models */}
          <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="heading-tertiary text-zinc-400 mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
              <Cpu className="w-4 h-4" />
              Accept Models
            </h3>
            <div className="space-y-[var(--space-2)]">
              {worker.supportedModels.map((modelId) => {
                const model = getModelById(modelId);
                return (
                  <div key={modelId} className="flex items-center justify-between py-[var(--space-2)]">
                    <span className="body-default text-zinc-300">{model?.displayName || modelId}</span>
                    <span className="caption text-emerald-400">Ready</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reputation Panel */}
      <ReputationPanel workerId={worker.id} />
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD WITH TABS
// ============================================================================

export function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState<WorkerTab>("manage");

  return (
    <div className="space-y-[var(--space-6)]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-primary text-white flex items-center gap-[var(--space-3)]">
            <Network className="w-6 h-6 text-cyan-400" />
            Worker
          </h1>
          <p className="text-zinc-500 body-default mt-1">
            {activeTab === "manage"
              ? "Claim jobs, process with Ollama, and earn QUBIC"
              : "Register a new worker node on the network"
            }
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <WorkerTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "manage" ? <WorkerManagement /> : <WorkerOnboarding />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
