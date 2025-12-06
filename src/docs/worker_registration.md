Worker Registration Flow (Detailed)
Step 1: Software Installation
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  WORKER INSTALLATION                                                        │
│                                                                             │
│  $ curl -sSL https://compute.qubic.org/install.sh | bash                   │
│                                                                             │
│  This installs:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  QUBIC COMPUTE NODE                                                  │   │
│  │  ├── qubic-worker         (main daemon)                             │   │
│  │  ├── model-manager        (download/manage LLM weights)             │   │
│  │  ├── inference-runtime    (vLLM or llama.cpp wrapper)               │   │
│  │  └── health-monitor       (report status to coordinator)            │   │
│  │                                                                      │   │
│  │  Dependencies:                                                       │   │
│  │  ├── CUDA drivers         (GPU compute)                             │   │
│  │  ├── Docker               (sandboxed execution)                     │   │
│  │  └── Qubic wallet         (receive payments)                        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Step 2: Hardware Detection & Verification
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  HARDWARE VERIFICATION                                                      │
│                                                                             │
│  Problem: Workers can lie about their hardware                              │
│  Solution: Multi-layer verification                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: Self-Reported (Trust but Verify)                          │   │
│  │                                                                      │   │
│  │  Worker software auto-detects:                                       │   │
│  │  $ nvidia-smi --query-gpu=name,memory.total --format=csv            │   │
│  │  > NVIDIA GeForce RTX 4090, 24564 MiB                               │   │
│  │                                                                      │   │
│  │  Reports to coordinator:                                             │   │
│  │  {                                                                   │   │
│  │    "gpu_model": "NVIDIA RTX 4090",                                  │   │
│  │    "gpu_vram_mb": 24564,                                            │   │
│  │    "gpu_driver": "535.104.05",                                      │   │
│  │    "cuda_version": "12.2"                                           │   │
│  │  }                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: Benchmark Challenge (On Registration)                      │   │
│  │                                                                      │   │
│  │  Coordinator sends standardized benchmark task:                      │   │
│  │  "Run LLaMA 8B inference on this exact prompt with seed=12345"      │   │
│  │                                                                      │   │
│  │  Expected results for RTX 4090:                                      │   │
│  │  • Output hash: 0x7a3f...                                           │   │
│  │  • Time: 1.8-2.4 seconds                                            │   │
│  │  • Tokens/sec: 85-110                                               │   │
│  │                                                                      │   │
│  │  If worker claims RTX 4090 but benchmark shows 40 tokens/sec        │   │
│  │  → Flag as suspicious, require re-verification or downgrade tier    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: Random Spot Checks (Ongoing)                              │   │
│  │                                                                      │   │
│  │  5% of real jobs include timing verification:                        │   │
│  │  • If claimed RTX 4090 consistently performs like RTX 3060          │   │
│  │  • → Reputation penalty                                             │   │
│  │  • → Eventually slashed/banned                                      │   │
│  │                                                                      │   │
│  │  Workers don't know which jobs are spot-checks                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: TEE Attestation (Future/Optional)                         │   │
│  │                                                                      │   │
│  │  For high-security tier:                                            │   │
│  │  • Intel SGX / AMD SEV attestation                                  │   │
│  │  • Hardware-signed proof of GPU model                               │   │
│  │  • Cryptographically verifiable                                     │   │
│  │                                                                      │   │
│  │  Not all GPUs support this → premium tier only                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Step 3: Model Download & Verification
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  MODEL READINESS VERIFICATION                                               │
│                                                                             │
│  APPROACH: Hash-based verification + warm-up test                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  1. DOWNLOAD MODEL                                                   │   │
│  │                                                                      │   │
│  │  $ qubic-worker model download llama-3.1-70b                        │   │
│  │                                                                      │   │
│  │  Downloading llama-3.1-70b-instruct (140GB)...                      │   │
│  │  Source: IPFS (Qm...) or HuggingFace mirror                         │   │
│  │  ████████████████████████████████████████ 100%                      │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  2. VERIFY MODEL INTEGRITY                                           │   │
│  │                                                                      │   │
│  │  $ qubic-worker model verify llama-3.1-70b                          │   │
│  │                                                                      │   │
│  │  Computing SHA256 of model weights...                               │   │
│  │  Local:    sha256:9f8e7d6c5b4a3...                                  │   │
│  │  Expected: sha256:9f8e7d6c5b4a3...                                  │   │
│  │  ✓ Model integrity verified                                         │   │
│  │                                                                      │   │
│  │  Why this matters:                                                   │   │
│  │  • Ensures all workers run identical model                          │   │
│  │  • Prevents "trojan" models with backdoors                          │   │
│  │  • Enables deterministic verification (same input → same output)    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  3. WARM-UP TEST                                                     │   │
│  │                                                                      │   │
│  │  $ qubic-worker model test llama-3.1-70b                            │   │
│  │                                                                      │   │
│  │  Loading model into GPU memory...                                   │   │
│  │  VRAM used: 19.2GB / 24GB                                           │   │
│  │  Running test inference...                                          │   │
│  │                                                                      │   │
│  │  Test prompt: "The capital of France is"                            │   │
│  │  Output: "Paris, which is also the largest city..."                 │   │
│  │  Time: 0.8s                                                         │   │
│  │  Tokens/sec: 94                                                     │   │
│  │                                                                      │   │
│  │  ✓ Model ready for inference                                        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  4. DECLARE READINESS                                                │   │
│  │                                                                      │   │
│  │  Worker reports to coordinator:                                      │   │
│  │  {                                                                   │   │
│  │    "model_id": "llama-3.1-70b-instruct",                            │   │
│  │    "model_hash": "sha256:9f8e7d6c5b4a3...",                         │   │
│  │    "quantization": "fp16",                                          │   │
│  │    "loaded_in_vram": true,                                          │   │
│  │    "benchmark_tokens_per_sec": 94,                                  │   │
│  │    "ready": true                                                    │   │
│  │  }                                                                   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Step 4: Stake & Register On-Chain
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ON-CHAIN REGISTRATION                                                      │
│                                                                             │
│  Only after hardware + model verification passes                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  SMART CONTRACT: WorkerRegistry.register()                          │   │
│  │                                                                      │   │
│  │  Input:                                                              │   │
│  │  {                                                                   │   │
│  │    worker_address: "0xA7f...3B2",                                   │   │
│  │    stake_amount: 10_000_000,  // QUBIC                              │   │
│  │    hardware_attestation: {                                          │   │
│  │      gpu_model: "NVIDIA RTX 4090",                                  │   │
│  │      gpu_vram_mb: 24564,                                            │   │
│  │      benchmark_hash: "0x...",  // Signed by coordinator             │   │
│  │    },                                                                │   │
│  │    supported_models: [                                              │   │
│  │      { id: "llama-3.1-8b", ready: true },                           │   │
│  │      { id: "llama-3.1-70b", ready: true },                          │   │
│  │    ],                                                                │   │
│  │    pricing: {                                                        │   │
│  │      "llama-3.1-8b": { input: 50000, output: 75000 },               │   │
│  │      "llama-3.1-70b": { input: 100000, output: 150000 },            │   │
│  │    },                                                                │   │
│  │    coordinator_endpoint: "wss://coord1.compute.qubic.org"           │   │
│  │  }                                                                   │   │
│  │                                                                      │   │
│  │  Contract actions:                                                   │   │
│  │  1. Lock stake_amount in escrow                                     │   │
│  │  2. Create worker record                                            │   │
│  │  3. Emit WorkerRegistered event                                     │   │
│  │  4. Return worker_id                                                │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Step 5: Maintain Liveness (Heartbeat)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  LIVENESS MECHANISM                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  WEBSOCKET CONNECTION (Worker ↔ Coordinator)                        │   │
│  │                                                                      │   │
│  │  Worker maintains persistent WebSocket to coordinator:               │   │
│  │                                                                      │   │
│  │  wss://coord1.compute.qubic.org/worker/0xA7f...3B2                  │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                                                              │   │   │
│  │  │  Every 5 seconds:                                            │   │   │
│  │  │                                                              │   │   │
│  │  │  Worker → Coordinator:                                       │   │   │
│  │  │  {                                                           │   │   │
│  │  │    "type": "heartbeat",                                      │   │   │
│  │  │    "timestamp": 1701792000,                                  │   │   │
│  │  │    "status": "idle",  // or "busy"                           │   │   │
│  │  │    "current_job": null,  // or job_id if busy                │   │   │
│  │  │    "gpu_utilization": 0,                                     │   │   │
│  │  │    "gpu_temp_celsius": 42,                                   │   │   │
│  │  │    "gpu_memory_used_mb": 19200,                              │   │   │
│  │  │    "models_loaded": ["llama-3.1-70b"]                        │   │   │
│  │  │  }                                                           │   │   │
│  │  │                                                              │   │   │
│  │  │  Coordinator → Worker:                                       │   │   │
│  │  │  {                                                           │   │   │
│  │  │    "type": "heartbeat_ack",                                  │   │   │
│  │  │    "timestamp": 1701792000,                                  │   │   │
│  │  │    "queue_position": 3  // jobs waiting for this worker      │   │   │
│  │  │  }                                                           │   │   │
│  │  │                                                              │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  If no heartbeat for 30 seconds:                                    │   │
│  │  → Worker marked as OFFLINE                                         │   │
│  │  → Removed from job matching pool                                   │   │
│  │  → Any assigned job reassigned to another worker                    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

