// Worker status
export type WorkerStatus = "online" | "busy" | "offline";

// Hardware specifications
export interface WorkerHardware {
  gpu: string;
  vram: number; // in GB
  cpu: string;
  ram: number; // in GB
}

// Worker statistics
export interface WorkerStats {
  jobsCompleted: number;
  totalEarnings: number; // in QUBIC
  avgResponseTime: number; // in ms
  reputation: number; // 0-100
}

// Main worker interface
export interface Worker {
  id: string;
  address: string;
  name: string;
  status: WorkerStatus;
  hardware: WorkerHardware;
  stats: WorkerStats;
  supportedModels: string[];
  currentJobId?: string;
  stake: number; // staked QUBIC
  registeredAt: number;
  lastSeenAt: number;
}

// Worker registration request
export interface RegisterWorkerRequest {
  address: string;
  name: string;
  hardware: WorkerHardware;
  supportedModels: string[];
  stake: number;
}
