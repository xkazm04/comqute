"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Settings,
  HardDrive,
  Gauge,
  Coins,
  FileCheck,
  CheckCircle,
  Loader2,
  ChevronRight,
  Terminal,
  Cpu,
  Wallet,
  Shield,
  Zap,
  Server,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  PlayCircle,
  X,
} from "lucide-react";
import { GlassCard } from "../opus/components/Layout";
import { SUPPORTED_MODELS } from "@/lib/models";
import { useOnboardingPersistence, type OnboardingPersistedState } from "../opus/lib/useOnboardingPersistence";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents the current state of an onboarding step in the wizard.
 *
 * Step lifecycle transitions:
 * - `pending` → Initial state for steps not yet reached
 * - `active` → The step currently being displayed to the user
 * - `running` → Step action is in progress (e.g., installation running)
 * - `complete` → Step has been successfully finished
 * - `error` → Step encountered an error (requires retry or intervention)
 *
 * Only one step should be `active` at any given time. When a step completes,
 * it transitions to `complete` and the next step becomes `active`.
 */
type StepStatus = "pending" | "active" | "running" | "complete" | "error";

/**
 * Defines the structure for each onboarding step in the worker setup wizard.
 *
 * Each step represents a discrete phase of worker node configuration:
 * 1. Install - Download and install worker software components
 * 2. Configure - Set wallet address and select supported models
 * 3. Download - Fetch LLM model weights from IPFS/HuggingFace
 * 4. Benchmark - Run hardware performance tests
 * 5. Stake - Lock QUBIC tokens as collateral
 * 6. Register - Submit worker capabilities to the blockchain
 *
 * @property id - Unique identifier used for step switching in renderStepContent()
 * @property title - Short label displayed in the StepIndicator component
 * @property description - Brief explanation shown in the step indicator tooltip
 * @property icon - Lucide icon component displayed in the step circle
 * @property status - Current state of the step (see StepStatus for lifecycle)
 */
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Download;
  status: StepStatus;
}

// ============================================================================
// STEP PROGRESS INDICATOR
// ============================================================================

/**
 * Visual progress indicator showing all onboarding steps.
 *
 * Displays a horizontal stepper with icons, labels, and connecting lines.
 * Active steps pulse with animation, completed steps show checkmarks,
 * and running steps display a loading spinner.
 *
 * @param steps - Array of OnboardingStep objects defining the wizard flow
 * @param currentStep - Zero-based index of the currently active step
 */
