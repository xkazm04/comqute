"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store } from "lucide-react";
import { usePoolStore } from "@/stores";
import {
  MarketplaceTabSwitcher,
  PoolDiscovery,
  LargeJobs,
  CreatePool,
  MyPool,
  type MarketplaceTab,
} from "./components";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PoolMarketplace() {
  const { myPoolId } = usePoolStore();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("discover");

  const hasPool = myPoolId !== null;

  const handlePoolCreated = () => {
    setActiveTab("my-pool");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Store className="w-6 h-6 text-cyan-400" />
            Pool Marketplace
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Form compute collectives and bid on large inference jobs
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <MarketplaceTabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPool={hasPool}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "discover" && <PoolDiscovery />}
          {activeTab === "jobs" && <LargeJobs />}
          {activeTab === "my-pool" && <MyPool />}
          {activeTab === "create" && <CreatePool onCreated={handlePoolCreated} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
