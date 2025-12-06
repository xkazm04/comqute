"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers?: ("meta" | "ctrl" | "alt" | "shift")[];
  description: string;
  action: () => void;
  enabled?: boolean;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

function getModifierKey(): "meta" | "ctrl" {
  // Use meta (Cmd) on Mac, Ctrl elsewhere
  if (typeof navigator !== "undefined") {
    return navigator.platform.toLowerCase().includes("mac") ? "meta" : "ctrl";
  }
  return "ctrl";
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Allow Escape and Cmd+K even in input fields
        if (event.key !== "Escape" && !(event.key === "k" && (event.metaKey || event.ctrlKey))) {
          return;
        }
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatch) continue;

        const modifiers = shortcut.modifiers || [];
        const modKey = getModifierKey();

        const modifiersMatch = modifiers.every((mod) => {
          if (mod === "meta" || mod === "ctrl") {
            return modKey === "meta" ? event.metaKey : event.ctrlKey;
          }
          if (mod === "alt") return event.altKey;
          if (mod === "shift") return event.shiftKey;
          return false;
        });

        // Check that no extra modifiers are pressed (unless we expect them)
        const hasExtraModifiers =
          (event.metaKey && !modifiers.includes("meta") && !modifiers.includes("ctrl")) ||
          (event.ctrlKey && !modifiers.includes("ctrl") && !modifiers.includes("meta")) ||
          (event.altKey && !modifiers.includes("alt")) ||
          (event.shiftKey && !modifiers.includes("shift"));

        if (modifiersMatch && !hasExtraModifiers) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown, enabled]);
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const modKey = getModifierKey();
  const parts: string[] = [];

  if (shortcut.modifiers?.includes("meta") || shortcut.modifiers?.includes("ctrl")) {
    parts.push(modKey === "meta" ? "⌘" : "Ctrl");
  }
  if (shortcut.modifiers?.includes("alt")) {
    parts.push(modKey === "meta" ? "⌥" : "Alt");
  }
  if (shortcut.modifiers?.includes("shift")) {
    parts.push("⇧");
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(modKey === "meta" ? "" : "+");
}

export function getModifierSymbol(): string {
  return getModifierKey() === "meta" ? "⌘" : "Ctrl+";
}
