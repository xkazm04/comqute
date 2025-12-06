"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Target, X } from "lucide-react";
import { LargeJobCard } from "./LargeJobCard";
import { GlassCard } from "../../opus/shared";
import { usePoolStore } from "@/stores";
import { formatQubic } from "@/lib/mock-utils";
import type { LargeInferenceJob } from "@/types";

// ============================================================================
// LARGE JOBS
// ============================================================================

export function LargeJobs() {
  const { largeJobs, myPoolId, getPoolById, submitBid, initializePools } = usePoolStore();
  const [bidDialogJob, setBidDialogJob] = useState<LargeInferenceJob | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    initializePools();
  }, [initializePools]);

  // Update current time periodically for deadline calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const myPool = myPoolId ? getPoolById(myPoolId) : null;
  const openJobs = largeJobs.filter((j) => j.status === "open" || j.status === "bidding");

  const handleSubmitBid = () => {
    if (!bidDialogJob || !myPoolId || !bidAmount || !estimatedTime) return;

    submitBid(
      myPoolId,
      bidDialogJob.id,
      parseInt(bidAmount) * 1000000, // Convert to QUBIC
      parseInt(estimatedTime) * 1000 // Convert to ms
    );
    setBidDialogJob(null);
    setBidAmount("");
    setEstimatedTime("");
  };

  const canBid = myPool != null && myPool.status === "active";

  return (
    <div className="space-y-6">
      {/* Info banner if no pool */}
      {!myPool && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-400 font-medium">Join or create a pool to bid</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Large inference jobs require compute pools to place bids
            </p>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Available Large Jobs
          </h3>
        </div>

        <div className="space-y-4">
          {openJobs.map((job) => (
            <LargeJobCard
              key={job.id}
              job={job}
              onBid={() => setBidDialogJob(job)}
              canBid={canBid}
              currentTime={currentTime}
            />
          ))}

          {openJobs.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No large jobs available</p>
              <p className="text-zinc-600 text-xs mt-1">Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Bid Dialog */}
      <AnimatePresence>
        {bidDialogJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBidDialogJob(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Place Bid</h3>
                  <button
                    onClick={() => setBidDialogJob(null)}
                    data-testid="close-bid-dialog-btn"
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">Your Bid (QUBIC millions)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="e.g. 25 for 25M QUBIC"
                      data-testid="bid-amount-input"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Max budget: {formatQubic(bidDialogJob.maxBudget)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">Estimated Time (seconds)</label>
                    <input
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 60"
                      data-testid="bid-time-input"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <button
                    onClick={handleSubmitBid}
                    disabled={!bidAmount || !estimatedTime}
                    data-testid="submit-bid-btn"
                    className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    Submit Bid
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
