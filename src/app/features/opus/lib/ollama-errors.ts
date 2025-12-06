/**
 * Ollama Error Types and Utilities
 *
 * Structured error codes and guidance for Ollama-related failures.
 * Workers need to understand why jobs fail to debug local issues
 * vs network problems.
 */

// ============================================================================
// ERROR CODES
// ============================================================================

export type OllamaErrorCode =
  | "OLLAMA_OFFLINE"
  | "MODEL_NOT_FOUND"
  | "INFERENCE_TIMEOUT"
  | "VRAM_EXCEEDED"
  | "CONTEXT_LENGTH_EXCEEDED"
  | "MODEL_LOADING"
  | "GENERATION_FAILED"
  | "CONNECTION_REFUSED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

// ============================================================================
// ERROR INTERFACE
// ============================================================================

export interface OllamaError {
  code: OllamaErrorCode;
  message: string;
  details?: string;
  guidance: string[];
  recoverable: boolean;
  severity: "warning" | "error" | "critical";
}

// ============================================================================
// ERROR DEFINITIONS
// ============================================================================

export const OLLAMA_ERRORS: Record<OllamaErrorCode, Omit<OllamaError, "details">> = {
  OLLAMA_OFFLINE: {
    code: "OLLAMA_OFFLINE",
    message: "Ollama service is not running",
    guidance: [
      "Start Ollama with: ollama serve",
      "Verify Ollama is running: curl http://localhost:11434/api/version",
      "Check if another process is using port 11434",
    ],
    recoverable: true,
    severity: "critical",
  },
  MODEL_NOT_FOUND: {
    code: "MODEL_NOT_FOUND",
    message: "The requested model is not installed",
    guidance: [
      "Pull the model: ollama pull <model-name>",
      "List available models: ollama list",
      "Verify model name spelling is correct",
    ],
    recoverable: true,
    severity: "error",
  },
  INFERENCE_TIMEOUT: {
    code: "INFERENCE_TIMEOUT",
    message: "Inference request timed out",
    guidance: [
      "The model may be too large for your hardware",
      "Try reducing max tokens or prompt length",
      "Check system resources: CPU, RAM, GPU utilization",
      "Consider using a smaller model variant",
    ],
    recoverable: true,
    severity: "warning",
  },
  VRAM_EXCEEDED: {
    code: "VRAM_EXCEEDED",
    message: "GPU memory (VRAM) exceeded",
    guidance: [
      "Close other GPU-intensive applications",
      "Try a smaller model or quantized variant (e.g., :q4_0)",
      "Reduce context window size if possible",
      "Consider CPU-only mode for large models",
    ],
    recoverable: true,
    severity: "error",
  },
  CONTEXT_LENGTH_EXCEEDED: {
    code: "CONTEXT_LENGTH_EXCEEDED",
    message: "Input exceeds model's context window",
    guidance: [
      "Reduce the prompt length",
      "Split the request into smaller chunks",
      "Use a model with a larger context window",
    ],
    recoverable: true,
    severity: "warning",
  },
  MODEL_LOADING: {
    code: "MODEL_LOADING",
    message: "Model is still loading into memory",
    guidance: [
      "Wait for model to finish loading",
      "First inference after start takes longer",
      "Large models may take several minutes to load",
    ],
    recoverable: true,
    severity: "warning",
  },
  GENERATION_FAILED: {
    code: "GENERATION_FAILED",
    message: "Text generation failed unexpectedly",
    guidance: [
      "Try the request again",
      "Check Ollama logs: ollama logs",
      "Restart Ollama service",
      "Verify model integrity: ollama rm <model> && ollama pull <model>",
    ],
    recoverable: true,
    severity: "error",
  },
  CONNECTION_REFUSED: {
    code: "CONNECTION_REFUSED",
    message: "Connection to Ollama refused",
    guidance: [
      "Verify Ollama is running on localhost:11434",
      "Check firewall settings",
      "Restart Ollama service",
    ],
    recoverable: true,
    severity: "critical",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network communication error",
    guidance: [
      "Check your network connection",
      "Verify Ollama endpoint is accessible",
      "Look for proxy or firewall issues",
    ],
    recoverable: true,
    severity: "error",
  },
  UNKNOWN_ERROR: {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    guidance: [
      "Check Ollama logs for more details",
      "Try restarting the Ollama service",
      "Report the issue if it persists",
    ],
    recoverable: false,
    severity: "error",
  },
};

