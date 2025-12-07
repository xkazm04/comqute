# COMQUTE — Decentralized AI Inference Network

> **"Run AI models without the cloud bill."**

COMQUTE is a decentralized compute marketplace built on Qubic blockchain that connects AI developers needing LLM inference with GPU owners who have spare capacity. Submit a prompt, get a response — powered by decentralized compute, settled on Qubic, with zero platform fees.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

This repository contains the **frontend application** for COMQUTE — a hackathon MVP demonstrating the user experience and interface for a decentralized AI inference marketplace. The application showcases:

- **Developer Dashboard** — Submit inference requests, manage jobs, view results
- **Worker Dashboard** — Register compute resources, claim jobs, earn rewards
- **Pool Marketplace** — Form compute collectives for large-scale jobs
- **Network Explorer** — Real-time visualization of network activity and statistics

### Current State

The frontend is fully functional with **mocked data and local inference** via Ollama. The application demonstrates the complete user journey for both requesters and workers, ready to be connected to Qubic smart contracts and the decentralized worker network.

---

## The Problem We're Solving

### For AI Developers & Users

| Pain Point | Current Reality |
|------------|-----------------|
| **Cost** | GPT-4 API: ~$30/1M tokens. Self-hosting A100: $2-4/hour |
| **Vendor Lock-in** | Dependent on OpenAI, Anthropic, Google availability & pricing |
| **Privacy** | Prompts sent to centralized servers, logged, potentially trained on |
| **Access** | API rate limits, waitlists, geographic restrictions |
| **Censorship** | Providers can refuse requests, filter outputs |

### For GPU Owners

| Pain Point | Current Reality |
|------------|-----------------|
| **Underutilization** | Gaming GPUs sit idle 90% of the time |
| **Mining ROI declining** | Traditional crypto mining less profitable |
| **No easy monetization** | Complex to sell compute time |

---

## Why Qubic?

Qubic's unique blockchain properties make this marketplace viable:

| Qubic Feature | Marketplace Benefit |
|---------------|---------------------|
| **Zero transaction fees** | Micro-payments viable (pay per inference) |
| **2-second finality** | Fast job assignment and settlement |
| **15M+ TPS capacity** | Handle high request volume |
| **Existing miner network** | Thousands of GPUs already connected |
| **Aigarth infrastructure** | Proven ML workload execution |
| **Smart contract IPO model** | Novel monetization for marketplace itself |

---

## Features

### Developer Experience
- **Quick Job Submission** — Select model, enter prompt, get response
- **Template Library** — Pre-configured prompts for common tasks
- **Job History** — Track all inference requests and costs
- **Real-time Streaming** — Watch token generation live
- **Cost Estimation** — Know the price before submitting

### Worker Experience
- **Easy Onboarding** — Guided setup wizard for new workers
- **Auto-claim Jobs** — Automatic job claiming when online
- **Earnings Dashboard** — Real-time earnings and statistics
- **Model Management** — Download and manage supported models
- **Reputation System** — Build trust through quality work

### Pool Marketplace
- **Compute Pools** — Form collectives for large inference jobs
- **Tiered System** — Bronze to Diamond pools based on capabilities
- **Profit Sharing** — Configurable earnings distribution
- **Large Job Bidding** — Compete for high-value contracts

