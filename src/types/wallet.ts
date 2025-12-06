// Transaction types
export type TransactionType = "payment" | "refund" | "earning" | "stake";
export type TransactionStatus = "pending" | "confirmed" | "failed";

// Mock transaction record
export interface MockTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: number;
  status: TransactionStatus;
  mockTxHash: string;
  jobId?: string;
  description: string;
}

// Mock wallet state
export interface MockWallet {
  address: string;
  balance: number;
  isConnected: boolean;
  transactions: MockTransaction[];
}

// Wallet connection result
export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
}
