"use client";

import { useEffect, useRef } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { Message } from "@/types/api";

/**
 * Hook for subscribing to new messages in a specific conversation.
 */
export function useMessagesRealtime(
  conversationId: string | undefined,
  onNewMessage: (message: Message) => void
) {
  // Store callback in ref to avoid subscription churn
  const onNewMessageRef = useRef(onNewMessage);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  });

  useEffect(() => {
    if (!conversationId || !isRealtimeAvailable() || !supabase) {
      return;
    }

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessageRef.current(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [conversationId]);
}
