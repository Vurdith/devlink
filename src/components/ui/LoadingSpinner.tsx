"use client";

import { cn } from "@/lib/cn";
import { memo } from "react";
import { skeleton, surface } from "./design-system";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const LoadingSpinner = memo(function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-2 border-white/15 border-t-[var(--color-accent-2)]",
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

export const LoadingSkeleton = memo(function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={skeleton(className)} />;
});

export const PostSkeleton = memo(function PostSkeleton() {
  return (
    <div className={surface("panelMuted", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
      <div className="mb-5 flex min-w-0 items-center gap-3">
        <div className={skeleton("h-11 w-11 shrink-0 rounded-full")} />
        <div className="min-w-0 flex-1">
          <div className={skeleton("mb-2 h-4 w-32")} />
          <div className={skeleton("h-3 w-24")} />
        </div>
      </div>
      <div className="mb-5 space-y-2">
        <div className={skeleton("h-4 w-full")} />
        <div className={skeleton("h-4 w-5/6")} />
        <div className={skeleton("h-4 w-3/5")} />
      </div>
      <div className={skeleton("mb-5 h-36 w-full rounded-xl")} />
      <div className="flex flex-wrap gap-3">
        <div className={skeleton("h-8 w-20 rounded-lg")} />
        <div className={skeleton("h-8 w-20 rounded-lg")} />
        <div className={skeleton("h-8 w-20 rounded-lg")} />
      </div>
    </div>
  );
});

export const FeedSkeleton = memo(function FeedSkeleton() {
  return (
    <div className="space-y-5">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
});
