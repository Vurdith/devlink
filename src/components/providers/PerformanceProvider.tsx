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

    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return <>{children}</>;
}

