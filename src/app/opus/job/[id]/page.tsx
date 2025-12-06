"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BinaryWatermark, CircuitPattern, HexGrid } from "@/app/ui/Backgrounds";
import { JobDetail } from "@/app/features/opus/components/JobDetail";
import { ContentSkeleton } from "@/app/features/opus/components/Layout";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

function DelayedContent({
  children,
  delay = 100,
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

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Global Backgrounds */}
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

      {/* Header */}
      <header className="relative z-20 h-16 flex items-center px-6 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <Link href="/opus" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-wider text-zinc-100">COMQUTE</span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 p-4 lg:p-8">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DelayedContent>
            <JobDetail jobId={jobId} />
          </DelayedContent>
        </motion.div>
      </main>
    </div>
  );
}
