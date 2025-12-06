// Model configuration
export interface ModelConfig {
  id: string;
  ollamaName: string;
  displayName: string;
  shortName: string; // For compact displays
  description: string;
  speed: "fast" | "medium" | "slow";
  pricing: {
    inputPer1k: number; // QUBIC per 1000 input tokens
    outputPer1k: number; // QUBIC per 1000 output tokens
  };
  maxContext: number;
  capabilities: string[];
  isCloud?: boolean;
}

// Supported models
export const SUPPORTED_MODELS: ModelConfig[] = [
  {
    id: "gpt-oss-20b",
    ollamaName: "gpt-oss:20b",
    displayName: "GPT-OSS 20B",
    shortName: "GPT-OSS",
    description: "High-performance 20B open source model",
    speed: "medium",
    pricing: {
      inputPer1k: 50_000,
      outputPer1k: 75_000,
    },
    maxContext: 8192,
    capabilities: ["chat", "general", "reasoning", "analysis"],
  },
  {
    id: "ministral-3-14b",
    ollamaName: "ministral-3:14b",
    displayName: "Ministral-3 14B",
    shortName: "Ministral-3",
    description: "Fast and efficient 14B parameter model",
    speed: "fast",
    pricing: {
      inputPer1k: 25_000,
      outputPer1k: 50_000,
    },
    maxContext: 8192,
    capabilities: ["chat", "general", "reasoning"],
  },
  {
    id: "gpt-oss-20b-cloud",
    ollamaName: "gpt-oss:20b:cloud",
    displayName: "GPT-OSS 20B Cloud",
    shortName: "GPT-OSS Cloud",
    description: "Cloud-accelerated 20B model for maximum performance",
    speed: "fast",
    pricing: {
      inputPer1k: 80_000,
      outputPer1k: 120_000,
    },
    maxContext: 16384,
    capabilities: ["chat", "general", "reasoning", "analysis", "code"],
    isCloud: true,
  },
];

// Helper to get model IDs as array (useful for stats)
export function getModelIds(): string[] {
  return SUPPORTED_MODELS.map((m) => m.id);
}

// Helper to get display names mapping
export function getModelDisplayNames(): Record<string, string> {
  return SUPPORTED_MODELS.reduce(
    (acc, m) => ({ ...acc, [m.id]: m.displayName }),
    {} as Record<string, string>
  );
}

// Helper to get short names mapping
export function getModelShortNames(): Record<string, string> {
  return SUPPORTED_MODELS.reduce(
    (acc, m) => ({ ...acc, [m.id]: m.shortName }),
    {} as Record<string, string>
  );
}

// Get model by ID
export function getModelById(id: string): ModelConfig | undefined {
  return SUPPORTED_MODELS.find((model) => model.id === id);
}

// Get model by Ollama name
export function getModelByOllamaName(name: string): ModelConfig | undefined {
  return SUPPORTED_MODELS.find((model) => model.ollamaName === name);
}

// Get default model
export function getDefaultModel(): ModelConfig {
  return SUPPORTED_MODELS[0];
}

// Check if model is supported
export function isModelSupported(id: string): boolean {
  return SUPPORTED_MODELS.some((model) => model.id === id);
}
