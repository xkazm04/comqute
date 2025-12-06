"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  Cpu,
  Network,
  Globe,
  Store,
  Power,
  Play,
  Settings,
  Keyboard,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";
import { useKeyboardShortcuts, formatShortcut, getModifierSymbol, type KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

// ============================================================================
// TYPES
// ============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: typeof Cpu;
  shortcut?: KeyboardShortcut;
  action: () => void;
  category?: string;
  keywords?: string[];
}

export interface CommandPaletteProps {
  commands: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

// ============================================================================
// FUZZY SEARCH
// ============================================================================

function fuzzyMatch(text: string, query: string): { matches: boolean; score: number } {
  if (!query) return { matches: true, score: 0 };

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) return { matches: true, score: 100 };

  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return { matches: true, score: 80 };

  // Contains query gets medium score
  if (textLower.includes(queryLower)) return { matches: true, score: 60 };

  // Fuzzy matching for typos
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
      consecutiveMatches++;
      score += consecutiveMatches * 2; // Bonus for consecutive matches
    } else {
      consecutiveMatches = 0;
    }
  }

  if (queryIndex === queryLower.length) {
    return { matches: true, score: score + 20 };
  }

  return { matches: false, score: 0 };
}

function searchCommands(commands: CommandItem[], query: string): CommandItem[] {
  if (!query.trim()) return commands;

  const results = commands
    .map((command) => {
      // Search in label
      const labelMatch = fuzzyMatch(command.label, query);

      // Search in description
      const descMatch = command.description
        ? fuzzyMatch(command.description, query)
        : { matches: false, score: 0 };

      // Search in keywords
      const keywordMatch = (command.keywords || [])
        .map((kw) => fuzzyMatch(kw, query))
        .reduce(
          (best, curr) => (curr.score > best.score ? curr : best),
          { matches: false, score: 0 }
        );

      // Search in category
      const categoryMatch = command.category
        ? fuzzyMatch(command.category, query)
        : { matches: false, score: 0 };

      const bestScore = Math.max(
        labelMatch.score * 1.5, // Label gets priority
        descMatch.score,
        keywordMatch.score * 1.2,
        categoryMatch.score
      );

      const matches = labelMatch.matches || descMatch.matches || keywordMatch.matches || categoryMatch.matches;

      return { command, score: bestScore, matches };
    })
    .filter((r) => r.matches)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.command);

  return results;
}

// ============================================================================
// COMMAND PALETTE COMPONENT
// ============================================================================

export function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = "Type a command or search...",
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(
    () => searchCommands(commands, query),
    [commands, query]
  );

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};

    filteredCommands.forEach((cmd) => {
      const category = cmd.category || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Flatten grouped commands for keyboard navigation
  const flatCommands = useMemo(
    () => Object.values(groupedCommands).flat(),
    [groupedCommands]
  );

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (command: CommandItem) => {
      onClose();
      // Small delay to allow modal to close smoothly
      setTimeout(() => command.action(), 50);
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (flatCommands[selectedIndex]) {
            executeCommand(flatCommands[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "Tab":
          event.preventDefault();
          if (event.shiftKey) {
            setSelectedIndex((i) => Math.max(i - 1, 0));
          } else {
            setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
          }
          break;
      }
    },
    [flatCommands, selectedIndex, executeCommand, onClose]
  );

  if (!isOpen) return null;

  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            data-testid="command-palette-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2"
            data-testid="command-palette"
          >
            <div className="mx-4 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                <Command className="h-5 w-5 text-cyan-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                  data-testid="command-palette-input"
                />
                <kbd className="hidden sm:flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div
                ref={listRef}
                className="max-h-[320px] overflow-y-auto p-2"
                data-testid="command-palette-list"
              >
                {flatCommands.length === 0 ? (
                  <div className="py-8 text-center" data-testid="command-palette-empty">
                    <Search className="mx-auto h-8 w-8 text-zinc-600" />
                    <p className="mt-2 text-sm text-zinc-500">No commands found</p>
                    <p className="text-xs text-zinc-600">Try a different search term</p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {category}
                      </div>
                      {categoryCommands.map((command) => {
                        globalIndex++;
                        const currentIndex = globalIndex;
                        const isSelected = selectedIndex === currentIndex;
                        const Icon = command.icon || Command;

                        return (
                          <button
                            key={command.id}
                            data-index={currentIndex}
                            onClick={() => executeCommand(command)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`
                              flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors
                              ${isSelected
                                ? "bg-cyan-500/10 text-white"
                                : "text-zinc-300 hover:bg-zinc-800/50"
                              }
                            `}
                            data-testid={`command-item-${command.id}`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                isSelected ? "bg-cyan-500/20" : "bg-zinc-800"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 ${
                                  isSelected ? "text-cyan-400" : "text-zinc-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {command.label}
                              </div>
                              {command.description && (
                                <div className="text-xs text-zinc-500 truncate">
                                  {command.description}
                                </div>
                              )}
                            </div>
                            {command.shortcut && (
                              <kbd className="hidden sm:flex items-center gap-0.5 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                                {formatShortcut(command.shortcut)}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer with hints */}
              <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <ArrowDown className="h-3 w-3" />
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" />
                    select
                  </span>
                </div>
                <span className="text-zinc-600">
                  {flatCommands.length} command{flatCommands.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// SHORTCUT HINT COMPONENT
// ============================================================================

export interface ShortcutHintProps {
  shortcuts: KeyboardShortcut[];
  className?: string;
}

export function ShortcutHint({ shortcuts, className = "" }: ShortcutHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayedShortcuts = shortcuts.slice(0, 5);
  const modSymbol = getModifierSymbol();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-400 hover:text-zinc-300"
        data-testid="shortcut-hint-toggle"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{modSymbol}K</span>
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-xl backdrop-blur-xl z-50"
            data-testid="shortcut-hint-popover"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-white">Keyboard Shortcuts</h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {displayedShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-zinc-400">{shortcut.description}</span>
                  <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-600">
                Press {modSymbol}K to open command palette
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
