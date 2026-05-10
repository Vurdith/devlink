"use client";

import { useEffect } from "react";
import { scheduleAfterInitialLoad } from "@/lib/browser/idle";

type BatteryManagerLite = {
  charging: boolean;
  level: number;
  addEventListener: (event: "chargingchange" | "levelchange", handler: () => void) => void;
  removeEventListener: (event: "chargingchange" | "levelchange", handler: () => void) => void;
};

export function useDevicePerformance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;
    const cancelSchedule = scheduleAfterInitialLoad(() => {
      let isLowEnd = false;
      let isBatterySaver = false;
      let didCancel = false;
      let cleanupBatteryListeners: (() => void) | undefined;

      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { effectiveType?: string; saveData?: boolean };
        mozConnection?: { effectiveType?: string; saveData?: boolean };
        webkitConnection?: { effectiveType?: string; saveData?: boolean };
        getBattery?: () => Promise<BatteryManagerLite>;
      };

      if (nav.deviceMemory && nav.deviceMemory < 4) {
        isLowEnd = true;
      }

      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        isLowEnd = true;
      }

      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (connection) {
        const slowTypes = ["slow-2g", "2g"];
        if (slowTypes.includes(connection.effectiveType ?? "")) {
          isLowEnd = true;
        }

        if (connection.saveData) {
          isLowEnd = true;
        }
      }

      if (window.innerWidth <= 480 && "ontouchstart" in window) {
        if (nav.deviceMemory && nav.deviceMemory <= 2) {
          isLowEnd = true;
        }
      }

      if (isLowEnd) {
        document.documentElement.classList.add("low-end-device");
      }

      if (nav.getBattery) {
        nav.getBattery().then((battery) => {
          if (didCancel) return;

          const checkBattery = () => {
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
          cleanupBatteryListeners = () => {
            battery.removeEventListener("chargingchange", checkBattery);
            battery.removeEventListener("levelchange", checkBattery);
          };
        }).catch(() => {
          // Unsupported Battery API should not block rendering.
        });
      }

      cleanup = () => {
        didCancel = true;
        cleanupBatteryListeners?.();
      };
    }, 2500);

    return () => {
      cancelSchedule();
      cleanup?.();
    };
  }, []);
}

export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

