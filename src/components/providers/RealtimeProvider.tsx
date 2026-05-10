"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { connectRustRealtime } from "@/lib/realtime/rust-realtime-client";
import { scheduleAfterInitialLoad } from "@/lib/browser/idle";

interface SessionUser {
  id: string;
}

interface Session {
  user?: SessionUser;
}

interface RealtimeContextType {
  isConnected: boolean;
  subscribe: (channel: string, callback: (payload: unknown) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  subscribe: () => () => {},
});

const EVENT_NAMES = {
  presence: "devlink:presence-updated",
  message_receipt: "devlink:message-receipt",
  profile_update: "devlink:profile-updated",
} as const;

export function useRealtime() {
  return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export function RealtimeProvider({ children, session }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const userId = session?.user?.id;

  const handleStatus = useCallback((status: "connected" | "disconnected" | "error") => {
    setIsConnected(status === "connected");
  }, []);

  const handleEvent = useCallback((event: { type: string; payload: Record<string, unknown> }) => {
    const eventName = EVENT_NAMES[event.type as keyof typeof EVENT_NAMES];
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName, { detail: event.payload }));
    }
  }, []);

  useEffect(() => {
    let connection: ReturnType<typeof connectRustRealtime> | null = null;

    const cancelSchedule = scheduleAfterInitialLoad(() => {
      connection = connectRustRealtime({
        userId,
        onStatus: handleStatus,
        onEvent: handleEvent,
      });

      if (!connection) {
        setIsConnected(false);
      }
    });

    return () => {
      cancelSchedule();
      connection?.close();
    };
  }, [handleEvent, handleStatus, userId]);

  useEffect(() => {
    if (!userId) return;

    let stopped = false;
    let interval: ReturnType<typeof setInterval> | undefined;
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

    const cancelSchedule = scheduleAfterInitialLoad(() => {
      void heartbeat();
      interval = setInterval(heartbeat, 25_000);
    }, 2000);

    const onUnload = () => {
      navigator.sendBeacon?.("/api/realtime/presence");
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      stopped = true;
      cancelSchedule();
      if (interval) clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      void fetch("/api/realtime/presence", {
        method: "DELETE",
        cache: "no-store",
      }).catch(() => undefined);
    };
  }, [userId]);

  const subscribe = useCallback((channelName: string, callback: (payload: unknown) => void) => {
    void channelName;
    void callback;
    return () => {};
  }, []);
  const value = useMemo(() => ({ isConnected, subscribe }), [isConnected, subscribe]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

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
