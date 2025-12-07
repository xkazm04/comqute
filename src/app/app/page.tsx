"use client";

import { memo, useState, useCallback } from "react";
import { OpusLayout, ContentWrapper, type TabId } from "../features/opus/components/Layout";
import { SuspenseContent } from "../features/opus/shared";
import { RequesterDashboard } from "../features/developer/RequesterDashboard";
import { WorkerDashboard } from "../features/worker/WorkerDashboard";
import { NetworkExplorer } from "../features/explorer/NetworkExplorer";
import { PoolMarketplace } from "../features/marketplace/PoolMarketplace";
import { TabErrorBoundary } from "../features/opus/shared/TabErrorBoundary";

// ============================================================================
// TAB COMPONENT NAMES (for error boundary reporting)
// ============================================================================

const TAB_COMPONENT_NAMES: Record<TabId, string> = {
  requester: "RequesterDashboard",
  worker: "WorkerDashboard",
  marketplace: "PoolMarketplace",
  explorer: "NetworkExplorer",
};

// ============================================================================
// MEMOIZED TAB CONTENT COMPONENTS
// Prevents re-renders of hidden tabs when active tab changes
// ============================================================================

const MemoizedRequesterDashboard = memo(RequesterDashboard);
MemoizedRequesterDashboard.displayName = "MemoizedRequesterDashboard";

const MemoizedWorkerDashboard = memo(WorkerDashboard);
MemoizedWorkerDashboard.displayName = "MemoizedWorkerDashboard";

const MemoizedPoolMarketplace = memo(PoolMarketplace);
MemoizedPoolMarketplace.displayName = "MemoizedPoolMarketplace";

const MemoizedNetworkExplorer = memo(NetworkExplorer);
MemoizedNetworkExplorer.displayName = "MemoizedNetworkExplorer";

// ============================================================================
// TAB PANEL - Renders content with visibility control
// ============================================================================

interface TabPanelProps {
  tabId: TabId;
  isActive: boolean;
  hasBeenMounted: boolean;
}

function TabPanel({ tabId, isActive, hasBeenMounted }: TabPanelProps) {
  // Only render content if it's been mounted at least once (lazy mounting)
  if (!hasBeenMounted) {
    return null;
  }

  return (
    <div
      data-testid={`tab-panel-${tabId}`}
      style={{ display: isActive ? "block" : "none" }}
      aria-hidden={!isActive}
    >
      <ContentWrapper tabId={tabId} isActive={isActive}>
        <TabErrorBoundary componentName={TAB_COMPONENT_NAMES[tabId]}>
          <SuspenseContent data-testid={`tab-content-${tabId}`}>
            {tabId === "requester" && <MemoizedRequesterDashboard />}
            {tabId === "worker" && <MemoizedWorkerDashboard />}
            {tabId === "marketplace" && <MemoizedPoolMarketplace />}
            {tabId === "explorer" && <MemoizedNetworkExplorer />}
          </SuspenseContent>
        </TabErrorBoundary>
      </ContentWrapper>
    </div>
  );
}

// ============================================================================
// TAB IDS for iteration
// ============================================================================

const ALL_TAB_IDS: TabId[] = ["requester", "worker", "marketplace", "explorer"];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OpusPage() {
  const [activeTab, setActiveTab] = useState<TabId>("requester");
  // Track which tabs have been mounted using state instead of ref to trigger re-renders
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(new Set(["requester"]));

  // Handle tab changes and ensure new tabs are marked as mounted
  const handleTabChange = useCallback((newTab: TabId) => {
    setMountedTabs((prev) => {
      if (prev.has(newTab)) return prev;
      const next = new Set(prev);
      next.add(newTab);
      return next;
    });
    setActiveTab(newTab);
  }, []);

  return (
    <OpusLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {ALL_TAB_IDS.map((tabId) => (
        <TabPanel
          key={tabId}
          tabId={tabId}
          isActive={activeTab === tabId}
          hasBeenMounted={mountedTabs.has(tabId)}
        />
      ))}
    </OpusLayout>
  );
}
