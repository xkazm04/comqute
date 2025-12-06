/**
 * Pipeline Constants
 *
 * Available models and block palette configuration for the pipeline builder.
 */

import type { PipelineModelOption, BlockPaletteCategory, ModelCategory } from "./types";

// ============================================================================
// AVAILABLE PIPELINE MODELS
// ============================================================================

export const PIPELINE_MODELS: PipelineModelOption[] = [
  // Vision Models
  {
    modelId: "vision-analyzer",
    category: "vision",
    displayName: "Vision Analyzer",
    description: "Analyzes images and extracts detailed descriptions",
    icon: "👁️",
    color: "purple",
    capabilities: ["image-to-text", "object-detection", "scene-understanding"],
    estimatedCostPer1k: 80_000,
  },
  {
    modelId: "ocr-extractor",
    category: "vision",
    displayName: "OCR Extractor",
    description: "Extracts text from images and documents",
    icon: "📄",
    color: "indigo",
    capabilities: ["ocr", "document-parsing"],
    estimatedCostPer1k: 50_000,
  },

  // Language Models
  {
    modelId: "gpt-oss-20b",
    category: "llm",
    displayName: "GPT-OSS 20B",
    description: "High-performance general-purpose language model",
    icon: "🧠",
    color: "cyan",
    capabilities: ["chat", "reasoning", "analysis"],
    estimatedCostPer1k: 62_500,
  },
  {
    modelId: "ministral-3-14b",
    category: "llm",
    displayName: "Ministral-3 14B",
    description: "Fast and efficient for quick tasks",
    icon: "⚡",
    color: "emerald",
    capabilities: ["chat", "reasoning"],
    estimatedCostPer1k: 37_500,
  },
  {
    modelId: "creative-writer",
    category: "llm",
    displayName: "Creative Writer",
    description: "Specialized for creative content generation",
    icon: "✨",
    color: "amber",
    capabilities: ["creative-writing", "storytelling"],
    estimatedCostPer1k: 55_000,
  },

  // Code Models
  {
    modelId: "code-generator",
    category: "code",
    displayName: "Code Generator",
    description: "Generates code from natural language descriptions",
    icon: "💻",
    color: "blue",
    capabilities: ["code-generation", "multi-language"],
    estimatedCostPer1k: 70_000,
  },
  {
    modelId: "react-component-gen",
    category: "code",
    displayName: "React Component Gen",
    description: "Specialized for React/TypeScript components",
    icon: "⚛️",
    color: "sky",
    capabilities: ["react", "typescript", "component-generation"],
    estimatedCostPer1k: 75_000,
  },

  // Summarizers
  {
    modelId: "summarizer",
    category: "summarizer",
    displayName: "Summarizer",
    description: "Creates concise summaries of long texts",
    icon: "📋",
    color: "rose",
    capabilities: ["summarization", "key-points"],
    estimatedCostPer1k: 30_000,
  },
  {
    modelId: "tldr-generator",
    category: "summarizer",
    displayName: "TL;DR Generator",
    description: "Ultra-concise one-liner summaries",
    icon: "📌",
    color: "pink",
    capabilities: ["tldr", "quick-summary"],
    estimatedCostPer1k: 20_000,
  },

  // Embedding Models
  {
    modelId: "text-embedder",
    category: "embedding",
    displayName: "Text Embedder",
    description: "Generates vector embeddings for text",
    icon: "🔢",
    color: "slate",
    capabilities: ["embeddings", "similarity"],
    estimatedCostPer1k: 15_000,
  },
];

// ============================================================================
// BLOCK PALETTE CATEGORIES
// ============================================================================

export const BLOCK_PALETTE: BlockPaletteCategory[] = [
  {
    id: "vision",
    label: "Vision",
    icon: "👁️",
    blocks: PIPELINE_MODELS.filter((m) => m.category === "vision"),
  },
  {
    id: "llm",
    label: "Language",
    icon: "🧠",
    blocks: PIPELINE_MODELS.filter((m) => m.category === "llm"),
  },
  {
    id: "code",
    label: "Code",
    icon: "💻",
    blocks: PIPELINE_MODELS.filter((m) => m.category === "code"),
  },
  {
    id: "summarizer",
    label: "Summarize",
    icon: "📋",
    blocks: PIPELINE_MODELS.filter((m) => m.category === "summarizer"),
  },
  {
    id: "embedding",
    label: "Embedding",
    icon: "🔢",
    blocks: PIPELINE_MODELS.filter((m) => m.category === "embedding"),
  },
];

// ============================================================================
// CONDITION TYPES
// ============================================================================

export const CONDITION_OPTIONS = [
  { value: "contains", label: "Contains", description: "Output contains text" },
  { value: "not_contains", label: "Not Contains", description: "Output does not contain text" },
  { value: "equals", label: "Equals", description: "Output exactly matches" },
  { value: "not_equals", label: "Not Equals", description: "Output does not match" },
  { value: "regex_match", label: "Regex Match", description: "Matches regular expression" },
  { value: "length_gt", label: "Length Greater Than", description: "Output length exceeds value" },
  { value: "length_lt", label: "Length Less Than", description: "Output length is less than value" },
  { value: "json_path", label: "JSON Path", description: "Check JSON path value" },
  { value: "custom", label: "Custom", description: "Custom JavaScript expression" },
];

// ============================================================================
// TRANSFORM TYPES
// ============================================================================

export const TRANSFORM_OPTIONS = [
  { value: "extract_json", label: "Extract JSON", description: "Extract JSON from text" },
  { value: "extract_code", label: "Extract Code", description: "Extract code blocks" },
  { value: "format_template", label: "Format Template", description: "Apply template formatting" },
  { value: "split", label: "Split", description: "Split text by delimiter" },
  { value: "merge", label: "Merge", description: "Merge multiple inputs" },
  { value: "truncate", label: "Truncate", description: "Truncate to length" },
  { value: "custom", label: "Custom", description: "Custom JavaScript transform" },
];

// ============================================================================
// DEFAULT PIPELINE TEMPLATES
// ============================================================================

export const PIPELINE_TEMPLATES = [
  {
    id: "image-to-component",
    name: "Image to React Component",
    description: "Analyze an image and generate a React component that recreates it",
    category: "development",
    steps: [
      "Vision model analyzes the image",
      "LLM generates detailed description",
      "Code model creates React component",
    ],
  },
  {
    id: "content-summarizer",
    name: "Multi-Stage Summarizer",
    description: "Progressive summarization: full analysis → key points → TL;DR",
    category: "productivity",
    steps: [
      "LLM performs full analysis",
      "Summarizer extracts key points",
      "TL;DR generator creates one-liner",
    ],
  },
  {
    id: "code-reviewer",
    name: "AI Code Review",
    description: "Comprehensive code review with suggestions and improved code",
    category: "development",
    steps: [
      "Code analyzer reviews the code",
      "LLM generates improvement suggestions",
      "Conditional: if issues found, generate fixed code",
    ],
  },
  {
    id: "content-classifier",
    name: "Content Classifier",
    description: "Classify content and route to specialized handlers",
    category: "automation",
    steps: [
      "LLM classifies content type",
      "Condition branches based on classification",
      "Specialized model handles each type",
    ],
  },
];

// ============================================================================
// BLOCK STYLING
// ============================================================================

export const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  input: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  output: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
  },
  model: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
  },
  condition: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  transform: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
};

export const MODEL_CATEGORY_COLORS: Record<ModelCategory, string> = {
  vision: "purple",
  llm: "cyan",
  code: "blue",
  summarizer: "rose",
  embedding: "slate",
  custom: "zinc",
};
