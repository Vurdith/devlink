"use client";

import { useEffect } from "react";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useDevicePerformance();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frameId = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "smooth";
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return <>{children}</>;
}

