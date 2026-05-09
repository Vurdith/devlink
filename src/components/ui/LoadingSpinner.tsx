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
    <div className={surface("panel", "noise-overlay relative overflow-hidden p-6")}>
      <div className="flex items-center gap-3 mb-4">
        <div className={skeleton("h-10 w-10 rounded-full")} />
        <div className="flex-1">
          <div className={skeleton("mb-2 h-4 w-24")} />
          <div className={skeleton("h-3 w-16")} />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className={skeleton("h-4 w-full")} />
        <div className={skeleton("h-4 w-3/4")} />
        <div className={skeleton("h-4 w-1/2")} />
      </div>
      <div className="flex gap-4">
        <div className={skeleton("h-8 w-16 rounded-xl")} />
        <div className={skeleton("h-8 w-16 rounded-xl")} />
        <div className={skeleton("h-8 w-16 rounded-xl")} />
      </div>
    </div>
  );
});

export const FeedSkeleton = memo(function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
});
