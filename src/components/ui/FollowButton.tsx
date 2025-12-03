"use client";
import { useState, useTransition, useEffect, memo } from "react";
import { cn } from "@/lib/cn";

export const FollowButton = memo(function FollowButton({ 
  targetUserId, 
  initialFollowing = false, 
  compact = false, 
  disabled = false, 
  onToggle 
}: { 
  targetUserId: string; 
  initialFollowing?: boolean; 
  compact?: boolean; 
  disabled?: boolean; 
  onToggle?: (following: boolean) => void 
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);

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
          window.dispatchEvent(new CustomEvent("devlink:follow-toggled", { detail: { targetUserId, following: data.following } }));
          onToggle?.(data.following);
        }
      } catch {}
    });
  }

  return (
    <button 
      onClick={toggle} 
      disabled={isPending || disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden font-semibold transition-all active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        compact ? "text-xs px-3 py-1.5 rounded-lg" : "text-sm px-5 py-2 rounded-xl",
        following 
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/15 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
          : "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white border border-[var(--color-accent)]/30 shadow-lg shadow-[var(--color-accent)]/30 hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent-hover)]"
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {isPending ? (
          <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
        ) : following ? (
          isHovered ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unfollow
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Following
            </>
          )
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Follow
          </>
        )}
      </span>
    </button>
  );
});
