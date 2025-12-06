"use client";

import { Search, Target, Users, Plus } from "lucide-react";

// ============================================================================
// TAB SWITCHER
// ============================================================================

export type MarketplaceTab = "discover" | "jobs" | "my-pool" | "create";

interface MarketplaceTabSwitcherProps {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  hasPool: boolean;
}

export function MarketplaceTabSwitcher({
  activeTab,
  onTabChange,
  hasPool,
}: MarketplaceTabSwitcherProps) {
  const tabs = [
    { id: "discover" as MarketplaceTab, label: "Discover Pools", icon: Search },
    { id: "jobs" as MarketplaceTab, label: "Large Jobs", icon: Target },
    {
      id: hasPool ? "my-pool" : "create",
      label: hasPool ? "My Pool" : "Create Pool",
      icon: hasPool ? Users : Plus,
    } as { id: MarketplaceTab; label: string; icon: typeof Search },
  ];

  return (
    <div
      className="flex gap-2 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800"
      data-testid="marketplace-tab-switcher"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-testid={`marketplace-tab-${tab.id}`}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all
              ${isActive
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
