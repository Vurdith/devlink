"use client";

import { useEffect, useRef } from "react";
import { supabase, isRealtimeAvailable } from "@/server/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions<T = Record<string, unknown>> {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  onChange?: (payload: { eventType: string; new: T; old: T }) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription<T = Record<string, unknown>>({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
    onChangeRef.current = onChange;
  }, [onInsert, onUpdate, onDelete, onChange]);

  useEffect(() => {
    if (!enabled || !isRealtimeAvailable() || !supabase) {
      return;
    }

    const channelName = `${schema}:${table}:${filter || "all"}:${Date.now()}`;

    const channel = supabase.channel(channelName);

    const subscriptionConfig = {
      event,
      schema,
      table,
      filter: filter || undefined,
    };

    channel
      .on(
        // @ts-expect-error Supabase overload types don't match at compile time
        "postgres_changes",
        subscriptionConfig,
        (payload: { eventType: string; new: T; old: T }) => {
          onChangeRef.current?.(payload);

          switch (payload.eventType) {
            case "INSERT":
              onInsertRef.current?.(payload.new as T);
              break;
            case "UPDATE":
              onUpdateRef.current?.({ old: payload.old as T, new: payload.new as T });
              break;
            case "DELETE":
              onDeleteRef.current?.(payload.old as T);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error subscribing to ${table}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, event, filter, enabled]);

  return;
}

export function useProfileRealtime(
  userId: string | undefined,
  onProfileUpdate: (profile: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "Profile",
    filter: userId ? `userId=eq.${userId}` : undefined,
    event: "UPDATE",
    enabled: !!userId,
    onUpdate: ({ new: profile }) => {
      onProfileUpdate(profile);
    },
  });
}

export function usePostsRealtime(
  onNewPost: (post: Record<string, unknown>) => void,
  onPostUpdate?: (post: Record<string, unknown>) => void,
  onPostDelete?: (postId: string) => void
) {
  useRealtimeSubscription({
    table: "Post",
    event: "*",
    onInsert: onNewPost,
    onUpdate: onPostUpdate ? ({ new: post }) => onPostUpdate(post) : undefined,
    onDelete: onPostDelete ? (post) => onPostDelete((post as { id: string }).id) : undefined,
  });
}

export function usePostLikesRealtime(
  postId: string,
  onLikeChange: (delta: number, userId: string) => void
) {
  useRealtimeSubscription({
    table: "PostLike",
    filter: `postId=eq.${postId}`,
    event: "*",
    enabled: !!postId,
    onInsert: (like) => onLikeChange(1, (like as { userId: string }).userId),
    onDelete: (like) => onLikeChange(-1, (like as { userId: string }).userId),
  });
}

export function useFollowersRealtime(
  userId: string | undefined,
  onFollowerChange: (delta: number, followerId: string) => void
) {
  useRealtimeSubscription({
    table: "Follower",
    filter: userId ? `followingId=eq.${userId}` : undefined,
    event: "*",
    enabled: !!userId,
    onInsert: (follow) => onFollowerChange(1, (follow as { followerId: string }).followerId),
    onDelete: (follow) => onFollowerChange(-1, (follow as { followerId: string }).followerId),
  });
}
