"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Network,
  Globe,
  Bell,
  Menu,
  X,
  Wallet,
  Activity,
  Zap,
} from "lucide-react";
import { BinaryWatermark, CircuitPattern, HexGrid } from "@/app/ui/Backgrounds";
import { useWalletStore } from "@/stores";
import { useHealth } from "@/hooks";
import { formatQubic } from "@/lib/mock-utils";

// ============================================================================
// TYPES
// ============================================================================

export type TabId = "requester" | "worker" | "explorer";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Cpu;
  description: string;
}

export const tabs: TabConfig[] = [
  { id: "requester", label: "Requester", icon: Cpu, description: "Submit prompts" },
  { id: "worker", label: "Worker", icon: Network, description: "Process jobs" },
  { id: "explorer", label: "Explorer", icon: Globe, description: "Network stats" },
];

// ============================================================================
// GLASS CARD
// ============================================================================

export function GlassCard({
  children,
  className = "",
  hover = false,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2 } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-zinc-900/60 backdrop-blur-xl
        border border-zinc-800/80
        ${padding ? "p-6" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function ContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
      <div className="h-4 w-48 bg-zinc-800/30 rounded" />
      <div className="h-64 bg-zinc-800/30 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-zinc-800/30 rounded-xl" />
        <div className="h-24 bg-zinc-800/30 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// STATUS INDICATOR
// ============================================================================

function StatusIndicator({ online, label }: { online: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`}
        animate={online ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className={`text-xs font-medium ${online ? "text-emerald-400" : "text-red-400"}`}>
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// WALLET INDICATOR
// ============================================================================

function WalletIndicator() {
  const { wallet, connect, disconnect } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-14 rounded-lg bg-zinc-900/30 border border-zinc-800/50 animate-pulse" />
    );
  }

  if (!wallet.isConnected) {
    return (
      <motion.button
        onClick={connect}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
      >
        <Wallet className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-medium text-white">Connect Wallet</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold">
          {wallet.address.slice(2, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </div>
          <div className="text-[10px] text-emerald-400">{formatQubic(wallet.balance)} QUBIC</div>
        </div>
        <button
          onClick={disconnect}
          className="text-zinc-500 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// QUICK STATS
// ============================================================================

function QuickStats() {
  const { isOllamaOnline } = useHealth();

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-400">Ollama</span>
        </div>
        <span className={`text-xs font-medium ${isOllamaOnline ? "text-emerald-400" : "text-red-400"}`}>
          {isOllamaOnline ? "Online" : "Offline"}
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-400">Tick Rate</span>
        </div>
        <span className="text-xs font-medium text-white">2s</span>
      </motion.div>
    </div>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================

function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-zinc-800/50"
      >
        <Link href="/opus" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-wider text-zinc-100">COMQUTE</span>
        </Link>
      </motion.div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ x: 4 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-[10px] text-zinc-500">{tab.description}</div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-zinc-800/50 space-y-4">
        <QuickStats />
        <WalletIndicator />
      </div>
    </aside>
  );
}

// ============================================================================
// HEADER
// ============================================================================

function Header({
  activeTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const { isOllamaOnline } = useHealth();
  const { wallet } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm lg:bg-transparent">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Tab Pills */}
      <div className="lg:hidden flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right side indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <StatusIndicator online={isOllamaOnline} label={isOllamaOnline ? "Network Optimal" : "Offline"} />

        {mounted && wallet.isConnected && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-white">{formatQubic(wallet.balance)}</span>
          </div>
        )}

        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 border border-zinc-950" />
        </button>
      </motion.div>
    </header>
  );
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 lg:hidden"
          >
            <div className="p-6 border-b border-zinc-800/50">
              <Link href="/opus" className="flex items-center gap-2" onClick={onClose}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold tracking-wider text-zinc-100">COMQUTE</span>
              </Link>
            </div>

            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800/50">
              <WalletIndicator />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// CONTENT WRAPPER WITH TRANSITIONS
// ============================================================================

export function ContentWrapper({
  children,
  tabId,
}: {
  children: React.ReactNode;
  tabId: TabId;
}) {
  return (
    <motion.div
      key={tabId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export function OpusLayout({
  children,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Slight delay for initial load animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Global Backgrounds with fade-in */}
      <motion.div
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <BinaryWatermark />
        <CircuitPattern />
        <HexGrid />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top left, rgba(34, 211, 238, 0.05) 0%, transparent 40%)",
          }}
        />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            activeTab={activeTab}
            onTabChange={onTabChange}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <motion.div
              className="mx-auto max-w-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
