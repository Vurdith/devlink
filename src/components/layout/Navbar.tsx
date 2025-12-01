"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { NavbarSearch } from "./NavbarSearch";
import { useEffect, useState, memo, useCallback } from "react";
import { cn } from "@/lib/cn";

export const Navbar = memo(function Navbar() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username as string | undefined;
  const googleImage = (session?.user as any)?.image as string | undefined;
  const sessionName = (session?.user as any)?.name as string | undefined;
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(googleImage);
  const [displayName, setDisplayName] = useState<string | undefined>(sessionName);
  const [profileType, setProfileType] = useState<string | undefined>();
  const [scrolled, setScrolled] = useState(false);

  // Function to fetch fresh profile data
  const fetchProfile = useCallback(async (bypassCache = false) => {
    if (!username) return;
    
    const cacheKey = `navbar-profile-${username}`;
    
    // Check cache unless bypassing
    if (!bypassCache) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.user?.profile?.avatarUrl) setAvatarUrl(data.user.profile.avatarUrl);
          if (data.user?.name) setDisplayName(data.user.name);
          if (data.user?.profile?.profileType) setProfileType(data.user.profile.profileType);
          return;
        } catch {}
      }
    }
    
    try {
      const res = await fetch(`/api/user/${username}`, { cache: 'no-store' });
      const data = await res.json();
      
      // Update cache
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      
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

  // Initial profile fetch
  useEffect(() => {
    if (username) {
      if (googleImage) {
        setAvatarUrl(googleImage);
      }
      fetchProfile(false);
    }
  }, [username, googleImage, fetchProfile]);

  // Listen for profile updates (from any component)
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar, name: newName, profileType: newType } = event.detail || {};
      
      // Clear cache and update immediately
      if (username) {
        sessionStorage.removeItem(`navbar-profile-${username}`);
      }
      
      // Update state immediately with new values
      if (newAvatar !== undefined) setAvatarUrl(newAvatar);
      if (newName !== undefined) setDisplayName(newName);
      if (newType !== undefined) setProfileType(newType);
      
      // Also refetch to ensure consistency
      fetchProfile(true);
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, [username, fetchProfile]);

  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled 
          ? "bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/10" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      
      <div className="relative w-full px-4 md:px-6 h-16 flex items-center gap-3">
        {/* Spacer for mobile hamburger - matches button size (p-2.5 + icon 20px = ~44px) */}
        <div className="w-[44px] h-[44px] md:hidden flex-shrink-0" />
        
        {/* Search bar */}
        <div className="flex items-center flex-1">
          <NavbarSearch />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick action buttons for logged-in users */}
          {username && (
            <div className="hidden md:flex items-center gap-2">
              {/* Notifications placeholder */}
              <button
                aria-label="Notifications"
                aria-haspopup="true"
                className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification dot */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" aria-label="New notifications" />
              </button>
              
              {/* Messages placeholder */}
              <button
                aria-label="Messages"
                aria-haspopup="true"
                className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-all duration-150 hover:scale-105 active:scale-95"
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
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/20">
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
