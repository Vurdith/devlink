"use client";

import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-700/50 rounded", className)} />
  );
}

export function PostSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <LoadingSkeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <LoadingSkeleton className="h-4 w-24 mb-2" />
          <LoadingSkeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-4">
        <LoadingSkeleton className="h-8 w-16" />
        <LoadingSkeleton className="h-8 w-16" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}










