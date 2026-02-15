"use client";

import { useEffect } from "react";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { useRouter } from "next/navigation";

interface PerformanceProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that detects low-end devices and applies performance optimizations
 * automatically. Adds CSS classes to <html> element:
 * - .low-end-device - For devices with low memory/CPU/network
 * - .battery-saver - When battery is low and not charging
 * 
 * Also handles:
 * - Route prefetching on idle
 * - Critical resource preloading
 * - Network priority hints
 */
export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useDevicePerformance();
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prefetch common routes when browser is idle
    const prefetchRoutes = () => {
      const routes = ["/home", "/discover", "/search"];
      routes.forEach(route => {
        router.prefetch(route);
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (fn: () => void, opts: { timeout: number }) => void }).requestIdleCallback(prefetchRoutes, { timeout: 3000 });
    } else {
      setTimeout(prefetchRoutes, 2000);
    }

    // Preconnect to external resources
    const preconnectLinks = [
      "https://cdn.devlink.ink",
      "https://lh3.googleusercontent.com",
      "https://avatars.githubusercontent.com",
    ];

    preconnectLinks.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = href;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    });

    // Enable smooth scroll behavior after initial paint
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "smooth";
    });

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, [router]);
  
  return <>{children}</>;
}









