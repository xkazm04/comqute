"use client";

import { useEffect, useState, useRef } from "react";
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
} from "../shared";
import type { OllamaError } from "../shared";
import { WorkerFlowDiagram } from "./FlowDiagram";
import { WorkerOnboarding } from "./WorkerOnboarding";
import { StarRating, ReputationBadge } from "./WorkerProfile";
import { useWorker } from "@/hooks";
import { useInference } from "@/hooks";
import { useReviewStore } from "@/stores";
import { formatQubic, formatDuration, formatRelativeTime } from "@/lib/mock-utils";
import { getModelById } from "@/lib/models";
import { useWorkerPipeline } from "../lib/job-pipeline";
import type { WorkerJobView } from "../lib/job-pipeline";
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
        ease: "easeOut",
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
// PENDING JOB ROW (non-glass) - Uses WorkerJobView from pipeline
// ============================================================================

function PendingJobRow({
  jobView,
  onClaim,
  isProcessing,
}: {
  jobView: WorkerJobView;
  onClaim: () => void;
  isProcessing: boolean;
}) {
  const model = getModelById(jobView.modelId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
      data-testid={`pending-job-${jobView.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full micro bg-amber-400/10 text-amber-400 border border-amber-400/20">
            Pending
          </span>
          <span className="micro text-zinc-500">{model?.displayName}</span>
          {/* Show queue duration from pipeline */}
          <span className="micro text-zinc-600">
            • {formatDuration(jobView.queueDuration)} in queue
          </span>
        </div>
        <p className="body-default text-zinc-300 truncate">
          {jobView.prompt.slice(0, 60)}{jobView.prompt.length > 60 ? "..." : ""}
        </p>
        <div className="flex items-center gap-3 micro text-zinc-500 mt-1">
          <span>{formatRelativeTime(jobView.createdAt)}</span>
          {/* Use potentialEarnings from pipeline view */}
          <span className="text-emerald-400">{formatQubic(jobView.potentialEarnings)} QUBIC</span>
        </div>
      </div>

      <motion.button
        onClick={onClaim}
        disabled={isProcessing || !jobView.canClaim}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white caption-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid={`claim-job-btn-${jobView.id}`}
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
        Claim & Process
      </motion.button>
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

  // Use the unified JobPipeline abstraction for worker-specific views
  const {
    state: pipelineState,
    isOnline,
    availableJobs,
    currentJob: pipelineCurrentJob,
  } = useWorkerPipeline();

  const [showSettings, setShowSettings] = useState(false);
  const [ollamaError, setOllamaError] = useState<OllamaError | null>(null);
  const [lastFailedJobId, setLastFailedJobId] = useState<string | null>(null);

  useEffect(() => {
    initializeWorker();
  }, [initializeWorker]);

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
      {/* Flow Diagram - Educational */}
      <WorkerFlowDiagram />

      {/* Status Toggle */}
      <WorkerStatusToggle
        status={worker.status}
        onToggle={handleToggleStatus}
      />

      {/* Stats Row - Enhanced with Upwork-like metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-[var(--space-3)]">
        <StatItem
          icon={Star}
          label="Rating"
          value={worker.stats.avgRating > 0 ? worker.stats.avgRating.toFixed(1) : "—"}
          subValue={`${worker.stats.totalReviews} reviews`}
          color="bg-amber-500/20"
          data-testid="stat-rating"
        />
        <StatItem
          icon={CheckCircle}
          label="Completion Rate"
          value={`${worker.stats.completionRate}%`}
          color="bg-emerald-500/20"
          data-testid="stat-completion-rate"
        />
        <StatItem
          icon={Clock}
          label="Avg Response"
          value={worker.stats.avgResponseTime > 0 ? formatDuration(worker.stats.avgResponseTime) : "—"}
          color="bg-blue-500/20"
          data-testid="stat-avg-response"
        />
        <StatItem
          icon={Users}
          label="Repeat Clients"
          value={worker.stats.repeatClients}
          color="bg-purple-500/20"
          data-testid="stat-repeat-clients"
        />
        <StatItem
          icon={Coins}
          label="Total Earnings"
          value={formatQubic(worker.stats.totalEarnings)}
          subValue={`${worker.stats.jobsCompleted} jobs`}
          color="bg-cyan-500/20"
          data-testid="stat-total-earnings"
        />
      </div>

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
                  {availableJobs.slice(0, 5).map((jobView) => (
                    <PendingJobRow
                      key={jobView.id}
                      jobView={jobView}
                      onClaim={() => handleClaimJob(jobView.id)}
                      isProcessing={isProcessing}
                    />
                  ))}
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
