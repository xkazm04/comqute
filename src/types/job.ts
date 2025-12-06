// Job status lifecycle
export type JobStatus =
  | "pending"
  | "assigned"
  | "running"
  | "streaming"
  | "complete"
  | "failed"
  | "cancelled";

// Parameters for inference
export interface JobParameters {
  maxTokens: number;
  temperature: number;
  topP: number;
  seed?: number;
}

// Main job interface
export interface Job {
  id: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters: JobParameters;
  status: JobStatus;
  requester: string;
  assignedWorker?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  inputTokens: number;
  outputTokens: number;
  output: string;
  estimatedCost: number;
  actualCost?: number;
  mockTxHash: string;
  mockBlockNumber: number;
  error?: string;
}

// Real-time streaming update
export interface JobStreamUpdate {
  jobId: string;
  token: string;
  tokenIndex: number;
  done: boolean;
  totalTokens?: number;
}

// Request to create a new job
export interface CreateJobRequest {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters: Partial<JobParameters>;
  requester: string;
}

// Default parameters
export const DEFAULT_JOB_PARAMETERS: JobParameters = {
  maxTokens: 500,
  temperature: 0.7,
  topP: 0.9,
};