// ============================================================================
// ERROR PARSING
// ============================================================================

/**
 * Parse an error message or API response into a structured OllamaError.
 */
export function parseOllamaError(error: unknown): OllamaError {
  const errorMessage = extractErrorMessage(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Connection errors
  if (
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("connection refused")
  ) {
    return {
      ...OLLAMA_ERRORS.CONNECTION_REFUSED,
      details: errorMessage,
    };
  }

  // Offline/not running
  if (
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("network error") ||
    lowerMessage.includes("failed to fetch")
  ) {
    return {
      ...OLLAMA_ERRORS.OLLAMA_OFFLINE,
      details: errorMessage,
    };
  }

  // Model not found
  if (
    lowerMessage.includes("model") &&
    (lowerMessage.includes("not found") ||
      lowerMessage.includes("does not exist") ||
      lowerMessage.includes("unknown model"))
  ) {
    return {
      ...OLLAMA_ERRORS.MODEL_NOT_FOUND,
      details: errorMessage,
    };
  }

  // VRAM/GPU memory
  if (
    lowerMessage.includes("out of memory") ||
    lowerMessage.includes("cuda") ||
    lowerMessage.includes("vram") ||
    lowerMessage.includes("gpu memory")
  ) {
    return {
      ...OLLAMA_ERRORS.VRAM_EXCEEDED,
      details: errorMessage,
    };
  }

  // Context length
  if (
    lowerMessage.includes("context") &&
    (lowerMessage.includes("length") ||
      lowerMessage.includes("exceeded") ||
      lowerMessage.includes("too long"))
  ) {
    return {
      ...OLLAMA_ERRORS.CONTEXT_LENGTH_EXCEEDED,
      details: errorMessage,
    };
  }

  // Timeout
  if (
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("timed out") ||
    lowerMessage.includes("deadline exceeded")
  ) {
    return {
      ...OLLAMA_ERRORS.INFERENCE_TIMEOUT,
      details: errorMessage,
    };
  }

  // Model loading
  if (
    lowerMessage.includes("loading") ||
    lowerMessage.includes("initializing")
  ) {
    return {
      ...OLLAMA_ERRORS.MODEL_LOADING,
      details: errorMessage,
    };
  }

  // Generation failed
  if (
    lowerMessage.includes("generation") ||
    lowerMessage.includes("inference")
  ) {
    return {
      ...OLLAMA_ERRORS.GENERATION_FAILED,
      details: errorMessage,
    };
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("socket") ||
    lowerMessage.includes("dns")
  ) {
    return {
      ...OLLAMA_ERRORS.NETWORK_ERROR,
      details: errorMessage,
    };
  }

  // Unknown
  return {
    ...OLLAMA_ERRORS.UNKNOWN_ERROR,
    details: errorMessage,
  };
}

/**
 * Extract error message from various error types.
 */
function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    // API error response
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return "Unknown error occurred";
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get severity color classes for styling.
 */
export function getErrorSeverityStyles(severity: OllamaError["severity"]): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        icon: "text-red-400",
      };
    case "error":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        icon: "text-orange-400",
      };
    case "warning":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        icon: "text-amber-400",
      };
  }
}

/**
 * Check if an error is likely an Ollama connection issue.
 */
export function isConnectionError(error: OllamaError): boolean {
  return (
    error.code === "OLLAMA_OFFLINE" ||
    error.code === "CONNECTION_REFUSED" ||
    error.code === "NETWORK_ERROR"
  );
}

/**
 * Check if an error is a resource limitation.
 */
export function isResourceError(error: OllamaError): boolean {
  return (
    error.code === "VRAM_EXCEEDED" ||
    error.code === "CONTEXT_LENGTH_EXCEEDED" ||
    error.code === "INFERENCE_TIMEOUT"
  );
}

/**
 * Check if an error is model-related.
 */
export function isModelError(error: OllamaError): boolean {
  return (
    error.code === "MODEL_NOT_FOUND" ||
    error.code === "MODEL_LOADING"
  );
}
