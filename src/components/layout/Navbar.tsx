"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { NavbarSearch } from "./NavbarSearch";
import { useEffect, useState, memo, useCallback } from "react";
import { cn } from "@/lib/cn";

function safeSessionStorageGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionStorageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Navbar cache is optional.
  }
}

function safeSessionStorageRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Navbar cache is optional.
  }
}

export const Navbar = memo(function Navbar({ session }: { session?: { user?: { id?: string; username?: string; name?: string; image?: string } } | null }) {
  const pathname = usePathname();
  const username = session?.user?.username;
  const googleImage = session?.user?.image ?? undefined;
  const sessionName = session?.user?.name ?? undefined;
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(googleImage);
  const [displayName, setDisplayName] = useState<string | undefined>(sessionName);
  const [profileType, setProfileType] = useState<string | undefined>();
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState<number>(0);

  const fetchUnread = useCallback(async () => {
    if (!username) return;
    try {
      const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.unread === "number") setUnread(data.unread);
    } catch { }
  }, [username]);

  // Function to fetch fresh profile data - only when needed (bypass cache)
  const fetchProfile = useCallback(async () => {
    if (!username) return;

    // Check cache first
    const cacheKey = `navbar-profile-${username}`;
    const cached = safeSessionStorageGet(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.user?.profile?.avatarUrl) setAvatarUrl(data.user.profile.avatarUrl);
        if (data.user?.name) setDisplayName(data.user.name);
        if (data.user?.profile?.profileType) setProfileType(data.user.profile.profileType);
        return;
      } catch { }
    }

    try {
      const res = await fetch(`/api/user/${username}`, { cache: 'no-store' });
      const data = await res.json();

      // Update cache
      safeSessionStorageSet(cacheKey, JSON.stringify(data));

      if (data.user?.profile?.avatarUrl) {
        setAvatarUrl(data.user.profile.avatarUrl);
      }
      if (data.user?.name) {
        setDisplayName(data.user.name);
      }
      if (data.user?.profile?.profileType) {
        setProfileType(data.user.profile.profileType);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [username]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial: use session data immediately, then check cache
  useEffect(() => {
    if (username) {
      // Use session image immediately
      if (googleImage) {
        setAvatarUrl(googleImage);
      }
      // Check cache for profile type (only fetch if not cached)
      const cacheKey = `navbar-profile-${username}`;
      const cached = safeSessionStorageGet(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.user?.profile?.avatarUrl && !googleImage) setAvatarUrl(data.user.profile.avatarUrl);
          if (data.user?.name) setDisplayName(data.user.name);
          if (data.user?.profile?.profileType) setProfileType(data.user.profile.profileType);
          return; // Don't fetch if cached
        } catch { }
      }
      // Only fetch if not cached
      fetchProfile();
    }
  }, [username, googleImage, fetchProfile]);

  // Poll unread notifications count with visibility check
  useEffect(() => {
    if (!username) return;

    const fetchUnreadIfVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };

    fetchUnreadIfVisible();
    const id = window.setInterval(fetchUnreadIfVisible, 30000);
    document.addEventListener('visibilitychange', fetchUnreadIfVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', fetchUnreadIfVisible);
    };
  }, [username, fetchUnread]);

  // Refresh unread count on demand (e.g. after marking read)
  useEffect(() => {
    if (!username) return;
    const onUpdate = () => fetchUnread();
    window.addEventListener("devlink:notifications-updated", onUpdate as EventListener);
    return () => window.removeEventListener("devlink:notifications-updated", onUpdate as EventListener);
  }, [username, fetchUnread]);

  // Listen for profile updates (from any component)
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar, name: newName, profileType: newType } = event.detail || {};

      // Clear cache immediately
      if (username) {
        safeSessionStorageRemove(`navbar-profile-${username}`);
      }

      // Update state immediately with new values
      if (newAvatar !== undefined) setAvatarUrl(newAvatar);
      if (newName !== undefined) setDisplayName(newName);
      if (newType !== undefined) setProfileType(newType);
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, [username]);

  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "bg-[rgba(7,9,13,0.88)] border-b border-white/10"
          : "bg-[rgba(7,9,13,0.34)] border-b border-white/[0.04]"
      )}
    >

      <div className="relative w-full px-4 md:px-6 h-16 flex items-center gap-3">
        {/* Spacer for mobile hamburger - matches button size (p-2.5 + icon 20px = ~44px) */}
        <div className="w-[44px] h-[44px] md:hidden flex-shrink-0" />

        {/* Render a spacer on the landing page that exactly matches the Sidebar's width (w-72 = 18rem = 288px) */}
        {pathname === "/" && (
          <div className="hidden md:block w-72 flex-shrink-0" />
        )}

        {/* Search bar */}
        <div className="flex items-center flex-1">
          {pathname !== "/" && <NavbarSearch currentUserId={session?.user?.id} />}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick action buttons for logged-in users */}
          {username && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative p-2.5 rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/[0.055] transition-all duration-150 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 ? (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white flex items-center justify-center"
                    aria-label={`${unread} unread notifications`}
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </Link>

              {/* Messages placeholder */}
              <button
                aria-label="Messages"
                aria-haspopup="true"
                className="relative p-2.5 rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/[0.055] transition-all duration-150 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          )}

          {/* Profile or auth buttons */}
          {username ? (
            <ProfileMenu
              username={username}
              avatarUrl={avatarUrl}
              name={displayName}
              profileType={profileType}
            />
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-[var(--muted-foreground)] hover:text-white border-0"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button>
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
