# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

COMQUTE is a decentralized AI inference marketplace frontend built on Next.js 16. It connects AI developers needing LLM inference with GPU workers who have spare capacity. Currently a hackathon MVP with mocked backend and local Ollama inference.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

Ollama is required for worker inference:
```bash
ollama pull llama3.1:8b   # Pull a model
ollama serve              # Start Ollama server
```

## Architecture

### State Management

**Zustand stores** (`src/stores/`) - Client-side state persisted to localStorage:
- `wallet-store` - Mock wallet connection, balance, transactions
- `job-store` - Job creation, status updates, output tracking
- `worker-store` - Worker registration, status, earnings
- `pool-store` - Compute pool management
- `review-store` - Worker ratings and reviews

**Server-side storage** (`src/app/api/`) - In-memory Maps (reset on restart):
- `/api/jobs` - Job queue shared between all clients
- `/api/jobs/[id]` - Individual job CRUD (imports jobStore from parent route)

**Important**: The API routes share a single `jobStore` Map. The `/api/jobs/[id]/route.ts` imports from `../route.ts` to ensure jobs created via POST are accessible via GET.

### Data Flow

1. **Requester submits job**: Creates in local Zustand store → POST syncs to server API
2. **Worker polls for jobs**: GET `/api/jobs?status=pending` returns server jobs
3. **Worker claims job**: Fetches job from server → imports to local store via `importJob()` → processes via Ollama
4. **Inference streaming**: POST to `/api/inference` → SSE stream from Ollama → updates local store

### Feature Modules

Features are in `src/app/features/`:
- `developer/` - Requester dashboard (job submission, templates, history)
- `worker/` - Worker dashboard (onboarding, job claiming, earnings)
- `marketplace/` - Pool marketplace (compute collectives)
- `explorer/` - Network explorer (3D visualization, live activity)
- `opus/` - Shared components, layouts, and utilities
- `landing/` - Landing page

### Shared UI Components

`src/app/features/opus/shared/` exports all shared components:
- `GlassCard` - Frosted glass container
- `JobStatusIndicator` / `StatusBadge` - Job status display (badge or dot variant)
- `ModelSelector` - LLM model picker
- `EmptyStateIllustration` - Animated empty states
- Job pipeline utilities and Ollama error handling

### Key Hooks

`src/hooks/`:
- `useJobs` - Job CRUD with wallet integration
- `useWorker` - Worker lifecycle (go online/offline, claim jobs, auto-claim)
- `useInference` - Ollama streaming inference
- `useJobPolling` - Poll server for jobs by status
- `useHealth` - Ollama connection health check

### Routing

- `/` - Landing page
- `/app` - Main application (tabs: requester, worker, marketplace, explorer)
- `/app/job/[id]` - Job detail page

## Type System

Types are in `src/types/`:
- `Job` - Inference job with status, tokens, cost
- `Worker` - Worker profile with stats, reputation
- `JobStatus` - `"pending" | "assigned" | "running" | "streaming" | "complete" | "failed" | "cancelled"`

Models are configured in `src/lib/models.ts` with Ollama mappings and pricing.

## Key Patterns

### Framer Motion Transitions
Use `as const` for `ease` properties to satisfy TypeScript:
```tsx
transition: { ease: "easeOut" as const }
```

### Job Store Import
Workers must import jobs before updating them:
```tsx
const { importJob, updateJob, getJob } = useJobStore();
// First import from server, then update
importJob(fetchedJob);
updateJob(jobId, { status: "running" });
```

### API Route Sharing
The `/api/jobs/[id]/route.ts` imports the shared jobStore:
```tsx
import { jobStore } from "../route";
```
