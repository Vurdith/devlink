"use client";

import { useEffect, useState } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { Message } from "@/types/api";

/**
 * Hook for subscribing to new messages in a specific conversation.
 */
export function useMessagesRealtime(
  conversationId: string | undefined,
  onNewMessage: (message: Message) => void
) {
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
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage]);
}
