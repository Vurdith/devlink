"use client";

import { useDevicePerformance } from "@/hooks/useDevicePerformance";

interface PerformanceProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that detects low-end devices and applies performance optimizations
 * automatically. Adds CSS classes to <html> element:
 * - .low-end-device - For devices with low memory/CPU/network
 * - .battery-saver - When battery is low and not charging
 */
export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useDevicePerformance();
  return <>{children}</>;
}





