import { getModelById } from "./models";
import { countTokens } from "./mock-utils";

// Estimate cost before job execution
export function estimateCost(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 500
): { inputTokens: number; estimatedOutputTokens: number; totalCost: number } {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const inputTokens = countTokens(prompt) + countTokens(systemPrompt || "");
  const estimatedOutputTokens = Math.min(maxTokens, 500); // Assume average output

  const inputCost = (inputTokens / 1000) * model.pricing.inputPer1k;
  const outputCost =
    (estimatedOutputTokens / 1000) * model.pricing.outputPer1k;
  const totalCost = Math.ceil(inputCost + outputCost);

  return {
    inputTokens,
    estimatedOutputTokens,
    totalCost,
  };
}

// Calculate actual cost after job completion
export function calculateActualCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const inputCost = (inputTokens / 1000) * model.pricing.inputPer1k;
  const outputCost = (outputTokens / 1000) * model.pricing.outputPer1k;

  return Math.ceil(inputCost + outputCost);
}

// Format cost for display
export function formatCost(qubic: number): string {
  if (qubic >= 1_000_000) {
    return `${(qubic / 1_000_000).toFixed(2)}M QUBIC`;
  }
  if (qubic >= 1_000) {
    return `${(qubic / 1_000).toFixed(1)}K QUBIC`;
  }
  return `${qubic.toLocaleString()} QUBIC`;
}

// Convert QUBIC to approximate USD (mock exchange rate)
const QUBIC_TO_USD_RATE = 0.0000001; // 1 QUBIC = $0.0000001

export function qubicToUsd(qubic: number): string {
  const usd = qubic * QUBIC_TO_USD_RATE;
  if (usd < 0.01) {
    return `<$0.01`;
  }
  return `$${usd.toFixed(2)}`;
}

// Get price breakdown for display
export function getPriceBreakdown(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  inputRate: number;
  outputRate: number;
} {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const inputCost = Math.ceil((inputTokens / 1000) * model.pricing.inputPer1k);
  const outputCost = Math.ceil(
    (outputTokens / 1000) * model.pricing.outputPer1k
  );

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    inputRate: model.pricing.inputPer1k,
    outputRate: model.pricing.outputPer1k,
  };
}
