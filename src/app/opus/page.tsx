"use client";

import { useState, Suspense, lazy, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpusLayout, ContentWrapper, ContentSkeleton, type TabId } from "../features/opus/components/Layout";
import { RequesterDashboard } from "../features/opus/components/RequesterDashboard";
import { WorkerDashboard } from "../features/opus/components/WorkerDashboard";
import { NetworkExplorer } from "../features/opus/components/NetworkExplorer";

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
// TAB CONTENT
// ============================================================================

function TabContent({ tabId }: { tabId: TabId }) {
  return (
    <ContentWrapper tabId={tabId}>
      <DelayedContent delay={100}>
        {tabId === "requester" && <RequesterDashboard />}
        {tabId === "worker" && <WorkerDashboard />}
        {tabId === "explorer" && <NetworkExplorer />}
      </DelayedContent>
    </ContentWrapper>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OpusPage() {
  const [activeTab, setActiveTab] = useState<TabId>("requester");

  return (
    <OpusLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        <TabContent key={activeTab} tabId={activeTab} />
      </AnimatePresence>
    </OpusLayout>
  );
}
