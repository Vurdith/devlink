"use client";

import { cn } from "@/lib/cn";
import type { ComponentProps, ElementType } from "react";

interface AnalyticsCardProps<T extends ElementType> {
  as?: T;
  children: React.ReactNode;
  gradient?: boolean;
  delay?: number;
}

export const AnalyticsCard = <T extends ElementType = "div">({
  as,
  className,
  children,
  gradient = false,
  delay = 0,
  ...props
}: AnalyticsCardProps<T> &
  Omit<ComponentProps<T>, keyof AnalyticsCardProps<T>>) => {
  const Component = as ?? "div";
  
  return (
    <Component
      className={cn(
        "relative rounded-2xl border border-white/10 p-6 overflow-hidden animate-slide-up",
        gradient 
          ? "bg-gradient-to-br from-white/5 via-transparent to-[var(--accent)]/5" 
          : "glass",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
      {...props}
    >
      {children}
    </Component>
  );
};
