import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MockWallet, MockTransaction, TransactionType } from "@/types";
import {
  DEFAULT_WALLET_ADDRESS,
  DEFAULT_INITIAL_BALANCE,
  TX_CONFIRMATION_DELAY,
  MAX_TRANSACTIONS,
} from "@/lib/constants";
import { generateMockTxHash, generateId } from "@/lib/mock-utils";

interface WalletState {
  wallet: MockWallet;
  connect: () => void;
  disconnect: () => void;
  deductBalance: (amount: number, jobId: string) => MockTransaction;
  addBalance: (amount: number, jobId: string, type?: TransactionType) => MockTransaction;
  confirmTransaction: (txId: string) => void;
  getTransaction: (txId: string) => MockTransaction | undefined;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: {
        address: DEFAULT_WALLET_ADDRESS,
        balance: DEFAULT_INITIAL_BALANCE,
        isConnected: false,
        transactions: [],
      },

      connect: () => {
        set((state) => ({
          wallet: {
            ...state.wallet,
            isConnected: true,
          },
        }));
      },

      disconnect: () => {
        set((state) => ({
          wallet: {
            ...state.wallet,
            isConnected: false,
          },
        }));
      },

      deductBalance: (amount: number, jobId: string) => {
        const transaction: MockTransaction = {
          id: generateId(),
          type: "payment",
          amount: -amount,
          timestamp: Date.now(),
          status: "pending",
          mockTxHash: generateMockTxHash(),
          jobId,
          description: `Payment for job ${jobId}`,
        };

        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance - amount,
            transactions: [transaction, ...state.wallet.transactions].slice(
              0,
              MAX_TRANSACTIONS
            ),
          },
        }));

        // Auto-confirm after delay
        setTimeout(() => {
          get().confirmTransaction(transaction.id);
        }, TX_CONFIRMATION_DELAY);

        return transaction;
      },

      addBalance: (amount: number, jobId: string, type: TransactionType = "refund") => {
        const transaction: MockTransaction = {
          id: generateId(),
          type,
          amount,
          timestamp: Date.now(),
          status: "pending",
          mockTxHash: generateMockTxHash(),
          jobId,
          description:
            type === "earning"
              ? `Earnings from job ${jobId}`
              : `Refund for job ${jobId}`,
        };

        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance + amount,
            transactions: [transaction, ...state.wallet.transactions].slice(
              0,
              MAX_TRANSACTIONS
            ),
          },
        }));

        // Auto-confirm after delay
        setTimeout(() => {
          get().confirmTransaction(transaction.id);
        }, TX_CONFIRMATION_DELAY);

        return transaction;
      },

      confirmTransaction: (txId: string) => {
        set((state) => ({
          wallet: {
            ...state.wallet,
            transactions: state.wallet.transactions.map((tx) =>
              tx.id === txId ? { ...tx, status: "confirmed" as const } : tx
            ),
          },
        }));
      },

      getTransaction: (txId: string) => {
        return get().wallet.transactions.find((tx) => tx.id === txId);
      },
    }),
    {
      name: "qubic-wallet-storage",
      partialize: (state) => ({
        wallet: {
          ...state.wallet,
          isConnected: false, // Don't persist connection state
        },
      }),
    }
  )
);
