"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

export function ProfileMenu({ username, avatarUrl }: { username: string; avatarUrl?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-profile-menu]")) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <div className="relative" data-profile-menu>
      <button
        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar size={36} src={avatarUrl} />
        <span className="text-base font-medium hidden sm:inline">{username}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-[var(--radius)] p-2 shadow-xl glow float-card">
          <div className="px-3 py-2 text-xs text-[var(--muted-foreground)]">Signed in as <span className="text-[var(--foreground)]">{username}</span></div>
          <Link href="/me" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor"/><path d="M3 22a9 9 0 1 1 18 0" stroke="currentColor"/></svg>
            <span>View profile</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.1 1.1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V21a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0L4.3 17.6a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4L5 4.3a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6H21a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z" stroke="currentColor"/></svg>
            <span>Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
}


