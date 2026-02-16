"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
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
 * Provider that manages Rust Realtime connections and presence heartbeats.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  // Track connection status and subscribe to realtime events.
  useEffect(() => {
    const connection = connectRustRealtime({
      userId: session?.user?.id,
      onStatus: (status) => setIsConnected(status === "connected"),
      onEvent: (event) => {
        if (typeof window === "undefined") return;
        if (event.type === "presence") {
          window.dispatchEvent(new CustomEvent("devlink:presence-updated", { detail: event.payload }));
        }
        if (event.type === "message_receipt") {
          window.dispatchEvent(new CustomEvent("devlink:message-receipt", { detail: event.payload }));
        }
        if (event.type === "profile_update") {
          window.dispatchEvent(new CustomEvent("devlink:profile-updated", { detail: event.payload }));
        }
      },
    });

    if (!connection) {
      setIsConnected(false);
    }

    return () => connection?.close();
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

  // Reserved for typed channel subscriptions.
  const subscribe = useCallback((channelName: string, callback: (payload: unknown) => void) => {
    void channelName;
    void callback;
    return () => {};
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
