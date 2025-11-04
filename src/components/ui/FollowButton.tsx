"use client";
import { useState, useTransition, useEffect } from "react";

export function FollowButton({ targetUserId, initialFollowing = false, compact = false, disabled = false, onToggle }: { targetUserId: string; initialFollowing?: boolean; compact?: boolean; disabled?: boolean; onToggle?: (following: boolean) => void }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  // Sync internal state with prop changes
  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  function toggle() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId }),
        });
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);
          try {
            window.dispatchEvent(new CustomEvent("devlink:follow-toggled", { detail: { targetUserId, following: data.following } }));
          } catch {}
          if (onToggle) onToggle(data.following);
        }
      } catch {}
    });
  }

  const base = compact
    ? "text-xs px-2 py-1 rounded-[calc(var(--radius)-3px)] border transition"
    : "text-xs px-2 py-1 rounded-[calc(var(--radius)-3px)] border transition";
  const activeCls = "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]/50 hover:brightness-110";
  const followingCls = "bg-transparent text-[var(--accent)] border-[var(--accent)]/60 hover:bg-[var(--accent)]/10";

  return (
    <button onClick={toggle} disabled={isPending || disabled}
      className={`${base} ${following ? followingCls : activeCls}`}>
      {isPending ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}


