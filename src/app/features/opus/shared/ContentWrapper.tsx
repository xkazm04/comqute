"use client";

import { motion } from "framer-motion";

export type TabId = "requester" | "worker" | "marketplace" | "explorer";

export interface ContentWrapperProps {
  children: React.ReactNode;
  tabId: TabId | string;
  /** Whether this tab is currently active/visible */
  isActive?: boolean;
}

export function ContentWrapper({ children, tabId, isActive = true }: ContentWrapperProps) {
  return (
    <motion.div
      key={tabId}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 20
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
