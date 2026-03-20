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

    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "smooth";
    });

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);
  
  return <>{children}</>;
}