### Network Explorer
- **3D Topology View** — Interactive network visualization
- **Globe View** — Geographic distribution of workers
- **Live Activity Feed** — Real-time job flow
- **Model Performance** — Usage statistics by model

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- [Ollama](https://ollama.ai/) (for local inference)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/comqute.git
cd comqute

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running Ollama

For the worker functionality to process jobs, you need Ollama running locally:

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1:8b

# Start Ollama (usually auto-starts)
ollama serve
```

---

## Project Structure

```
comqute/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── developer/      # Developer/Requester dashboard
│   │   │   ├── worker/         # Worker dashboard & onboarding
│   │   │   ├── marketplace/    # Pool marketplace
│   │   │   ├── explorer/       # Network explorer
│   │   │   ├── opus/           # Shared components & layouts
│   │   │   └── landing/        # Landing page
│   │   ├── api/                # API routes (mocked)
│   │   └── opus/               # Main application page
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand state stores
│   ├── lib/                    # Utilities & helpers
│   ├── types/                  # TypeScript definitions
│   └── ui/                     # Reusable UI components
├── docs/                       # Documentation
└── public/                     # Static assets
```

---

## Architecture: From MVP to Production

### Current State (Hackathon MVP)

```
┌─────────────────┐
│   Web App       │ ◄── You are here
│  (Next.js)      │
├─────────────────┤
│   Mock APIs     │ ◄── Simulated backend
├─────────────────┤
│   Ollama        │ ◄── Local inference
│  (Local LLM)    │
└─────────────────┘
```

### Target Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                     │
│                                                                             │
│  ┌───────────────────────┐              ┌───────────────────────┐          │
│  │      WEB APP          │              │     WORKER NODE       │          │
│  │   (This Repository)   │              │    (Desktop App)      │          │
│  └───────────┬───────────┘              └───────────┬───────────┘          │
└──────────────┼──────────────────────────────────────┼───────────────────────┘
               │                                      │
               ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API GATEWAY                                  │   │
│  │  • Request routing    • WebSocket connections    • Job matching      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BLOCKCHAIN LAYER                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       QUBIC BLOCKCHAIN                               │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │  JOB REGISTRY   │  │ WORKER REGISTRY │  │  ESCROW VAULT   │     │   │
│  │  │  • Job queue    │  │  • Registration │  │  • Hold payments│     │   │
│  │  │  • Status track │  │  • Capabilities │  │  • Release/slash│     │   │
│  │  │  • Result hash  │  │  • Reputation   │  │                 │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Path to Production

### Phase 1: Smart Contracts (Required)

1. **Job Registry Contract**
   - Job submission with payment escrow
   - Status tracking (Created → Assigned → Running → Complete)
   - Result hash storage for verification
   - Timeout and cancellation logic

2. **Worker Registry Contract**
   - Worker registration with stake
   - Hardware capability declarations
   - Reputation scoring
   - Slashing conditions

3. **Escrow Vault Contract**
   - Payment locking on job submission
   - Release on successful completion
   - Refund on timeout/failure
   - Slashing distribution

### Phase 2: Worker Node Application

1. **Desktop Application** (Electron or Tauri)
   - Hardware detection and benchmarking
   - Model downloading and management
   - Job claiming via blockchain events
   - Inference execution with progress reporting
   - Result submission with hash

2. **Networking Layer**
   - P2P communication for job data
   - WebSocket connection to API gateway
   - IPFS integration for large payloads

### Phase 3: API Gateway & Services

1. **Job Matching Service**
   - Match jobs to capable workers
   - Optimize for latency, cost, or reliability
   - Load balancing across workers

2. **Price Oracle**
   - Track market rates per model
   - Cost estimation for requesters
   - Dynamic pricing signals

3. **Verification Service**
   - Random spot-check selection
   - Deterministic replay for verification
   - Dispute resolution coordination

### Phase 4: Production Hardening

1. **Security**
   - Wallet integration (Qubic wallet adapter)
   - Transaction signing
   - Rate limiting and abuse prevention

2. **Scalability**
   - WebSocket scaling
   - Result caching
   - CDN for static assets

3. **Monitoring**
   - Network health metrics
   - Worker performance tracking
   - Alert system for issues

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 | Server components, app router, optimized builds |
| State | Zustand | Simple, performant, TypeScript-friendly |
| Styling | Tailwind CSS | Rapid development, consistent design system |
| Animation | Framer Motion | Smooth transitions, gesture support |
| 3D Viz | Three.js / React Three Fiber | Network topology visualization |
| Local LLM | Ollama | Easy setup, multi-model support |

---

## Environment Variables

```env
# Ollama Configuration
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# Future: Qubic Configuration
# NEXT_PUBLIC_QUBIC_RPC_URL=
# NEXT_PUBLIC_JOB_REGISTRY_ADDRESS=
# NEXT_PUBLIC_WORKER_REGISTRY_ADDRESS=
# NEXT_PUBLIC_ESCROW_ADDRESS=
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## License

This project is licensed under the MIT License.