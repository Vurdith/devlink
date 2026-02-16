"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { connectRustRealtime } from "@/lib/realtime/rust-realtime-client";

interface RealtimeContextType {
  isConnected: boolean;
  subscribe: (channel: string, callback: (payload: unknown) => void) => () => void;
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
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [profileChannel, setProfileChannel] = useState<RealtimeChannel | null>(null);

  // Track connection status and subscribe to profile changes
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REALTIME_PROVIDER === "rust") {
      const connection = connectRustRealtime({
        userId: session?.user?.id,
        onStatus: (status) => setIsConnected(status === "connected"),
        onEvent: (event) => {
          if (typeof window === "undefined") return;
          if (event.type === "presence") {
            window.dispatchEvent(
              new CustomEvent("devlink:presence-updated", { detail: event.payload })
            );
          }
          if (event.type === "message_receipt") {
            window.dispatchEvent(
              new CustomEvent("devlink:message-receipt", { detail: event.payload })
            );
          }
          if (event.type === "profile_update") {
            window.dispatchEvent(
              new CustomEvent("devlink:profile-updated", { detail: event.payload })
            );
          }
        },
      });

      return () => connection?.close();
    }

    if (!isRealtimeAvailable() || !supabase) {
      return;
    }

    // Subscribe to global profile changes
    const channel = supabase
      .channel("global:profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Profile",
        },
        (payload: { new?: { userId?: string }; old?: unknown }) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[Realtime] Profile updated:", payload.new?.userId);
          }
          
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
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    let stopped = false;
    const heartbeat = async () => {
      if (stopped) return;
      try {
        await fetch("/api/realtime/presence", {
          method: "PUT",
          cache: "no-store",
        });
      } catch {
        // Presence is best effort.
      }
    };

    void heartbeat();
    const interval = setInterval(heartbeat, 25_000);
    const onUnload = () => {
      navigator.sendBeacon?.("/api/realtime/presence");
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      stopped = true;
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      void fetch("/api/realtime/presence", {
        method: "DELETE",
        cache: "no-store",
      }).catch(() => undefined);
    };
  }, [session?.user?.id]);

  // Subscribe to a custom broadcast channel
  const subscribe = useCallback((channelName: string, callback: (payload: unknown) => void) => {
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
  onUpdate: (profile: Record<string, unknown>) => void
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
