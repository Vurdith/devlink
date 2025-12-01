"use client";

import { useEffect, useRef } from "react";
import { supabase, isRealtimeAvailable } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: { old: any; new: any }) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Hook for subscribing to Supabase Realtime database changes.
 * 
 * @example
 * // Subscribe to profile updates for a specific user
 * useRealtimeSubscription({
 *   table: "Profile",
 *   filter: `userId=eq.${userId}`,
 *   onUpdate: ({ new: profile }) => {
 *     setProfile(profile);
 *   },
 * });
 */
export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !isRealtimeAvailable() || !supabase) {
      return;
    }

    const channelName = `${schema}:${table}:${filter || "all"}:${Date.now()}`;
    
    const channel = supabase.channel(channelName);
    
    // Build the subscription config
    const subscriptionConfig: any = {
      event,
      schema,
      table,
    };
    
    if (filter) {
      subscriptionConfig.filter = filter;
    }

    channel
      .on(
        "postgres_changes" as any,
        subscriptionConfig,
        (payload: any) => {
          // Call general onChange handler
          onChange?.(payload);

          // Call specific handlers based on event type
          switch (payload.eventType) {
            case "INSERT":
              onInsert?.(payload.new);
              break;
            case "UPDATE":
              onUpdate?.({ old: payload.old, new: payload.new });
              break;
            case "DELETE":
              onDelete?.(payload.old);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (process.env.NODE_ENV === "development") {
            console.log(`[Realtime] Subscribed to ${table}`);
          }
        } else if (status === "CHANNEL_ERROR") {
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
  }, [table, schema, event, filter, enabled, onInsert, onUpdate, onDelete, onChange]);

  return channelRef.current;
}

/**
 * Hook for subscribing to profile changes (avatar, banner, bio, etc.)
 */
export function useProfileRealtime(
  userId: string | undefined,
  onProfileUpdate: (profile: any) => void
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

/**
 * Hook for subscribing to new posts in a feed
 */
export function usePostsRealtime(
  onNewPost: (post: any) => void,
  onPostUpdate?: (post: any) => void,
  onPostDelete?: (postId: string) => void
) {
  useRealtimeSubscription({
    table: "Post",
    event: "*",
    onInsert: onNewPost,
    onUpdate: onPostUpdate ? ({ new: post }) => onPostUpdate(post) : undefined,
    onDelete: onPostDelete ? (post) => onPostDelete(post.id) : undefined,
  });
}

/**
 * Hook for subscribing to likes on a specific post
 */
export function usePostLikesRealtime(
  postId: string,
  onLikeChange: (delta: number, userId: string) => void
) {
  useRealtimeSubscription({
    table: "PostLike",
    filter: `postId=eq.${postId}`,
    event: "*",
    enabled: !!postId,
    onInsert: (like: any) => onLikeChange(1, like.userId),
    onDelete: (like: any) => onLikeChange(-1, like.userId),
  });
}

/**
 * Hook for subscribing to follower changes
 */
export function useFollowersRealtime(
  userId: string | undefined,
  onFollowerChange: (delta: number, followerId: string) => void
) {
  useRealtimeSubscription({
    table: "Follower",
    filter: userId ? `followingId=eq.${userId}` : undefined,
    event: "*",
    enabled: !!userId,
    onInsert: (follow: any) => onFollowerChange(1, follow.followerId),
    onDelete: (follow: any) => onFollowerChange(-1, follow.followerId),
  });
}
