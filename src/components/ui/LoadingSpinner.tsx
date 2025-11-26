"use client";

import { cn } from "@/lib/cn";
import { memo } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8"
};

export const LoadingSpinner = memo(function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-purple-500",
        sizeClasses[size],
        className
      )}
    />
  );
});

export const LoadingSkeleton = memo(function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-white/10 rounded", className)} />
  );
});

export const PostSkeleton = memo(function PostSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 mb-2 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex gap-4">
        <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
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
