"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { OllamaErrorDisplay } from "./OllamaErrorDisplay";
import { parseOllamaError } from "../lib/ollama-errors";
import type { OllamaError } from "../lib/ollama-errors";

export interface OllamaErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: OllamaError, reset: () => void) => ReactNode;
  onError?: (error: OllamaError) => void;
  modelName?: string;
  "data-testid"?: string;
}

interface OllamaErrorBoundaryState {
  hasError: boolean;
  ollamaError: OllamaError | null;
}

/**
 * Error boundary specifically designed for Ollama-related operations.
 * Catches errors during inference and displays structured error information
 * with actionable guidance.
 */
export class OllamaErrorBoundary extends Component<
  OllamaErrorBoundaryProps,
  OllamaErrorBoundaryState
> {
  constructor(props: OllamaErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      ollamaError: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<OllamaErrorBoundaryState> {
    const ollamaError = parseOllamaError(error);
    return {
      hasError: true,
      ollamaError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const ollamaError = parseOllamaError(error);

    // Log with structured error code
    console.error(
      `[OllamaErrorBoundary] ${ollamaError.code}:`,
      ollamaError.message,
      {
        details: ollamaError.details,
        componentStack: errorInfo.componentStack,
      }
    );

    // Call optional error handler
    this.props.onError?.(ollamaError);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      ollamaError: null,
    });
  };

  render(): ReactNode {
    const { hasError, ollamaError } = this.state;
    const { children, fallback, modelName } = this.props;

    if (hasError && ollamaError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(ollamaError, this.handleReset);
      }

      // Default error display
      return (
        <OllamaErrorDisplay
          error={ollamaError}
          onRetry={ollamaError.recoverable ? this.handleReset : undefined}
          modelName={modelName}
          data-testid={this.props["data-testid"] || "ollama-error-boundary-fallback"}
        />
      );
    }

    return children;
  }
}
