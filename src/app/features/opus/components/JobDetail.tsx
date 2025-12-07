"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Coins,
  Cpu,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Zap,
  User,
  Server,
} from "lucide-react";
import { GlassCard } from "./Layout";
import { useJobStore } from "@/stores";
import { useInference } from "@/hooks";
import { getModelById } from "@/lib/models";
import { formatQubic, formatDuration, formatDate, formatAddress } from "@/lib/mock-utils";
import { formatCost, getPriceBreakdown } from "@/lib/pricing";
import type { Job, JobStatus } from "@/types";

// ============================================================================
// STATUS STEPS
// ============================================================================

const statusSteps: { status: JobStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "assigned", label: "Assigned" },
  { status: "running", label: "Running" },
  { status: "streaming", label: "Streaming" },
  { status: "complete", label: "Complete" },
];

function StatusProgress({ currentStatus }: { currentStatus: JobStatus }) {
  const currentIndex = statusSteps.findIndex((s) => s.status === currentStatus);
  const isFailed = currentStatus === "failed";
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="flex items-center justify-between">
      {statusSteps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={step.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${isComplete ? "bg-emerald-500 text-white" : ""}
                  ${isCurrent && !isFailed && !isCancelled ? "bg-cyan-500 text-white" : ""}
                  ${isCurrent && isFailed ? "bg-red-500 text-white" : ""}
                  ${isCurrent && isCancelled ? "bg-zinc-500 text-white" : ""}
                  ${isPending ? "bg-zinc-800 text-zinc-500" : ""}
                `}
              >
                {isComplete && <CheckCircle className="w-4 h-4" />}
                {isCurrent && !isFailed && !isCancelled && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isCurrent && (isFailed || isCancelled) && <XCircle className="w-4 h-4" />}
                {isPending && <span>{i + 1}</span>}
              </div>
              <span className={`text-[10px] mt-1.5 ${isCurrent ? "text-white" : "text-zinc-500"}`}>
                {step.label}
              </span>
            </div>

            {i < statusSteps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5">
                <div
                  className={`h-full ${i < currentIndex ? "bg-emerald-500" : "bg-zinc-800"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// INFO ROW (non-glass)
// ============================================================================

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor = "text-zinc-300",
}: {
  icon: typeof Clock;
  label: string;
  value: string | React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-xs font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}

// ============================================================================
// COPY BUTTON
// ============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-zinc-500" />
      )}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function JobDetail({ jobId }: { jobId: string }) {
  const { getJob } = useJobStore();
  const job = getJob(jobId);
  const { output, isStreaming, tokenCount } = useInference();

  const [, setTick] = useState(0);
  useEffect(() => {
    if (job && !["complete", "failed", "cancelled"].includes(job.status)) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [job?.status]);

  if (!job) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-zinc-500 mb-6">The job you're looking for doesn't exist.</p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const model = getModelById(job.modelId);
  const isActive = ["pending", "assigned", "running", "streaming"].includes(job.status);
  const displayOutput = isActive ? output : job.output;
  const displayTokens = isActive ? tokenCount : job.outputTokens;

  const priceBreakdown = job.outputTokens > 0 || job.actualCost
    ? getPriceBreakdown(job.modelId, job.inputTokens, job.outputTokens)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="p-2 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">Job Details</h1>
          <p className="text-xs text-zinc-500 font-mono">ID: {job.id}</p>
        </div>
      </div>

      {/* Status Progress */}
      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <StatusProgress currentStatus={job.status} />
      </div>

      {/* Main Content - Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Prompt & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt */}
          <GlassCard>
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Prompt
            </h3>
            <p className="text-zinc-300 whitespace-pre-wrap text-sm">{job.prompt}</p>
            {job.systemPrompt && (
              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 mb-1">System Prompt</p>
                <p className="text-xs text-zinc-400">{job.systemPrompt}</p>
              </div>
            )}
          </GlassCard>

          {/* Response */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Response
              </h3>
              {displayTokens > 0 && (
                <span className="text-[10px] text-zinc-500">{displayTokens} tokens</span>
              )}
            </div>

            {displayOutput ? (
              <div className="relative">
                <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {displayOutput}
                  {isStreaming && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-cyan-400 ml-0.5"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>
                {!isActive && displayOutput && (
                  <div className="absolute top-0 right-0">
                    <CopyButton text={displayOutput} />
                  </div>
                )}
              </div>
            ) : isActive ? (
              <div className="flex items-center gap-2 text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Waiting for response...</span>
              </div>
            ) : (
              <p className="text-zinc-500 italic text-sm">No response generated</p>
            )}
          </GlassCard>

          {/* Error */}
          {job.error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-1">Error</h3>
                  <p className="text-xs text-zinc-400">{job.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Job Information</h3>
            <InfoRow icon={Cpu} label="Model" value={model?.displayName || job.modelId} />
            <InfoRow icon={Clock} label="Created" value={formatDate(job.createdAt)} />
            {job.completedAt && (
              <InfoRow
                icon={Clock}
                label="Duration"
                value={formatDuration(job.completedAt - job.createdAt)}
              />
            )}
            <InfoRow icon={User} label="Requester" value={formatAddress(job.requester)} />
            {job.assignedWorker && (
              <InfoRow icon={Server} label="Worker" value={formatAddress(job.assignedWorker)} />
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Cost
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Input ({job.inputTokens} tokens)</span>
                <span className="text-zinc-400">
                  {priceBreakdown ? formatQubic(priceBreakdown.inputCost) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Output ({job.outputTokens} tokens)</span>
                <span className="text-zinc-400">
                  {priceBreakdown ? formatQubic(priceBreakdown.outputCost) : "—"}
                </span>
              </div>
              <div className="h-px bg-zinc-800 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 font-medium">Total</span>
                <span className="text-sm text-emerald-400 font-semibold">
                  {job.actualCost ? formatCost(job.actualCost) : formatCost(job.estimatedCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction */}
          {job.status === "complete" && (
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Transaction
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-cyan-400 font-mono truncate flex-1">
                      {job.mockTxHash}
                    </code>
                    <CopyButton text={job.mockTxHash} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Block</span>
                  <span className="text-zinc-300 font-mono">{job.mockBlockNumber.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
