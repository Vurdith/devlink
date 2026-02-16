type RustRealtimeEvent = {
  type: "presence" | "message_receipt" | "profile_update" | "notification";
  payload: Record<string, unknown>;
};

export type RustRealtimeSubscription = {
  close: () => void;
};

export function connectRustRealtime(options: {
  userId?: string;
  token?: string;
  onEvent: (event: RustRealtimeEvent) => void;
  onStatus?: (status: "connected" | "disconnected" | "error") => void;
}): RustRealtimeSubscription | null {
  const url = process.env.NEXT_PUBLIC_RUST_REALTIME_URL;
  if (!url || typeof window === "undefined") return null;

  const params = new URLSearchParams();
  if (options.userId) params.set("userId", options.userId);
  if (options.token) params.set("token", options.token);
  const wsUrl = `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;

  const socket = new WebSocket(wsUrl);

  socket.onopen = () => options.onStatus?.("connected");
  socket.onclose = () => options.onStatus?.("disconnected");
  socket.onerror = () => options.onStatus?.("error");
  socket.onmessage = (message) => {
    try {
      const parsed = JSON.parse(message.data) as RustRealtimeEvent;
      options.onEvent(parsed);
    } catch (error) {
      console.error("[RustRealtime] invalid payload:", error);
    }
  };

  return {
    close: () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    },
  };
}
