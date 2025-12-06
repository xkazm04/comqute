"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Store,
  Power,
  Play,
  Settings,
} from "lucide-react";
import { BinaryWatermark, CircuitPattern, HexGrid } from "@/app/ui/Backgrounds";
import { useWalletStore, useWorkerStore } from "@/stores";
import { useHealth, useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks";
import { formatQubic } from "@/lib/mock-utils";
import { GlassCard, ContentSkeleton, StatusIndicator, CommandPalette, ShortcutHint, type CommandItem } from "../shared";

// Re-export shared components for backward compatibility
export { GlassCard, ContentSkeleton } from "../shared";

// ============================================================================
// TYPES
// ============================================================================

export type TabId = "requester" | "worker" | "marketplace" | "explorer";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Cpu;
  description: string;
}

export const tabs: TabConfig[] = [
  { id: "requester", label: "Requester", icon: Cpu, description: "Submit prompts" },
  { id: "worker", label: "Worker", icon: Network, description: "Process jobs" },
  { id: "marketplace", label: "Pools", icon: Store, description: "Compute collectives" },
  { id: "explorer", label: "Explorer", icon: Globe, description: "Network stats" },
];

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
        <span className="body-medium text-white">Connect Wallet</span>
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
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center caption font-bold">
          {wallet.address.slice(2, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="caption-medium text-white truncate">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </div>
          <div className="micro text-emerald-400">{formatQubic(wallet.balance)} QUBIC</div>
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
    <div className="space-y-[var(--space-2)]">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] rounded-lg bg-zinc-900/30 border border-zinc-800/50"
      >
        <div className="flex items-center gap-[var(--space-2)]">
          <Activity className="w-4 h-4 text-zinc-500" />
          <span className="caption text-zinc-400">Ollama</span>
        </div>
        <span className={`caption-medium ${isOllamaOnline ? "text-emerald-400" : "text-red-400"}`}>
          {isOllamaOnline ? "Online" : "Offline"}
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] rounded-lg bg-zinc-900/30 border border-zinc-800/50"
      >
        <div className="flex items-center gap-[var(--space-2)]">
          <Zap className="w-4 h-4 text-zinc-500" />
          <span className="caption text-zinc-400">Tick Rate</span>
        </div>
        <span className="caption-medium text-white">2s</span>
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
        className="p-[var(--space-6)] border-b border-zinc-800/50"
      >
        <Link href="/opus" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-wider text-zinc-100">COMQUTE</span>
        </Link>
      </motion.div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-[var(--space-4)] space-y-[var(--space-1)]">
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
                w-full flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] rounded-lg body-medium transition-all duration-200
                ${isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="micro text-zinc-500">{tab.description}</div>
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
      <div className="p-[var(--space-4)] border-t border-zinc-800/50 space-y-[var(--space-4)]">
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
    <header className="h-16 flex items-center justify-between px-[var(--space-6)] border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm lg:bg-transparent">
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
      <div className="lg:hidden flex items-center gap-[var(--space-1)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-full caption-medium transition-colors ${
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
        className="flex items-center gap-[var(--space-4)]"
      >
        <StatusIndicator online={isOllamaOnline} label={isOllamaOnline ? "Network Optimal" : "Offline"} />

        {mounted && wallet.isConnected && (
          <div className="hidden md:flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="caption-medium text-white">{formatQubic(wallet.balance)}</span>
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
            <div className="p-[var(--space-6)] border-b border-zinc-800/50">
              <Link href="/opus" className="flex items-center gap-[var(--space-2)]" onClick={onClose}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold tracking-wider text-zinc-100">COMQUTE</span>
              </Link>
            </div>

            <nav className="p-[var(--space-4)] space-y-[var(--space-1)]">
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
                      w-full flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] rounded-lg body-medium transition-all
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

            <div className="absolute bottom-0 left-0 right-0 p-[var(--space-4)] border-t border-zinc-800/50">
              <WalletIndicator />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Re-export ContentWrapper from shared
export { ContentWrapper } from "../shared";

// ============================================================================
// TAB ICONS MAP
// ============================================================================

const TAB_ICONS: Record<TabId, typeof Cpu> = {
  requester: Cpu,
  worker: Network,
  marketplace: Store,
  explorer: Globe,
};

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Get worker store for toggle worker status action
  const { worker, setStatus } = useWorkerStore();

  // Toggle worker online/offline
  const toggleWorkerStatus = useCallback(() => {
    if (!worker) return;
    if (worker.status === "offline") {
      setStatus("online");
    } else if (worker.status === "online") {
      setStatus("offline");
    }
    // Don't toggle if busy
  }, [worker, setStatus]);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        id: "open-command-palette",
        key: "k",
        modifiers: ["meta"],
        description: "Open command palette",
        action: () => setIsCommandPaletteOpen(true),
        category: "General",
      },
      {
        id: "close-command-palette",
        key: "Escape",
        description: "Close command palette",
        action: () => setIsCommandPaletteOpen(false),
        enabled: isCommandPaletteOpen,
        category: "General",
      },
      {
        id: "tab-requester",
        key: "1",
        description: "Switch to Requester tab",
        action: () => onTabChange("requester"),
        category: "Navigation",
      },
      {
        id: "tab-worker",
        key: "2",
        description: "Switch to Worker tab",
        action: () => onTabChange("worker"),
        category: "Navigation",
      },
      {
        id: "tab-marketplace",
        key: "3",
        description: "Switch to Pools tab",
        action: () => onTabChange("marketplace"),
        category: "Navigation",
      },
      {
        id: "tab-explorer",
        key: "4",
        description: "Switch to Explorer tab",
        action: () => onTabChange("explorer"),
        category: "Navigation",
      },
      {
        id: "toggle-worker",
        key: "w",
        description: "Toggle worker status",
        action: toggleWorkerStatus,
        enabled: !!worker && worker.status !== "busy",
        category: "Worker",
      },
    ],
    [onTabChange, toggleWorkerStatus, worker, isCommandPaletteOpen]
  );

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });

  // Build command palette items from shortcuts + additional commands
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Navigation commands
      {
        id: "nav-requester",
        label: "Go to Requester",
        description: "Submit inference requests",
        icon: Cpu,
        shortcut: shortcuts.find((s) => s.id === "tab-requester"),
        action: () => onTabChange("requester"),
        category: "Navigation",
        keywords: ["prompt", "submit", "request", "inference"],
      },
      {
        id: "nav-worker",
        label: "Go to Worker",
        description: "Manage your worker node",
        icon: Network,
        shortcut: shortcuts.find((s) => s.id === "tab-worker"),
        action: () => onTabChange("worker"),
        category: "Navigation",
        keywords: ["node", "process", "jobs", "earn"],
      },
      {
        id: "nav-marketplace",
        label: "Go to Pools",
        description: "Browse compute collectives",
        icon: Store,
        shortcut: shortcuts.find((s) => s.id === "tab-marketplace"),
        action: () => onTabChange("marketplace"),
        category: "Navigation",
        keywords: ["pool", "collective", "group", "stake"],
      },
      {
        id: "nav-explorer",
        label: "Go to Explorer",
        description: "View network statistics",
        icon: Globe,
        shortcut: shortcuts.find((s) => s.id === "tab-explorer"),
        action: () => onTabChange("explorer"),
        category: "Navigation",
        keywords: ["network", "stats", "globe", "map"],
      },
    ];

    // Worker-specific commands
    if (worker) {
      if (worker.status === "offline") {
        items.push({
          id: "worker-go-online",
          label: "Go Online",
          description: "Start accepting jobs",
          icon: Power,
          shortcut: shortcuts.find((s) => s.id === "toggle-worker"),
          action: () => {
            setStatus("online");
            onTabChange("worker");
          },
          category: "Worker",
          keywords: ["online", "start", "activate", "enable"],
        });
      } else if (worker.status === "online") {
        items.push({
          id: "worker-go-offline",
          label: "Go Offline",
          description: "Stop accepting jobs",
          icon: Power,
          shortcut: shortcuts.find((s) => s.id === "toggle-worker"),
          action: () => {
            setStatus("offline");
          },
          category: "Worker",
          keywords: ["offline", "stop", "deactivate", "disable"],
        });
      }
    }

    return items;
  }, [shortcuts, worker, onTabChange, setStatus]);

  // Keyboard shortcut hints to display (exclude escape and palette-specific shortcuts)
  const displayedShortcuts = useMemo(
    () =>
      shortcuts.filter(
        (s) =>
          s.id !== "close-command-palette" &&
          s.id !== "open-command-palette"
      ),
    [shortcuts]
  );

  useEffect(() => {
    // Slight delay for initial load animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        placeholder="Type a command or search..."
      />

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
          <main className="flex-1 overflow-y-auto p-[var(--space-4)] lg:p-[var(--space-8)]">
            <motion.div
              className="mx-auto max-w-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Keyboard Shortcut Hint - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50 hidden lg:block" data-testid="shortcut-hint-container">
        <ShortcutHint shortcuts={displayedShortcuts} />
      </div>
    </div>
  );
}