function StepIndicator({ steps, currentStep }: { steps: OnboardingStep[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-[var(--space-8)]">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isComplete = step.status === "complete";
        const isPending = step.status === "pending";

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isComplete
                    ? "bg-emerald-500 border-emerald-500"
                    : isActive
                      ? "bg-cyan-500/20 border-cyan-500"
                      : "bg-zinc-900 border-zinc-700"
                  }
                `}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : step.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                )}
              </motion.div>
              <span className={`micro mt-2 ${isActive ? "text-cyan-400" : isPending ? "text-zinc-600" : "text-zinc-400"}`}>
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 relative">
                <div className="absolute inset-0 bg-zinc-800" />
                {isComplete && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// TERMINAL OUTPUT COMPONENT
// ============================================================================

/**
 * Simulated terminal output display for installation progress.
 *
 * Renders output lines with color-coding based on prefixes:
 * - `$` (green): Command being executed
 * - `✓` (green): Success message
 * - `!` (amber): Warning message
 * - `✗` (red): Error message
 * - Other (gray): Standard output
 *
 * @param lines - Array of terminal output strings to display
 * @param isRunning - Whether to show a blinking cursor at the end
 */
function TerminalOutput({ lines, isRunning }: { lines: string[]; isRunning: boolean }) {
  return (
    <div className="bg-black/80 rounded-lg border border-zinc-800 p-4 font-mono text-xs max-h-[200px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        <span className="text-zinc-500 ml-2">terminal</span>
      </div>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`
            ${line.startsWith("$") ? "text-emerald-400" : ""}
            ${line.startsWith("✓") ? "text-emerald-400" : ""}
            ${line.startsWith("!") ? "text-amber-400" : ""}
            ${line.startsWith("✗") ? "text-red-400" : ""}
            ${!line.startsWith("$") && !line.startsWith("✓") && !line.startsWith("!") && !line.startsWith("✗") ? "text-zinc-400" : ""}
          `}
        >
          {line}
        </motion.div>
      ))}
      {isRunning && (
        <motion.span
          className="inline-block w-2 h-4 bg-emerald-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// ============================================================================
// STEP 1: INSTALL
// ============================================================================

/**
 * Step 1: Install Worker Software
 *
 * Downloads and installs the Qubic Compute Node components required for
 * running inference jobs on the network.
 *
 * **Components Installed:**
 * - qubic-worker: Main daemon process
 * - model-manager: LLM weights management
 * - inference-runtime: vLLM wrapper for model execution
 * - health-monitor: Status reporting to the network
 *
 * **Completion Criteria:**
 * - All components successfully downloaded
 * - Dependencies verified (CUDA drivers, Docker, Qubic wallet)
 * - Installation script completes without errors
 *
 * **Behavior:**
 * 1. User clicks "Start Installation" button
 * 2. Terminal output simulates installation progress
 * 3. Progress bar updates as steps complete
 * 4. On success, `onComplete()` is called after 500ms delay
 *
 * @param onComplete - Callback invoked when installation succeeds.
 *   Triggers transition to the next step (Configure) via the parent's
 *   `completeStep()` function which updates step statuses.
 */
function InstallStep({ onComplete }: { onComplete: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runInstall = async () => {
    setIsRunning(true);
    setLines([]);

    // Fast delays for demo
    const steps = [
      { text: "$ curl -sSL https://compute.qubic.org/install.sh | bash", delay: 200 },
      { text: "", delay: 50 },
      { text: "Downloading Qubic Compute Node...", delay: 150 },
      { text: "Installing qubic-worker daemon...", delay: 100 },
      { text: "Installing model-manager...", delay: 100 },
      { text: "Installing inference-runtime (vLLM)...", delay: 100 },
      { text: "Installing health-monitor...", delay: 100 },
      { text: "", delay: 50 },
      { text: "Checking dependencies...", delay: 100 },
      { text: "✓ CUDA drivers: 12.2 detected", delay: 80 },
      { text: "✓ Docker: 24.0.6 detected", delay: 80 },
      { text: "✓ Qubic wallet: configured", delay: 80 },
      { text: "", delay: 50 },
      { text: "✓ Installation complete!", delay: 0 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, steps[i].delay));
      if (!mountedRef.current) return;
      setLines((prev) => [...prev, steps[i].text]);
      setProgress(Math.floor(((i + 1) / steps.length) * 100));
    }

    if (!mountedRef.current) return;
    setIsRunning(false);
    setTimeout(() => {
      if (mountedRef.current) {
        onComplete();
      }
    }, 500);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Install Worker Software</h3>
          <p className="body-default text-zinc-400 mt-1">
            Download and install the Qubic Compute Node components including the worker daemon,
            model manager, and inference runtime.
          </p>
        </div>
      </div>

      <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-[var(--space-3)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="caption text-zinc-500">Components to install:</span>
        </div>
        <div className="grid grid-cols-2 gap-[var(--space-2)]">
          {[
            { name: "qubic-worker", desc: "Main daemon" },
            { name: "model-manager", desc: "LLM weights" },
            { name: "inference-runtime", desc: "vLLM wrapper" },
            { name: "health-monitor", desc: "Status reporting" },
          ].map((comp) => (
            <div key={comp.name} className="flex items-center gap-[var(--space-2)] p-[var(--space-2)] rounded-lg bg-zinc-800/50">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <span className="caption text-zinc-300">{comp.name}</span>
                <span className="micro text-zinc-500 ml-2">{comp.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lines.length > 0 && <TerminalOutput lines={lines} isRunning={isRunning} />}

      {isRunning && (
        <div className="space-y-[var(--space-2)]">
          <div className="flex justify-between caption text-zinc-500">
            <span>Installing...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {!isRunning && lines.length === 0 && (
        <motion.button
          onClick={runInstall}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-install-btn"
        >
          <Download className="w-4 h-4" />
          Start Installation
        </motion.button>
      )}
    </div>
  );
}

// ============================================================================
// STEP 2: CONFIGURE
// ============================================================================

/**
 * Step 2: Configure Worker
 *
 * Allows the user to set their wallet address for receiving payments and
 * select which LLM models they want to support on their worker node.
 *
 * **Required Configuration:**
 * - Qubic wallet address (for receiving QUBIC payments)
 * - At least one supported model selected
 *
 * **Completion Criteria:**
 * - Wallet address is at least 10 characters long
 * - At least one model is selected from the available list
 *
 * **Validation:**
 * - The "Save Configuration" button is disabled until both criteria are met
 * - No async operations; completion is immediate upon button click
 *
 * **Behavior:**
 * 1. User enters wallet address in input field
 * 2. User toggles model selection (at least one required)
 * 3. Button enables when validation passes
 * 4. On click, `onComplete()` is called immediately
 *
 * @param onComplete - Callback invoked when configuration is saved.
 *   Triggers transition to the next step (Download Models).
 * @param initialWalletAddress - Pre-filled wallet address from persisted state
 * @param initialSelectedModels - Pre-selected models from persisted state
 * @param onConfigChange - Callback for persisting form changes
 */
interface ConfigureStepProps {
  onComplete: () => void;
  initialWalletAddress?: string;
  initialSelectedModels?: string[];
  onConfigChange?: (walletAddress: string, selectedModels: string[]) => void;
}

function ConfigureStep({
  onComplete,
  initialWalletAddress = "",
  initialSelectedModels,
  onConfigChange
}: ConfigureStepProps) {
  const [walletAddress, setWalletAddress] = useState(initialWalletAddress);
  const [selectedModels, setSelectedModels] = useState<string[]>(
    initialSelectedModels ?? [SUPPORTED_MODELS[0].id]
  );

  // Persist config changes
  useEffect(() => {
    onConfigChange?.(walletAddress, selectedModels);
  }, [walletAddress, selectedModels, onConfigChange]);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  };

  const canContinue = walletAddress.length > 10 && selectedModels.length > 0;

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Settings className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Configure Worker</h3>
          <p className="body-default text-zinc-400 mt-1">
            Set your wallet address for receiving payments and choose which models to support.
          </p>
        </div>
      </div>

      <div className="space-y-[var(--space-4)]">
        {/* Wallet Address */}
        <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="flex items-center gap-[var(--space-2)] body-default text-zinc-400 mb-[var(--space-2)]">
            <Wallet className="w-4 h-4" />
            Qubic Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="QUBIC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
            data-testid="onboarding-wallet-input"
          />
        </div>

        {/* Model Selection */}
        <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="flex items-center gap-[var(--space-2)] body-default text-zinc-400 mb-[var(--space-3)]">
            <Server className="w-4 h-4" />
            Models to Support
          </label>
          <div className="space-y-[var(--space-2)]">
            {SUPPORTED_MODELS.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  className={`
                    w-full flex items-center justify-between p-[var(--space-3)] rounded-lg transition-all
                    ${isSelected
                      ? "bg-cyan-500/10 border border-cyan-500/30"
                      : "bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600"
                    }
                  `}
                >
                  <div className="flex items-center gap-[var(--space-3)]">
                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-600"}`} />
                    <div className="text-left">
                      <span className={`body-default ${isSelected ? "text-cyan-400" : "text-zinc-300"}`}>
                        {model.displayName}
                      </span>
                      <span className="micro text-zinc-500 ml-2">{model.description}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.button
        onClick={onComplete}
        disabled={!canContinue}
        whileHover={{ scale: canContinue ? 1.02 : 1 }}
        whileTap={{ scale: canContinue ? 0.98 : 1 }}
        className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2"
        data-testid="onboarding-configure-save-btn"
      >
        Save Configuration
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

// ============================================================================
// STEP 3: DOWNLOAD MODELS
// ============================================================================

/**
 * Step 3: Download Models
 *
 * Fetches LLM model weights from IPFS/HuggingFace and verifies their
 * integrity via SHA256 hash comparison.
 *
 * **Download Process:**
 * - Downloads weights for the first 2 models from SUPPORTED_MODELS
 * - Shows individual progress bars per model
 * - Verifies hash after each download completes
 *
 * **Completion Criteria:**
 * - All model downloads reach 100% progress
 * - All model hashes verified successfully
 * - Status shows "Complete" for all models
 *
 * **Behavior:**
 * 1. User clicks "Download Models" button
 * 2. Models download sequentially with progress updates
 * 3. Each model shows "Downloading..." → "Verifying hash..." → "Complete"
 * 4. On all complete, `onComplete()` is called after 300ms delay
 *
 * **State Management:**
 * - `downloads` tracks progress and status per model ID
 * - `isRunning` prevents multiple concurrent download sessions
 *
 * @param onComplete - Callback invoked when all downloads succeed.
 *   Triggers transition to the next step (Benchmark).
 */
function DownloadModelsStep({ onComplete }: { onComplete: () => void }) {
  const [downloads, setDownloads] = useState<Record<string, { progress: number; status: string }>>({});
  const [isRunning, setIsRunning] = useState(false);
  const mountedRef = useRef(true);
  const completedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runDownload = useCallback(async () => {
    if (completedRef.current) return; // Prevent re-running after completion
    setIsRunning(true);

    const modelsToDownload = SUPPORTED_MODELS.slice(0, 2);

    for (const model of modelsToDownload) {
      if (!mountedRef.current) return;
      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 0, status: "Downloading..." } }));

      // Very fast simulation for demo - auto-complete without pause opportunity
      // Using requestAnimationFrame-based progress for smoother updates
      for (let p = 0; p <= 100; p += 25) {
        await new Promise((r) => setTimeout(r, 40)); // 40ms between updates
        if (!mountedRef.current) return;
        setDownloads((prev) => ({ ...prev, [model.id]: { progress: p, status: "Downloading..." } }));
      }

      if (!mountedRef.current) return;
      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 100, status: "Verifying hash..." } }));
      await new Promise((r) => setTimeout(r, 100)); // Quick hash verification
      if (!mountedRef.current) return;
      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 100, status: "Complete" } }));
    }

    if (!mountedRef.current) return;
    setIsRunning(false);
    completedRef.current = true;

    // Immediately trigger completion with minimal delay
    setTimeout(() => {
      if (mountedRef.current) {
        onComplete();
      }
    }, 150);
  }, [onComplete]);

  // Auto-start download when component mounts (no pause opportunity)
  useEffect(() => {
    // Small delay to allow component to render first
    const timer = setTimeout(() => {
      if (!completedRef.current && !isRunning) {
        runDownload();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [runDownload, isRunning]);

  const allComplete = Object.values(downloads).every((d) => d.status === "Complete");

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <HardDrive className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Download Models</h3>
          <p className="body-default text-zinc-400 mt-1">
            Fetch LLM model weights from IPFS/HuggingFace and verify integrity via SHA256 hash.
          </p>
        </div>
      </div>

      <div className="space-y-[var(--space-3)]">
        {SUPPORTED_MODELS.slice(0, 2).map((model) => {
          const download = downloads[model.id];
          return (
            <div
              key={model.id}
              className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-[var(--space-2)]">
                <div className="flex items-center gap-[var(--space-2)]">
                  <Server className="w-4 h-4 text-zinc-500" />
                  <span className="body-default text-white">{model.displayName}</span>
                </div>
                {download?.status === "Complete" ? (
                  <span className="flex items-center gap-1 caption text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : download ? (
                  <span className="caption text-zinc-400">{download.status}</span>
                ) : (
                  <span className="caption text-zinc-600">Pending</span>
                )}
              </div>
              {download && (
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${download.status === "Complete" ? "bg-emerald-500" : "bg-purple-500"}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${download.progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-download in progress - no manual button needed */}
      {isRunning && (
        <div className="flex items-center justify-center gap-2 py-3 text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="body-default">Downloading models automatically...</span>
        </div>
      )}

      {/* Show completion message before advancing */}
      {allComplete && (
        <div className="flex items-center justify-center gap-2 py-3 text-emerald-400">
          <CheckCircle className="w-4 h-4" />
          <span className="body-default">All models downloaded successfully!</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 4: BENCHMARK
// ============================================================================

/**
 * Benchmark results type
 */
interface BenchmarkResults {
  tokensPerSec: number;
  latency: number;
  memoryUsed: number;
  hash: string;
}

/**
 * Step 4: Hardware Benchmark
 *
 * Runs a standardized inference test to verify hardware capabilities and
 * establish a performance baseline for job pricing and scheduling.
 *
 * **Benchmark Metrics:**
 * - Tokens/sec: Inference throughput (typically 94-114 for demo)
 * - Latency: Time to first token (0.8-1.2 seconds)
 * - VRAM Used: GPU memory consumption (19-21 GB)
 * - Output Hash: Deterministic hash for reproducibility verification
 *
 * **Completion Criteria:**
 * - Benchmark runs to completion without errors
 * - Results object is populated with all metrics
 * - "Benchmark Passed" indicator is displayed
 *
 * **Behavior:**
 * 1. User clicks "Run Benchmark" button
 * 2. Spinning animation displays during test (~1.2 seconds)
 * 3. Results card appears with performance metrics
 * 4. On success, `onComplete()` is called after 300ms delay
 *
 * **Note:** In this demo, results are simulated with slight randomization.
 * Production would run actual GPT-OSS 20B inference tests.
 *
 * @param onComplete - Callback invoked when benchmark passes.
 *   Triggers transition to the next step (Stake).
 * @param initialResults - Pre-existing benchmark results from persisted state
 * @param onResultsChange - Callback for persisting benchmark results
 */
interface BenchmarkStepProps {
  onComplete: () => void;
  initialResults?: BenchmarkResults | null;
  onResultsChange?: (results: BenchmarkResults) => void;
}

function BenchmarkStep({ onComplete, initialResults, onResultsChange }: BenchmarkStepProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResults | null>(initialResults ?? null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runBenchmark = async () => {
    setIsRunning(true);
    // Fast for demo
    await new Promise((r) => setTimeout(r, 1200));
    if (!mountedRef.current) return;
    const newResults: BenchmarkResults = {
      tokensPerSec: 94 + Math.floor(Math.random() * 20),
      latency: 0.8 + Math.random() * 0.4,
      memoryUsed: 19.2 + Math.random() * 2,
      hash: "0x7a3f" + Math.random().toString(16).slice(2, 10),
    };
    setResults(newResults);
    onResultsChange?.(newResults);
    setIsRunning(false);
    setTimeout(() => {
      if (mountedRef.current) {
        onComplete();
      }
    }, 300);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Hardware Benchmark</h3>
          <p className="body-default text-zinc-400 mt-1">
            Run standardized inference test to verify hardware capabilities and establish performance baseline.
          </p>
        </div>
      </div>

      {isRunning && (
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex flex-col items-center">
            <motion.div
              className="w-20 h-20 rounded-full border-4 border-zinc-700 border-t-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="body-default text-zinc-400 mt-4">Running benchmark test...</p>
            <p className="caption text-zinc-500 mt-1">Testing: GPT-OSS 20B inference</p>
          </div>
        </div>
      )}

      {results && (
        <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-emerald-500/30">
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="body-medium text-emerald-400">Benchmark Passed</span>
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-4)]">
            <div className="p-[var(--space-3)] rounded-lg bg-zinc-800/50">
              <p className="micro text-zinc-500 mb-1">Tokens/sec</p>
              <p className="text-xl font-bold text-white">{results.tokensPerSec}</p>
            </div>
            <div className="p-[var(--space-3)] rounded-lg bg-zinc-800/50">
              <p className="micro text-zinc-500 mb-1">Latency</p>
              <p className="text-xl font-bold text-white">{results.latency.toFixed(2)}s</p>
            </div>
            <div className="p-[var(--space-3)] rounded-lg bg-zinc-800/50">
              <p className="micro text-zinc-500 mb-1">VRAM Used</p>
              <p className="text-xl font-bold text-white">{results.memoryUsed.toFixed(1)} GB</p>
            </div>
            <div className="p-[var(--space-3)] rounded-lg bg-zinc-800/50">
              <p className="micro text-zinc-500 mb-1">Output Hash</p>
              <p className="type-mono text-white truncate">{results.hash}</p>
            </div>
          </div>
        </div>
      )}

      {!isRunning && !results && (
        <motion.button
          onClick={runBenchmark}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-benchmark-btn"
        >
          <Gauge className="w-4 h-4" />
          Run Benchmark
        </motion.button>
      )}
    </div>
  );
}

// ============================================================================
// STEP 5: STAKE
// ============================================================================

/**
 * Step 5: Stake Collateral
 *
 * Locks QUBIC tokens on-chain as collateral to ensure good behavior.
 * Higher stakes result in better job queue priority and reputation scores.
 *
 * **Staking Parameters:**
 * - Minimum: 1M QUBIC
 * - Maximum: 100M QUBIC
 * - Step: 1M QUBIC increments
 * - Default: 10M QUBIC
 *
 * **Completion Criteria:**
 * - Stake transaction submitted and confirmed
 * - Success message displayed with staked amount
 * - `isStaked` state set to true
 *
 * **Behavior:**
 * 1. User adjusts stake amount via slider (optional, default 10M)
 * 2. User clicks "Stake X QUBIC" button
 * 3. Loading state shows "Staking..." (~2 seconds)
 * 4. Success confirmation displays staked amount
 * 5. On success, `onComplete()` is called after 500ms delay
 *
 * **Important:** Once staked, the slider is disabled. Stake can be slashed
 * for protocol violations (e.g., returning incorrect inference results).
 *
 * @param onComplete - Callback invoked when staking succeeds.
 *   Triggers transition to the final step (Register).
 * @param initialStakeAmount - Pre-set stake amount from persisted state
 * @param onStakeAmountChange - Callback for persisting stake amount changes
 */
interface StakeStepProps {
  onComplete: () => void;
  initialStakeAmount?: number;
  onStakeAmountChange?: (amount: number) => void;
}

function StakeStep({ onComplete, initialStakeAmount = 10_000_000, onStakeAmountChange }: StakeStepProps) {
  const [stakeAmount, setStakeAmount] = useState(initialStakeAmount);

  // Persist stake amount changes
  useEffect(() => {
    onStakeAmountChange?.(stakeAmount);
  }, [stakeAmount, onStakeAmountChange]);
  const [isStaking, setIsStaking] = useState(false);
  const [isStaked, setIsStaked] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleStake = async () => {
    setIsStaking(true);
    await new Promise((r) => setTimeout(r, 2000));
    if (!mountedRef.current) return;
    setIsStaked(true);
    setIsStaking(false);
    setTimeout(() => {
      if (mountedRef.current) {
        onComplete();
      }
    }, 500);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Coins className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Stake Collateral</h3>
          <p className="body-default text-zinc-400 mt-1">
            Lock QUBIC on-chain as collateral. This ensures good behavior and can be slashed for violations.
          </p>
        </div>
      </div>

      <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-[var(--space-4)]">
        <div>
          <label className="caption text-zinc-500 mb-[var(--space-2)] block">Stake Amount</label>
          <div className="relative">
            <input
              type="range"
              min={1_000_000}
              max={100_000_000}
              step={1_000_000}
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              disabled={isStaked}
              data-testid="onboarding-stake-slider"
            />
            <div className="flex justify-between caption text-zinc-500 mt-2">
              <span>1M QUBIC</span>
              <span className="text-amber-400 font-bold">
                {(stakeAmount / 1_000_000).toFixed(0)}M QUBIC
              </span>
              <span>100M QUBIC</span>
            </div>
          </div>
        </div>

        <div className="p-[var(--space-3)] rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-[var(--space-2)]">
            <Shield className="w-4 h-4 text-amber-400 mt-0.5" />
            <div className="caption text-zinc-400">
              <p className="text-amber-400 font-medium mb-1">Why stake?</p>
              <p>Higher stake = higher priority in job queue and better reputation score</p>
            </div>
          </div>
        </div>
      </div>

      {isStaked ? (
        <div className="p-[var(--space-4)] rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-[var(--space-2)]">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="body-medium text-emerald-400">
              {(stakeAmount / 1_000_000).toFixed(0)}M QUBIC staked successfully
            </span>
          </div>
        </div>
      ) : (
        <motion.button
          onClick={handleStake}
          disabled={isStaking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-stake-btn"
        >
          {isStaking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Staking...
            </>
          ) : (
            <>
              <Coins className="w-4 h-4" />
              Stake {(stakeAmount / 1_000_000).toFixed(0)}M QUBIC
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// ============================================================================
// STEP 6: REGISTER
// ============================================================================

/**
 * Step 6: Register On-Chain (Final Step)
 *
 * Submits worker capabilities to the WorkerRegistry smart contract,
 * enabling the worker to start accepting inference jobs from the network.
 *
 * **Registration Data:**
 * - Worker wallet address
 * - Hardware attestation (GPU model, VRAM)
 * - Supported models list
 * - Pricing configuration
 * - Coordinator endpoint URL
 *
 * **Completion Criteria:**
 * - Registration transaction submitted to blockchain
 * - Transaction hash received and displayed
 * - `isRegistered` state set to true
 *
 * **Behavior:**
 * 1. User reviews registration checklist
 * 2. User clicks "Register Worker" button
 * 3. Loading state shows "Submitting to blockchain..." (~2.5 seconds)
 * 4. Success confirmation displays with transaction hash
 * 5. On success, `onComplete()` is called after 500ms delay
 *
 * **Final Step:** When this step completes, the parent component sets
 * `isComplete` to true, which renders the CompletionScreen instead of
 * step content.
 *
 * @param onComplete - Callback invoked when registration succeeds.
 *   This is the final step, so it triggers the completion screen.
 */
function RegisterStep({ onComplete }: { onComplete: () => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [txHash, setTxHash] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleRegister = async () => {
    setIsRegistering(true);
    await new Promise((r) => setTimeout(r, 2500));
    if (!mountedRef.current) return;
    setTxHash("0x" + Math.random().toString(16).slice(2, 18) + "...");
    setIsRegistered(true);
    setIsRegistering(false);
    setTimeout(() => {
      if (mountedRef.current) {
        onComplete();
      }
    }, 500);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <FileCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="heading-secondary text-white">Register On-Chain</h3>
          <p className="body-default text-zinc-400 mt-1">
            Submit your capabilities to the WorkerRegistry smart contract and start accepting jobs.
          </p>
        </div>
      </div>

      <div className="p-[var(--space-4)] rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-[var(--space-3)]">
        <p className="caption text-zinc-500">Registration includes:</p>
        <div className="space-y-[var(--space-2)]">
          {[
            "Worker wallet address",
            "Hardware attestation (GPU model, VRAM)",
            "Supported models list",
            "Pricing configuration",
            "Coordinator endpoint",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-[var(--space-2)]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="body-default text-zinc-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {isRegistered ? (
        <div className="p-[var(--space-4)] rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="body-medium text-emerald-400">Registration Complete!</span>
          </div>
          <div className="p-[var(--space-2)] rounded-lg bg-zinc-900/50 type-mono text-zinc-400">
            Tx: {txHash}
          </div>
        </div>
      ) : (
        <motion.button
          onClick={handleRegister}
          disabled={isRegistering}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-register-btn"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting to blockchain...
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              Register Worker
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// ============================================================================
// COMPLETION SCREEN
// ============================================================================

/**
 * Final screen displayed when all onboarding steps are completed.
 *
 * Shows a success animation and confirmation that the worker node is
 * ready to accept inference jobs from the network.
 *
 * **Actions Available:**
 * - "Start Over": Resets the wizard to step 1 for reconfiguration
 *
 * @param onReset - Callback to restart the onboarding process.
 *   Resets `currentStep` to 0 and all step statuses to initial state.
 */
function CompletionScreen({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-[var(--space-8)]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-[var(--space-6)]"
      >
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <h2 className="heading-primary text-white mb-[var(--space-2)]">Worker Ready!</h2>
      <p className="body-default text-zinc-400 mb-[var(--space-6)]">
        Your node is now registered and ready to accept inference jobs.
      </p>
      <div className="flex items-center justify-center gap-[var(--space-4)]">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          data-testid="onboarding-start-over-btn"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// RESUME PROMPT COMPONENT
// ============================================================================

/**
 * Prompt shown when a resumable session is detected.
 *
 * Offers users the choice to continue from where they left off or start fresh.
 * This prevents frustration from losing progress due to accidental page refresh.
 *
 * @param stepName - Human-readable name of the step to resume from
 * @param stepNumber - 1-based step number for display
 * @param onResume - Callback when user chooses to resume
 * @param onStartFresh - Callback when user chooses to start over
 */
interface ResumePromptProps {
  stepName: string;
  stepNumber: number;
  onResume: () => void;
  onStartFresh: () => void;
}

function ResumePrompt({ stepName, stepNumber, onResume, onStartFresh }: ResumePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-[var(--space-6)] rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
    >
      <div className="flex items-start gap-[var(--space-4)]">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <PlayCircle className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="heading-secondary text-white mb-1">Resume Your Progress</h3>
          <p className="body-default text-zinc-400">
            You have an incomplete onboarding session. Would you like to continue from{" "}
            <span className="text-cyan-400 font-medium">Step {stepNumber}: {stepName}</span>?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-4)]">
        <motion.button
          onClick={onResume}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-resume-btn"
        >
          <PlayCircle className="w-4 h-4" />
          Resume from Step {stepNumber}
        </motion.button>
        <motion.button
          onClick={onStartFresh}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium flex items-center justify-center gap-2"
          data-testid="onboarding-start-fresh-btn"
        >
          <X className="w-4 h-4" />
          Start Fresh
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN ONBOARDING COMPONENT
// ============================================================================

/**
 * Main worker onboarding wizard component.
 *
 * Orchestrates a 6-step setup flow for new compute node operators:
 * 1. **Install** - Download worker software components
 * 2. **Configure** - Set wallet address and model selection
 * 3. **Download** - Fetch LLM model weights
 * 4. **Benchmark** - Run hardware performance tests
 * 5. **Stake** - Lock QUBIC collateral
 * 6. **Register** - Submit to WorkerRegistry contract
 *
 * ## Step Lifecycle Pattern
 *
 * Each step component receives an `onComplete` callback that chains to
 * the next step. The flow is:
 *
 * ```
 * Step calls onComplete() → completeStep() updates states →
 *   Current step: status → "complete"
 *   Next step: status → "active"
 *   currentStep index increments
 * ```
 *
 * ## State Management
 *
 * - `currentStep`: Index of active step (0-5)
 * - `steps`: Array of OnboardingStep with dynamic statuses
 * - `isComplete`: True when all steps finished, shows CompletionScreen
 *
 * ## Key Functions
 *
 * - `completeStep()`: Called by child steps to advance the wizard
 * - `resetOnboarding()`: Resets all state to initial values
 * - `renderStepContent()`: Switch statement selecting active step component
 *
 * @example
 * ```tsx
 * // Usage in parent component
 * <WorkerOnboarding />
 * ```
 */
export function WorkerOnboarding() {
  // Persistence hook for localStorage state management
  const {
    loadState,
    saveState,
    clearState,
    hasResumableSession,
    getResumeStepName
  } = useOnboardingPersistence();

  // Initial step definitions
  const initialSteps: OnboardingStep[] = [
    { id: "install", title: "Install", description: "Download worker software", icon: Download, status: "active" },
    { id: "configure", title: "Configure", description: "Set wallet and models", icon: Settings, status: "pending" },
    { id: "download", title: "Download", description: "Fetch model weights", icon: HardDrive, status: "pending" },
    { id: "benchmark", title: "Benchmark", description: "Test hardware", icon: Gauge, status: "pending" },
    { id: "stake", title: "Stake", description: "Lock collateral", icon: Coins, status: "pending" },
    { id: "register", title: "Register", description: "Submit on-chain", icon: FileCheck, status: "pending" },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);
  const [isComplete, setIsComplete] = useState(false);

  // Resume prompt state
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeData, setResumeData] = useState<OnboardingPersistedState | null>(null);

  // Persisted form data
  const [configData, setConfigData] = useState<{
    walletAddress: string;
    selectedModels: string[];
  }>({ walletAddress: "", selectedModels: [SUPPORTED_MODELS[0].id] });
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResults | null>(null);
  const [stakeAmount, setStakeAmount] = useState(10_000_000);

  // Track if we've loaded persisted state
  const hasLoadedRef = useRef(false);

  // Check for resumable session on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (hasResumableSession()) {
      const saved = loadState();
      if (saved) {
        setResumeData(saved);
        setShowResumePrompt(true);
      }
    }
  }, [hasResumableSession, loadState]);

  // Handle resuming from saved state
  const handleResume = useCallback(() => {
    if (!resumeData) return;

    // Restore step states
    const restoredSteps = initialSteps.map((step, index) => {
      const savedStatus = resumeData.stepStatuses[step.id];
      if (savedStatus) {
        return { ...step, status: savedStatus };
      }
      // For steps without saved status, infer from currentStep
      if (index < resumeData.currentStep) {
        return { ...step, status: "complete" as StepStatus };
      }
      if (index === resumeData.currentStep) {
        return { ...step, status: "active" as StepStatus };
      }
      return { ...step, status: "pending" as StepStatus };
    });

    setSteps(restoredSteps);
    setCurrentStep(resumeData.currentStep);
    setIsComplete(resumeData.isComplete);

    // Restore form data
    if (resumeData.configureData) {
      setConfigData(resumeData.configureData);
    }
    if (resumeData.benchmarkResults) {
      setBenchmarkResults(resumeData.benchmarkResults);
    }
    if (resumeData.stakeAmount) {
      setStakeAmount(resumeData.stakeAmount);
    }

    setShowResumePrompt(false);
  }, [resumeData, initialSteps]);

  // Handle starting fresh
  const handleStartFresh = useCallback(() => {
    clearState();
    setShowResumePrompt(false);
    setResumeData(null);
  }, [clearState]);

  // Save state whenever it changes
  useEffect(() => {
    if (showResumePrompt) return; // Don't save while showing resume prompt

    const stepStatuses: Record<string, StepStatus> = {};
    steps.forEach(step => {
      stepStatuses[step.id] = step.status;
    });

    saveState({
      currentStep,
      stepStatuses,
      isComplete,
      configureData: configData,
      benchmarkResults,
      stakeAmount,
    });
  }, [currentStep, steps, isComplete, configData, benchmarkResults, stakeAmount, saveState, showResumePrompt]);

  // Complete current step and advance
  const completeStep = useCallback(() => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i === currentStep) return { ...step, status: "complete" as StepStatus };
        if (i === currentStep + 1) return { ...step, status: "active" as StepStatus };
        return step;
      })
    );

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsComplete(true);
      // Clear persisted state on completion
      clearState();
    }
  }, [currentStep, steps.length, clearState]);

  // Reset onboarding to start fresh
  const resetOnboarding = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    setConfigData({ walletAddress: "", selectedModels: [SUPPORTED_MODELS[0].id] });
    setBenchmarkResults(null);
    setStakeAmount(10_000_000);
    setSteps(
      initialSteps.map((step, i) => ({
        ...step,
        status: i === 0 ? "active" : "pending",
      }))
    );
    clearState();
  }, [initialSteps, clearState]);

  // Handle config changes from ConfigureStep
  const handleConfigChange = useCallback((walletAddress: string, selectedModels: string[]) => {
    setConfigData({ walletAddress, selectedModels });
  }, []);

  // Handle benchmark results from BenchmarkStep
  const handleBenchmarkResults = useCallback((results: BenchmarkResults) => {
    setBenchmarkResults(results);
  }, []);

  // Handle stake amount changes from StakeStep
  const handleStakeAmountChange = useCallback((amount: number) => {
    setStakeAmount(amount);
  }, []);

  // Render step content with persisted data
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "install":
        return <InstallStep onComplete={completeStep} />;
      case "configure":
        return (
          <ConfigureStep
            onComplete={completeStep}
            initialWalletAddress={configData.walletAddress}
            initialSelectedModels={configData.selectedModels}
            onConfigChange={handleConfigChange}
          />
        );
      case "download":
        return <DownloadModelsStep onComplete={completeStep} />;
      case "benchmark":
        return (
          <BenchmarkStep
            onComplete={completeStep}
            initialResults={benchmarkResults}
            onResultsChange={handleBenchmarkResults}
          />
        );
      case "stake":
        return (
          <StakeStep
            onComplete={completeStep}
            initialStakeAmount={stakeAmount}
            onStakeAmountChange={handleStakeAmountChange}
          />
        );
      case "register":
        return <RegisterStep onComplete={completeStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-[var(--space-6)]" data-testid="worker-onboarding">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-primary text-white flex items-center gap-[var(--space-3)]">
            <Zap className="w-6 h-6 text-cyan-400" />
            Worker Setup
          </h1>
          <p className="text-zinc-500 body-default mt-1">
            Complete the onboarding process to start earning QUBIC
          </p>
        </div>
        {!isComplete && !showResumePrompt && (
          <span className="caption text-zinc-500" data-testid="onboarding-step-counter">
            Step {currentStep + 1} of {steps.length}
          </span>
        )}
      </div>

      {/* Resume Prompt */}
      {showResumePrompt && resumeData && (
        <ResumePrompt
          stepName={getResumeStepName(resumeData.currentStep)}
          stepNumber={resumeData.currentStep + 1}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
        />
      )}

      {/* Progress Steps */}
      {!isComplete && !showResumePrompt && <StepIndicator steps={steps} currentStep={currentStep} />}

      {/* Step Content */}
      {!showResumePrompt && (
        <GlassCard>
          <AnimatePresence mode="wait">
            {isComplete ? (
              <CompletionScreen onReset={resetOnboarding} />
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}
    </div>
  );
}
