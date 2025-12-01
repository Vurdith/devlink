"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeContextType {
  isConnected: boolean;
  subscribe: (channel: string, callback: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  subscribe: () => () => {},
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * Provider that manages Supabase Realtime connections.
 * Handles automatic reconnection and provides subscription utilities.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [profileChannel, setProfileChannel] = useState<RealtimeChannel | null>(null);

  // Track connection status and subscribe to profile changes
  useEffect(() => {
    if (!isRealtimeAvailable() || !supabase) {
      return;
    }

    // Subscribe to global profile changes
    const channel = supabase
      .channel("global:profiles")
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "Profile",
        },
        (payload: any) => {
          console.log("[Realtime] Profile updated:", payload.new?.userId);
          
          // Dispatch custom event for components to listen
          if (typeof window !== "undefined" && payload.new) {
            window.dispatchEvent(
              new CustomEvent("devlink:profile-updated", {
                detail: { userId: payload.new.userId, profile: payload.new },
              })
            );
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (process.env.NODE_ENV === "development") {
          console.log("[Realtime] Connection status:", status);
        }
      });

    setProfileChannel(channel);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Subscribe to a custom broadcast channel
  const subscribe = useCallback((channelName: string, callback: (payload: any) => void) => {
    if (!isRealtimeAvailable() || !supabase) {
      return () => {};
    }

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "update" }, callback)
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to listen for profile updates for a specific user
 */
export function useProfileRealtimeListener(
  userId: string | undefined,
  onUpdate: (profile: any) => void
) {
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    const handler = (event: CustomEvent) => {
      if (event.detail.userId === userId) {
        onUpdate(event.detail.profile);
      }
    };

    window.addEventListener("devlink:profile-updated", handler as EventListener);
    return () => {
      window.removeEventListener("devlink:profile-updated", handler as EventListener);
    };
  }, [userId, onUpdate]);
}
