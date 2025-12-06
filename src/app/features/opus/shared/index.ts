// Flow Diagram Types (re-exported from components for external diagram configuration)
export {
  // Main config interface for bundling diagram data
  type FlowDiagramConfig,
  // Component types
  type FlowNode,
  type FlowZone,
  type FlowConnection,
  type FlowStep,
  // Components
  FlowDiagram,
  WorkerFlowDiagram,
  RequesterFlowDiagram,
} from "../components/FlowDiagram";

// UI Primitives
export { GlassCard } from "./GlassCard";
export type { GlassCardProps } from "./GlassCard";

export { EmptyStateIllustration } from "./EmptyStateIllustration";
export type { EmptyStateIllustrationProps, EmptyStateVariant } from "./EmptyStateIllustration";

export { ContentSkeleton } from "./ContentSkeleton";
export type { ContentSkeletonProps } from "./ContentSkeleton";

export { StatusBadge } from "./StatusBadge";
export type { StatusBadgeProps } from "./StatusBadge";

export { StatItem } from "./StatItem";
export type { StatItemProps } from "./StatItem";

export { Toggle, LabeledToggle } from "./Toggle";
export type { ToggleProps, LabeledToggleProps } from "./Toggle";

export { StatusIndicator } from "./StatusIndicator";
export type { StatusIndicatorProps } from "./StatusIndicator";

export { ContentWrapper } from "./ContentWrapper";
export type { ContentWrapperProps, TabId } from "./ContentWrapper";

export { TabErrorBoundary } from "./TabErrorBoundary";
export type { TabErrorBoundaryProps } from "./TabErrorBoundary";

export { InfoRow } from "./InfoRow";
export type { InfoRowProps } from "./InfoRow";

export { OllamaErrorBoundary } from "./OllamaErrorBoundary";
export type { OllamaErrorBoundaryProps } from "./OllamaErrorBoundary";

export { OllamaErrorDisplay } from "./OllamaErrorDisplay";
export type { OllamaErrorDisplayProps } from "./OllamaErrorDisplay";

export { CommandPalette, ShortcutHint } from "./CommandPalette";
export type { CommandItem, CommandPaletteProps, ShortcutHintProps } from "./CommandPalette";

// Feature Components
export { NetworkStats } from "./NetworkStats";
export { ModelSelector } from "./ModelSelector";
export { PromptInput } from "./PromptInput";
export { StreamingOutput } from "./StreamingOutput";
export { WalletButton } from "./WalletButton";

// Job Pipeline (re-exported from lib for convenience)
export {
  // Hooks
  useJobPipeline,
  useRequesterPipeline,
  useWorkerPipeline,
  // Types
  type JobPhase,
  type JobRole,
  type RequesterJobView,
  type WorkerJobView,
  type PipelineStats,
  type RequesterPipelineState,
  type WorkerPipelineState,
  type TransitionResult,
  type JobPairing,
  type TransitionValidationResult,
  // Utilities
  getPhase,
  isTerminal,
  isProcessing,
  isQueued,
  STATUS_TO_PHASE,
  VALID_TRANSITIONS,
  // State Machine (explicit validation)
  JOB_STATE_MACHINE,
  validateTransition,
  isValidTransition,
  isTerminalStatus,
  getValidTransitionsFrom,
  getTransitionTrigger,
  getStatusDescription,
  TERMINAL_STATES,
  PROCESSING_STATES,
  QUEUED_STATES,
  isTerminalState,
  isActivelyProcessing,
  isQueuedStatus,
  canBeCancelled,
  canBeClaimed,
} from "../lib/job-pipeline";

// Ollama Error Handling (re-exported from lib for convenience)
export {
  // Types
  type OllamaErrorCode,
  type OllamaError,
  // Error definitions
  OLLAMA_ERRORS,
  // Utilities
  parseOllamaError,
  getErrorSeverityStyles,
  isConnectionError,
  isResourceError,
  isModelError,
} from "../lib/ollama-errors";
