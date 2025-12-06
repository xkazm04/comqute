"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp } from "lucide-react";

export interface TabErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  onReset?: () => void;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
  copied: boolean;
}

export class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<TabErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console for development debugging
    console.error(
      `[TabErrorBoundary] Error in ${this.props.componentName || "component"}:`,
      error,
      errorInfo
    );
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
      copied: false,
    });
    this.props.onReset?.();
  };

  toggleStack = (): void => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  copyErrorDetails = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const { componentName } = this.props;

    const errorDetails = [
      `Component: ${componentName || "Unknown"}`,
      `Error: ${error?.message || "Unknown error"}`,
      `Stack: ${error?.stack || "No stack trace"}`,
      `Component Stack: ${errorInfo?.componentStack || "No component stack"}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      console.error("Failed to copy error details");
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo, showStack, copied } = this.state;
      const { componentName } = this.props;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-red-500/30 p-6"
          data-testid="tab-error-boundary-fallback"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.05] via-transparent to-orange-500/[0.05] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Render Error
                </h3>
                <p className="text-sm text-zinc-400">
                  {componentName ? (
                    <>
                      An error occurred in <span className="text-red-400 font-mono">{componentName}</span>
                    </>
                  ) : (
                    "An error occurred while rendering this component"
                  )}
                </p>
              </div>
            </div>

            {/* Error message */}
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
              <p className="text-sm font-mono text-red-300 break-all">
                {error?.message || "Unknown error"}
              </p>
            </div>

            {/* Stack trace toggle */}
            <button
              onClick={this.toggleStack}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              data-testid="toggle-stack-trace-btn"
            >
              {showStack ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showStack ? "Hide" : "Show"} stack trace
            </button>

            {/* Stack trace */}
            {showStack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 max-h-64 overflow-auto"
                data-testid="stack-trace-container"
              >
                <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap break-all">
                  {error?.stack || "No stack trace available"}
                </pre>
                {errorInfo?.componentStack && (
                  <>
                    <div className="my-3 border-t border-zinc-800" />
                    <p className="text-xs font-medium text-zinc-500 mb-2">Component Stack:</p>
                    <pre className="text-xs font-mono text-zinc-500 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-colors"
                data-testid="retry-render-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.copyErrorDetails}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
                data-testid="copy-error-btn"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Details"}
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-zinc-500">
              This error has been logged to the console. Check developer tools for more details.
            </p>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
