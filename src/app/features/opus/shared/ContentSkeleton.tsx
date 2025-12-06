"use client";

import { Suspense, type ReactNode } from "react";

export interface ContentSkeletonProps {
  className?: string;
  "data-testid"?: string;
}

export function ContentSkeleton({
  className = "",
  "data-testid": testId,
}: ContentSkeletonProps) {
  return (
    <div className={`space-y-6 animate-pulse ${className}`} data-testid={testId}>
      <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
      <div className="h-4 w-48 bg-zinc-800/30 rounded" />
      <div className="h-64 bg-zinc-800/30 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-zinc-800/30 rounded-xl" />
        <div className="h-24 bg-zinc-800/30 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * SuspenseContent wraps content in a Suspense boundary with CSS skeleton-to-content
 * transition. The skeleton fades out naturally when content renders, without
 * artificial setTimeout delays.
 */
export interface SuspenseContentProps {
  children: ReactNode;
  fallback?: ReactNode;
  "data-testid"?: string;
}

export function SuspenseContent({
  children,
  fallback,
  "data-testid": testId,
}: SuspenseContentProps) {
  return (
    <Suspense
      fallback={
        <div
          className="animate-fade-in-fast"
          data-testid={testId ? `${testId}-skeleton` : undefined}
        >
          {fallback ?? <ContentSkeleton />}
        </div>
      }
    >
      <div
        className="animate-fade-in"
        data-testid={testId}
      >
        {children}
      </div>
    </Suspense>
  );
}
