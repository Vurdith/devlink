"use client";

import { useEffect } from "react";

/**
 * Detects low-end devices and applies performance optimizations
 * 
 * Detection criteria:
 * - Device memory < 4GB
 * - Hardware concurrency (CPU cores) < 4
 * - Slow network connection (2G, slow-2g)
 * - Battery saver mode enabled
 * - Frame rate drops below threshold
 */
export function useDevicePerformance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isLowEnd = false;
    let isBatterySaver = false;

    // Check device memory (Chrome/Edge only)
    const nav = navigator as any;
    if (nav.deviceMemory && nav.deviceMemory < 4) {
      isLowEnd = true;
    }

    // Check CPU cores
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      isLowEnd = true;
    }

    // Check network connection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      const slowTypes = ["slow-2g", "2g"];
      if (slowTypes.includes(connection.effectiveType)) {
        isLowEnd = true;
      }
      
      // Data saver mode
      if (connection.saveData) {
        isLowEnd = true;
      }
    }

    // Check for mobile with small screen (budget phones)
    if (window.innerWidth <= 480 && "ontouchstart" in window) {
      // Additional check: if it's a small touch device, likely budget phone
      if (nav.deviceMemory && nav.deviceMemory <= 2) {
        isLowEnd = true;
      }
    }

    // Apply low-end optimizations
    if (isLowEnd) {
      document.documentElement.classList.add("low-end-device");
    }

    // Battery API (where supported)
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const checkBattery = () => {
          // Enable battery saver when charging is low and not plugged in
          if (!battery.charging && battery.level < 0.2) {
            document.documentElement.classList.add("battery-saver");
            isBatterySaver = true;
          } else if (isBatterySaver) {
            document.documentElement.classList.remove("battery-saver");
            isBatterySaver = false;
          }
        };

        checkBattery();
        battery.addEventListener("chargingchange", checkBattery);
        battery.addEventListener("levelchange", checkBattery);
      }).catch(() => {
        // Battery API not available, ignore
      });
    }

    // Frame rate detection (optional, runs only once on load)
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFrameRate = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // If FPS is consistently low, enable low-end mode
        if (fps < 30 && !isLowEnd) {
          document.documentElement.classList.add("low-end-device");
          isLowEnd = true;
        }

        // Stop measuring after first second
        return;
      }

      rafId = requestAnimationFrame(measureFrameRate);
    };

    // Only measure FPS for a short period on load
    rafId = requestAnimationFrame(measureFrameRate);

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}









