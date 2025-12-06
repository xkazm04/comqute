"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { GlassCard } from "./Layout";
import { SUPPORTED_MODELS } from "@/lib/models";

// ============================================================================
// TYPES
// ============================================================================

type StepStatus = "pending" | "active" | "running" | "complete" | "error";

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

function StepIndicator({ steps, currentStep }: { steps: OnboardingStep[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
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
              <span className={`text-[10px] mt-2 ${isActive ? "text-cyan-400" : isPending ? "text-zinc-600" : "text-zinc-400"}`}>
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

function InstallStep({ onComplete }: { onComplete: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

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
      setLines((prev) => [...prev, steps[i].text]);
      setProgress(Math.floor(((i + 1) / steps.length) * 100));
    }

    setIsRunning(false);
    setTimeout(onComplete, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Install Worker Software</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Download and install the Qubic Compute Node components including the worker daemon,
            model manager, and inference runtime.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Components to install:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "qubic-worker", desc: "Main daemon" },
            { name: "model-manager", desc: "LLM weights" },
            { name: "inference-runtime", desc: "vLLM wrapper" },
            { name: "health-monitor", desc: "Status reporting" },
          ].map((comp) => (
            <div key={comp.name} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <span className="text-xs text-zinc-300">{comp.name}</span>
                <span className="text-[10px] text-zinc-500 ml-2">{comp.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lines.length > 0 && <TerminalOutput lines={lines} isRunning={isRunning} />}

      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
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

function ConfigureStep({ onComplete }: { onComplete: () => void }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([SUPPORTED_MODELS[0].id]);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  };

  const canContinue = walletAddress.length > 10 && selectedModels.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Settings className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Configure Worker</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Set your wallet address for receiving payments and choose which models to support.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Wallet className="w-4 h-4" />
            Qubic Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="QUBIC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Model Selection */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
            <Server className="w-4 h-4" />
            Models to Support
          </label>
          <div className="space-y-2">
            {SUPPORTED_MODELS.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg transition-all
                    ${isSelected
                      ? "bg-cyan-500/10 border border-cyan-500/30"
                      : "bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-600"}`} />
                    <div className="text-left">
                      <span className={`text-sm ${isSelected ? "text-cyan-400" : "text-zinc-300"}`}>
                        {model.displayName}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-2">{model.description}</span>
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

function DownloadModelsStep({ onComplete }: { onComplete: () => void }) {
  const [downloads, setDownloads] = useState<Record<string, { progress: number; status: string }>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDownload = async () => {
    setIsRunning(true);

    for (const model of SUPPORTED_MODELS.slice(0, 2)) {
      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 0, status: "Downloading..." } }));

      // Fast simulation for demo - progress jumps quickly
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 50));
        setDownloads((prev) => ({ ...prev, [model.id]: { progress: p, status: "Downloading..." } }));
      }

      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 100, status: "Verifying hash..." } }));
      await new Promise((r) => setTimeout(r, 200));
      setDownloads((prev) => ({ ...prev, [model.id]: { progress: 100, status: "Complete" } }));
    }

    setIsRunning(false);
    setTimeout(onComplete, 300);
  };

  const allComplete = Object.values(downloads).every((d) => d.status === "Complete");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <HardDrive className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Download Models</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Fetch LLM model weights from IPFS/HuggingFace and verify integrity via SHA256 hash.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {SUPPORTED_MODELS.slice(0, 2).map((model) => {
          const download = downloads[model.id];
          return (
            <div
              key={model.id}
              className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-white">{model.displayName}</span>
                </div>
                {download?.status === "Complete" ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : download ? (
                  <span className="text-xs text-zinc-400">{download.status}</span>
                ) : (
                  <span className="text-xs text-zinc-600">Pending</span>
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

      {!isRunning && !allComplete && (
        <motion.button
          onClick={runDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium flex items-center justify-center gap-2"
        >
          <HardDrive className="w-4 h-4" />
          Download Models
        </motion.button>
      )}

      {isRunning && (
        <div className="flex items-center justify-center gap-2 py-3 text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Downloading models...</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 4: BENCHMARK
// ============================================================================

function BenchmarkStep({ onComplete }: { onComplete: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    tokensPerSec: number;
    latency: number;
    memoryUsed: number;
    hash: string;
  } | null>(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    // Fast for demo
    await new Promise((r) => setTimeout(r, 1200));
    setResults({
      tokensPerSec: 94 + Math.floor(Math.random() * 20),
      latency: 0.8 + Math.random() * 0.4,
      memoryUsed: 19.2 + Math.random() * 2,
      hash: "0x7a3f" + Math.random().toString(16).slice(2, 10),
    });
    setIsRunning(false);
    setTimeout(onComplete, 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Hardware Benchmark</h3>
          <p className="text-sm text-zinc-400 mt-1">
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
            <p className="text-sm text-zinc-400 mt-4">Running benchmark test...</p>
            <p className="text-xs text-zinc-500 mt-1">Testing: GPT-OSS 20B inference</p>
          </div>
        </div>
      )}

      {results && (
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Benchmark Passed</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 mb-1">Tokens/sec</p>
              <p className="text-xl font-bold text-white">{results.tokensPerSec}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 mb-1">Latency</p>
              <p className="text-xl font-bold text-white">{results.latency.toFixed(2)}s</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 mb-1">VRAM Used</p>
              <p className="text-xl font-bold text-white">{results.memoryUsed.toFixed(1)} GB</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 mb-1">Output Hash</p>
              <p className="text-sm font-mono text-white truncate">{results.hash}</p>
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

function StakeStep({ onComplete }: { onComplete: () => void }) {
  const [stakeAmount, setStakeAmount] = useState(10_000_000);
  const [isStaking, setIsStaking] = useState(false);
  const [isStaked, setIsStaked] = useState(false);

  const handleStake = async () => {
    setIsStaking(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsStaked(true);
    setIsStaking(false);
    setTimeout(onComplete, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Coins className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Stake Collateral</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Lock QUBIC on-chain as collateral. This ensures good behavior and can be slashed for violations.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div>
          <label className="text-xs text-zinc-500 mb-2 block">Stake Amount</label>
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
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>1M QUBIC</span>
              <span className="text-amber-400 font-bold">
                {(stakeAmount / 1_000_000).toFixed(0)}M QUBIC
              </span>
              <span>100M QUBIC</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 mt-0.5" />
            <div className="text-xs text-zinc-400">
              <p className="text-amber-400 font-medium mb-1">Why stake?</p>
              <p>Higher stake = higher priority in job queue and better reputation score</p>
            </div>
          </div>
        </div>
      </div>

      {isStaked ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
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

function RegisterStep({ onComplete }: { onComplete: () => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleRegister = async () => {
    setIsRegistering(true);
    await new Promise((r) => setTimeout(r, 2500));
    setTxHash("0x" + Math.random().toString(16).slice(2, 18) + "...");
    setIsRegistered(true);
    setIsRegistering(false);
    setTimeout(onComplete, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <FileCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Register On-Chain</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Submit your capabilities to the WorkerRegistry smart contract and start accepting jobs.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
        <p className="text-xs text-zinc-500">Registration includes:</p>
        <div className="space-y-2">
          {[
            "Worker wallet address",
            "Hardware attestation (GPU model, VRAM)",
            "Supported models list",
            "Pricing configuration",
            "Coordinator endpoint",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm text-zinc-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {isRegistered ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Registration Complete!</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/50 font-mono text-xs text-zinc-400">
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

function CompletionScreen({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2">Worker Ready!</h2>
      <p className="text-zinc-400 mb-6">
        Your node is now registered and ready to accept inference jobs.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN ONBOARDING COMPONENT
// ============================================================================

export function WorkerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: "install", title: "Install", description: "Download worker software", icon: Download, status: "active" },
    { id: "configure", title: "Configure", description: "Set wallet and models", icon: Settings, status: "pending" },
    { id: "download", title: "Download", description: "Fetch model weights", icon: HardDrive, status: "pending" },
    { id: "benchmark", title: "Benchmark", description: "Test hardware", icon: Gauge, status: "pending" },
    { id: "stake", title: "Stake", description: "Lock collateral", icon: Coins, status: "pending" },
    { id: "register", title: "Register", description: "Submit on-chain", icon: FileCheck, status: "pending" },
  ]);
  const [isComplete, setIsComplete] = useState(false);

  const completeStep = () => {
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
    }
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    setIsComplete(false);
    setSteps((prev) =>
      prev.map((step, i) => ({
        ...step,
        status: i === 0 ? "active" : "pending",
      }))
    );
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "install":
        return <InstallStep onComplete={completeStep} />;
      case "configure":
        return <ConfigureStep onComplete={completeStep} />;
      case "download":
        return <DownloadModelsStep onComplete={completeStep} />;
      case "benchmark":
        return <BenchmarkStep onComplete={completeStep} />;
      case "stake":
        return <StakeStep onComplete={completeStep} />;
      case "register":
        return <RegisterStep onComplete={completeStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            Worker Setup
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Complete the onboarding process to start earning QUBIC
          </p>
        </div>
        {!isComplete && (
          <span className="text-xs text-zinc-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        )}
      </div>

      {/* Progress Steps */}
      {!isComplete && <StepIndicator steps={steps} currentStep={currentStep} />}

      {/* Step Content */}
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
    </div>
  );
}
