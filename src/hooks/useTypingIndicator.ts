"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface TypingUser {
  id: string;
  username: string;
}

/**
 * Hook for broadcasting and receiving typing indicators using Supabase Broadcast.
 */
export function useTypingIndicator(
  conversationId: string | undefined,
  currentUser: { id: string; username: string } | null
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!conversationId || !currentUser || !isRealtimeAvailable() || !supabase) {
      return;
    }

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on("broadcast", { event: "typing" }, (payload: { payload: { userId: string; username: string; isTyping: boolean } }) => {
        const { userId, username, isTyping } = payload.payload;

        if (isTyping) {
          setTypingUsers((prev) => {
            if (prev.find((u) => u.id === userId)) return prev;
            return [...prev, { id: userId, username }];
          });

          // Auto-remove typing indicator after 5 seconds if no update
          if (timeoutsRef.current[userId]) {
            clearTimeout(timeoutsRef.current[userId]);
          }
          timeoutsRef.current[userId] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
            delete timeoutsRef.current[userId];
          }, 5000);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
          if (timeoutsRef.current[userId]) {
            clearTimeout(timeoutsRef.current[userId]);
            delete timeoutsRef.current[userId];
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (supabase) supabase.removeChannel(channel);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [conversationId, currentUser]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !currentUser) return;

      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUser.id,
          username: currentUser.username,
          isTyping,
        },
      });
    },
    [currentUser]
  );

  return { typingUsers, setTyping };
}
