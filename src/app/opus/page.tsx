"use client";

import { useState, useEffect, memo, useRef } from "react";
import { OpusLayout, ContentWrapper, ContentSkeleton, type TabId } from "../features/opus/components/Layout";
import { RequesterDashboard } from "../features/opus/components/RequesterDashboard";
import { WorkerDashboard } from "../features/opus/components/WorkerDashboard";
import { NetworkExplorer } from "../features/opus/components/NetworkExplorer";
import { PoolMarketplace } from "../features/opus/components/PoolMarketplace";
import { TabErrorBoundary } from "../features/opus/shared/TabErrorBoundary";

// ============================================================================
// DELAYED CONTENT LOADER
// ============================================================================

function DelayedContent({
  children,
  delay = 150,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return <ContentSkeleton />;
  }

  return <>{children}</>;
}

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
          <DelayedContent delay={100}>
            {tabId === "requester" && <MemoizedRequesterDashboard />}
            {tabId === "worker" && <MemoizedWorkerDashboard />}
            {tabId === "marketplace" && <MemoizedPoolMarketplace />}
            {tabId === "explorer" && <MemoizedNetworkExplorer />}
          </DelayedContent>
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
  // Track which tabs have been mounted (lazy loading - only mount when first visited)
  const mountedTabsRef = useRef<Set<TabId>>(new Set(["requester"]));

  // When tab changes, mark it as mounted
  useEffect(() => {
    mountedTabsRef.current.add(activeTab);
  }, [activeTab]);

  return (
    <OpusLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {ALL_TAB_IDS.map((tabId) => (
        <TabPanel
          key={tabId}
          tabId={tabId}
          isActive={activeTab === tabId}
          hasBeenMounted={mountedTabsRef.current.has(tabId)}
        />
      ))}
    </OpusLayout>
  );
}
