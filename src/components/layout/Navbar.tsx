"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NavbarSearch } from "./NavbarSearch";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/design-system";
import dynamic from "next/dynamic";
import { scheduleAfterInitialLoad } from "@/lib/browser/idle";

const ProfileMenu = dynamic(
  () => import("@/components/layout/ProfileMenu").then((mod) => mod.ProfileMenu),
  { ssr: false }
);

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

interface NavbarProfileData {
  user?: {
    name?: string | null;
    profile?: {
      avatarUrl?: string | null;
      profileType?: string | null;
    } | null;
  } | null;
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
  const scrolledRef = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);

  const applyProfileData = useCallback((data: NavbarProfileData, preferSessionImage = false) => {
    const nextAvatar = data.user?.profile?.avatarUrl ?? undefined;
    const nextName = data.user?.name ?? undefined;
    const nextType = data.user?.profile?.profileType ?? undefined;

    if (nextAvatar && !preferSessionImage) setAvatarUrl((current) => (current === nextAvatar ? current : nextAvatar));
    if (nextName) setDisplayName((current) => (current === nextName ? current : nextName));
    if (nextType) setProfileType((current) => (current === nextType ? current : nextType));
  }, []);

  const fetchUnread = useCallback(async () => {
    if (!username) return;
    try {
      const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.unread === "number") setUnread(data.unread);
    } catch { }
  }, [username]);

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    const cacheKey = `navbar-profile-${username}`;
    const cached = safeSessionStorageGet(cacheKey);
    if (cached) {
      try {
        applyProfileData(JSON.parse(cached) as NavbarProfileData);
        return;
      } catch { }
    }

    try {
      const res = await fetch(`/api/user/${username}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json() as NavbarProfileData;

      safeSessionStorageSet(cacheKey, JSON.stringify(data));
      applyProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [applyProfileData, username]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const nextScrolled = window.scrollY > 10;
        if (scrolledRef.current !== nextScrolled) {
          scrolledRef.current = nextScrolled;
          setScrolled(nextScrolled);
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (username) {
      if (googleImage) {
        setAvatarUrl((current) => (current === googleImage ? current : googleImage));
      }
      const cacheKey = `navbar-profile-${username}`;
      const cached = safeSessionStorageGet(cacheKey);
      if (cached) {
      try {
        applyProfileData(JSON.parse(cached) as NavbarProfileData, Boolean(googleImage));
        return;
      } catch { }
    }
      return scheduleAfterInitialLoad(() => {
        void fetchProfile();
      }, 1800);
    }
    return undefined;
  }, [applyProfileData, username, googleImage, fetchProfile]);

  useEffect(() => {
    if (!username) return;

    const fetchUnreadIfVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };

    const cancelSchedule = scheduleAfterInitialLoad(fetchUnreadIfVisible, 2200);
    const id = window.setInterval(fetchUnreadIfVisible, 120000);
    document.addEventListener('visibilitychange', fetchUnreadIfVisible);

    return () => {
      cancelSchedule();
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', fetchUnreadIfVisible);
    };
  }, [username, fetchUnread]);

  useEffect(() => {
    if (!username) return;
    const onUpdate = () => fetchUnread();
    window.addEventListener("devlink:notifications-updated", onUpdate as EventListener);
    return () => window.removeEventListener("devlink:notifications-updated", onUpdate as EventListener);
  }, [username, fetchUnread]);

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar, name: newName, profileType: newType } = event.detail || {};

      if (username) {
        safeSessionStorageRemove(`navbar-profile-${username}`);
      }

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
          ? "bg-[rgba(7,9,13,0.88)] border-b border-white/[0.08]"
          : "bg-[rgba(7,9,13,0.34)] border-b border-white/[0.04]"
      )}
    >

      <div className="relative flex h-16 w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6">
        {/* Spacer for mobile hamburger - matches button size (p-2.5 + icon 20px = ~44px) */}
        <div className="w-[44px] h-[44px] md:hidden flex-shrink-0" />

        {/* Render a spacer on the landing page that exactly matches the Sidebar's width (w-72 = 18rem = 288px) */}
        {pathname === "/" && (
          <div className="hidden md:block w-72 flex-shrink-0" />
        )}

        {/* Search bar */}
        <div className="flex min-w-0 flex-1 items-center">
          {pathname !== "/" && <NavbarSearch currentUserId={session?.user?.id} />}
        </div>

        {/* Right side actions */}
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
          {/* Quick action buttons for logged-in users */}
          {username && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/notifications"
                aria-label="Notifications"
                className={cn(
                  "relative p-2.5",
                  pathname.startsWith("/notifications")
                    ? "rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
                    : cn("text-[var(--muted-foreground)]", ui.control.icon)
                )}
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

              <Link
                href="/messages"
                aria-label="Messages"
                className={cn(
                  "relative p-2.5",
                  pathname.startsWith("/messages")
                    ? "rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
                    : cn("text-[var(--muted-foreground)]", ui.control.icon)
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
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
