import { OLLAMA_URL } from "./constants";
import { getModelById } from "./models";

// Ollama model info
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

// Ollama generate request
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    num_predict?: number;
    temperature?: number;
    top_p?: number;
    seed?: number;
  };
}

// Ollama generate response (single chunk)
export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

// Check if Ollama is running
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Get available models from Ollama
export async function getAvailableModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return [];
  }
}

// Non-streaming generation
export async function generate(
  request: OllamaGenerateRequest
): Promise<OllamaGenerateResponse> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.statusText}`);
  }

  return response.json();
}

// Streaming generation (async generator)
export async function* streamGenerate(
  request: OllamaGenerateRequest
): AsyncGenerator<OllamaGenerateResponse> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: OllamaGenerateResponse = JSON.parse(line);
            yield chunk;
          } catch {
            console.warn("Failed to parse Ollama response line:", line);
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const chunk: OllamaGenerateResponse = JSON.parse(buffer);
        yield chunk;
      } catch {
        console.warn("Failed to parse final Ollama response:", buffer);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Helper to create inference request from job parameters
export function createInferenceRequest(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    seed?: number;
  }
): OllamaGenerateRequest {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  return {
    model: model.ollamaName,
    prompt,
    system: systemPrompt,
    stream: true,
    options: {
      num_predict: options?.maxTokens,
      temperature: options?.temperature,
      top_p: options?.topP,
      seed: options?.seed,
    },
  };
}
