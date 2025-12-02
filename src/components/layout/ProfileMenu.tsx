"use client";

import { useEffect, useState, useRef, memo } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

interface ProfileMenuProps {
  username: string;
  avatarUrl?: string;
  name?: string | null;
  profileType?: string;
}

const menuItems = [
  {
    href: "/me",
    label: "View Profile",
    description: "See your public profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Account preferences",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
];

export const ProfileMenu = memo(function ProfileMenu({ username, avatarUrl: initialAvatarUrl, name, profileType }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(initialAvatarUrl);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update avatar when prop changes
  useEffect(() => {
    setCurrentAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  // Listen for profile updates for instant avatar updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar } = event.detail || {};
      if (newAvatar !== undefined) {
        setCurrentAvatarUrl(newAvatar);
      }
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 active:scale-98",
          open ? "bg-white/10" : "hover:bg-white/5"
        )}
        onClick={() => setOpen(!open)}
      >
        <Avatar size={36} src={currentAvatarUrl} />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white leading-tight">
            {name || username}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            @{username}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            "text-[var(--muted-foreground)] hidden sm:block transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-72 glass rounded-2xl border border-red-600/20 shadow-2xl shadow-red-600/10 overflow-hidden z-50",
          "transition-all duration-200 origin-top-right",
          open 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        {/* Header with user info */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar size={48} src={currentAvatarUrl} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">
                {name || username}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                @{username}
              </div>
              {profileType && (
                <div className="mt-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                    getProfileTypeConfig(profileType).bgColor,
                    getProfileTypeConfig(profileType).color,
                    "border-current/30"
                  )}>
                    <ProfileTypeIcon profileType={profileType} size={10} />
                    {getProfileTypeConfig(profileType).label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-600/10 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">
                  {item.label}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {item.description}
                </div>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-3" />

        {/* Sign Out */}
        <div className="p-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-red-400 group-hover:text-red-300">
                Sign Out
              </div>
              <div className="text-xs text-red-400/60">
                End your session
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});
