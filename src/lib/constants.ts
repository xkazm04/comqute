// API URLs
export const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// Mock wallet defaults
export const DEFAULT_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_MOCK_WALLET_ADDRESS ||
  "0xA7f8b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8";
export const DEFAULT_INITIAL_BALANCE =
  Number(process.env.NEXT_PUBLIC_INITIAL_BALANCE) || 250_000_000;

// Mock worker defaults
export const DEFAULT_WORKER_ADDRESS =
  process.env.NEXT_PUBLIC_MOCK_WORKER_ADDRESS ||
  "0x3C29f1a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2";
export const DEFAULT_WORKER_STAKE =
  Number(process.env.NEXT_PUBLIC_WORKER_STAKE) || 10_000_000;

// Feature flags
export const SIMULATE_DELAY = process.env.NEXT_PUBLIC_SIMULATE_DELAY === "true";
export const DELAY_MS = Number(process.env.NEXT_PUBLIC_DELAY_MS) || 1000;

// Job defaults
export const DEFAULT_MAX_TOKENS = 500;
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_TOP_P = 0.9;

// Polling intervals
export const JOB_POLL_INTERVAL = 2000; // 2 seconds
export const STATS_POLL_INTERVAL = 5000; // 5 seconds

// Transaction confirmation delay
export const TX_CONFIRMATION_DELAY = 2000; // 2 seconds

// Max transactions to keep in history
export const MAX_TRANSACTIONS = 50;

// Block number range for mock data
export const BLOCK_NUMBER_MIN = 1_847_000;
export const BLOCK_NUMBER_MAX = 1_848_000;
