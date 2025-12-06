"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, LogOut, Copy, Check } from "lucide-react";
import { useWalletStore } from "@/stores";
import { formatQubic, formatAddress } from "@/lib/mock-utils";

interface WalletButtonProps {
  variant?: "default" | "minimal" | "pill";
}

export function WalletButton({ variant = "default" }: WalletButtonProps) {
  const { wallet, connect, disconnect } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet.isConnected) {
    if (variant === "pill") {
      return (
        <motion.button
          onClick={connect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors"
        >
          Connect
        </motion.button>
      );
    }

    if (variant === "minimal") {
      return (
        <button
          onClick={connect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">Connect</span>
        </button>
      );
    }

    return (
      <motion.button
        onClick={connect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-colors"
      >
        <Wallet className="w-5 h-5" />
        <span>Connect Wallet</span>
      </motion.button>
    );
  }

  if (variant === "pill") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono">{formatQubic(wallet.balance)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-64 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">ADDRESS</span>
                  <button onClick={handleCopy} className="text-zinc-400 hover:text-white">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-sm text-white">{formatAddress(wallet.address)}</div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">BALANCE</span>
                  <span className="font-mono text-emerald-400">{formatQubic(wallet.balance)} QUBIC</span>
                </div>
                <button
                  onClick={() => { disconnect(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm text-zinc-400">{formatAddress(wallet.address)}</span>
        </div>
        <div className="h-4 w-px bg-zinc-700" />
        <span className="font-mono text-sm text-emerald-400">{formatQubic(wallet.balance)}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50"
            >
              <div className="space-y-4">
                {/* Address */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500">WALLET ADDRESS</span>
                    <button onClick={handleCopy} className="text-zinc-400 hover:text-white">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-white break-all">{wallet.address}</div>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Balance */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Balance</span>
                  <span className="font-mono text-lg text-emerald-400">{formatQubic(wallet.balance)} QUBIC</span>
                </div>

                {/* Recent transactions */}
                {wallet.transactions.length > 0 && (
                  <>
                    <div className="h-px bg-zinc-800" />
                    <div>
                      <span className="text-xs text-zinc-500">RECENT</span>
                      <div className="mt-2 space-y-2">
                        {wallet.transactions.slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">{tx.type}</span>
                            <span className={tx.amount > 0 ? "text-emerald-400" : "text-red-400"}>
                              {tx.amount > 0 ? "+" : ""}{formatQubic(Math.abs(tx.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-zinc-800" />

                {/* Disconnect */}
                <button
                  onClick={() => { disconnect(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
