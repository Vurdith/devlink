"use client";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "../ui/Avatar";
import { MetricButton } from "@/components/ui/DataDisplay";
import Image from "next/image";
import { FollowButton } from "../ui/FollowButton";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { cn } from "@/lib/cn";
import { formatProfileCount, getProfileBorder, getProfileGradient } from "./profile-tooltip-utils";

interface ProfileTooltipProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      avatarUrl: string | null;
      bannerUrl?: string | null;
      bio?: string | null;
      profileType?: string | null;
      verified?: boolean;
      website?: string | null;
      location?: string | null;
    } | null;
    _count?: {
      followers: number;
      following: number;
    };
  };
  currentUserId?: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

// Cache for follow status to avoid repeated API calls
const followStatusCache = new Map<string, { following: boolean; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

export const ProfileTooltip = memo(function ProfileTooltip({ 
  user, 
  currentUserId, 
  children, 
  position = "bottom",
  delay = 400 
}: ProfileTooltipProps) {
  const [userData, setUserData] = useState(user);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [hasFetchedFollow, setHasFetchedFollow] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: position });
  const [mounted, setMounted] = useState(false);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringTooltip = useRef(false);
  const isHoveringTrigger = useRef(false);

  useEffect(() => {
    setUserData(user);
    setHasFetchedProfile(false);
    setIsLoadingProfile(false);
    setHasFetchedFollow(false);
    setIsLoadingFollow(false);
  }, [user]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Lazy fetch full profile data (banner/bio/counts/etc.) only when the tooltip is about to show.
  useEffect(() => {
    if (!isAnimating || hasFetchedProfile || isLoadingProfile) return;

    // If the caller already provided a rich profile (from /api/user/[username]), skip fetching.
    const profile = userData.profile;
    const hasRichProfile =
      !!profile &&
      (profile.bannerUrl !== undefined ||
        profile.bio !== undefined ||
        profile.website !== undefined ||
        profile.location !== undefined) &&
      userData._count != null;

    if (hasRichProfile) {
      setHasFetchedProfile(true);
      return;
    }

    const controller = new AbortController();
    setIsLoadingProfile(true);
    fetch(`/api/user/${encodeURIComponent(userData.username)}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json().catch(() => null)) as { user?: ProfileTooltipProps["user"] } | null;
      })
      .then((data) => {
        const next = data?.user;
        if (next?.id && next?.username) setUserData(next);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingProfile(false);
        setHasFetchedProfile(true);
      });

    return () => controller.abort();
  }, [isAnimating, hasFetchedProfile, isLoadingProfile, userData.username, userData.profile, userData._count]);

  // Lazy fetch follow status only when tooltip becomes visible
  useEffect(() => {
    if (!isVisible || hasFetchedFollow || !currentUserId || currentUserId === userData.id) return;
    
    // Check cache first
    const cached = followStatusCache.get(userData.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setIsFollowing(cached.following);
      setHasFetchedFollow(true);
      return;
    }

    setIsLoadingFollow(true);
    fetch(`/api/follow/check?targetUserId=${userData.id}`)
      .then(res => res.json())
      .then(data => {
        setIsFollowing(data.following);
        followStatusCache.set(userData.id, { following: data.following, timestamp: Date.now() });
      })
      .catch(() => setIsFollowing(false))
      .finally(() => {
        setIsLoadingFollow(false);
        setHasFetchedFollow(true);
      });
  }, [isVisible, hasFetchedFollow, currentUserId, userData.id]);

  // Calculate optimal tooltip position - fixed positioning (viewport-relative)
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;
    const offset = 8;
    
    // Center horizontally relative to trigger
    let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    let y: number;
    let placement = position;
    
    // Determine vertical placement based on available space
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    if (position === "bottom" && spaceBelow < tooltipRect.height + margin) {
      placement = "top";
    } else if (position === "top" && spaceAbove < tooltipRect.height + margin) {
      placement = "bottom";
    }
    
    if (placement === "top") {
      y = triggerRect.top - tooltipRect.height - offset;
    } else {
      y = triggerRect.bottom + offset;
    }
    
    // Horizontal bounds check - keep within viewport
    x = Math.max(margin, Math.min(x, viewportWidth - tooltipRect.width - margin));
    
    // Vertical bounds check
    const maxY = viewportHeight - tooltipRect.height - margin;
    const minY = margin;
    y = Math.max(minY, Math.min(y, maxY));
    
    setTooltipPosition({ x, y, placement });
  }, [position]);

  useEffect(() => {
    if (isAnimating && tooltipRef.current) {
      // Calculate position first
      calculatePosition();
      // Then show with a small delay to ensure the hidden state is painted
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, calculatePosition]);

  // Recalculate on scroll/resize when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const handleReposition = () => requestAnimationFrame(calculatePosition);
    window.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isVisible, calculatePosition]);

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (!isVisible && !showTimeoutRef.current) {
      showTimeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
        showTimeoutRef.current = null;
      }, delay);
    }
  }, [isVisible, delay]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    if (isVisible && !hideTimeoutRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isHoveringTooltip.current && !isHoveringTrigger.current) {
          setIsVisible(false);
          setTimeout(() => setIsAnimating(false), 450);
        }
        hideTimeoutRef.current = null;
      }, 150);
    }
  }, [isVisible]);

  const handleTriggerEnter = () => {
    isHoveringTrigger.current = true;
    showTooltip();
  };

  const handleTriggerLeave = () => {
    isHoveringTrigger.current = false;
    hideTooltip();
  };

  const handleTooltipEnter = () => {
    isHoveringTooltip.current = true;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipLeave = () => {
    isHoveringTooltip.current = false;
    hideTooltip();
  };

  const handleFollowToggle = (following: boolean) => {
    setIsFollowing(following);
    followStatusCache.set(userData.id, { following, timestamp: Date.now() });
  };

  const profileType = userData.profile?.profileType ?? null;
  // Use pre-computed lookups instead of recreating functions on every render
  const profileGradient = useMemo(() => getProfileGradient(profileType), [profileType]);
  
  const profileBorderColor = useMemo(() => getProfileBorder(profileType), [profileType]);
  
  const slideDirection = tooltipPosition.placement === "top" ? -12 : 12;
  
  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="fixed z-[9999]"
      style={{ 
        left: tooltipPosition.x, 
        top: tooltipPosition.y,
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? 0 : slideDirection}px)`,
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      onMouseEnter={handleTooltipEnter}
      onMouseLeave={handleTooltipLeave}
    >
      <div className={cn(
        "relative w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl bg-[rgba(12,16,23,0.97)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]",
        "border",
        profileBorderColor
      )}>
          <div className={cn(
            "absolute inset-x-0 top-0 h-32 opacity-25",
            `bg-gradient-to-b ${profileGradient} to-transparent`
          )} />
          
          <div className="relative h-24 overflow-hidden">
            {userData.profile?.bannerUrl ? (
              <>
                <Image 
                  src={userData.profile?.bannerUrl} 
                  alt="" 
                  fill 
                  className="object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-[#0a0e14]" />
              </>
            ) : (
              <div className={cn(
                "absolute inset-0",
                `bg-gradient-to-br ${profileGradient}`,
                "opacity-45"
              )} />
            )}
          </div>
          
          <div className="relative -mt-9 px-4 pb-4">
            <div className="mb-3 flex items-end gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${userData.username}`; }}
                className="relative group"
              >
                <div className={cn(
                  "absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300",
                  `bg-gradient-to-br ${profileGradient.replace('/20', '/40')}`
                )} />
                <div className={cn(
                  "relative rounded-full p-0.5",
                  "bg-gradient-to-br from-[#0d1117] to-[#080b10]",
                  "ring-2 ring-[#0a0e14]"
                )}>
                  <Avatar src={userData.profile?.avatarUrl} size={56} />
                </div>
              </button>
              
              <div className="min-w-0 flex-1 pb-1">
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${userData.username}`; }}
                  className="group flex max-w-full items-center gap-1.5"
                >
                  <span className="truncate font-semibold text-white transition-colors group-hover:text-[var(--color-accent-2)]">
                    {userData.name || userData.username}
                  </span>
                  {userData.profile?.verified && (
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-[rgba(var(--color-accent-2-rgb),0.50)] rounded-full" />
                      <svg className="relative w-4 h-4 text-[var(--color-accent-2)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  )}
                </button>
                <div className="truncate text-sm text-[var(--muted-foreground)]">@{userData.username}</div>
              </div>
            </div>
            
            {profileType && (
              <div className="mb-3">
                <ProfileTypeLabel profileType={profileType} variant="inline" />
              </div>
            )}
            
            {userData.profile?.bio && (
              <p className="mb-3 line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.28)] pl-3 text-sm leading-relaxed text-white/62">
                {userData.profile?.bio}
              </p>
            )}
            
            {(userData.profile?.location || userData.profile?.website) && (
              <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--muted-foreground)]">
                {userData.profile?.location && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate max-w-[120px]">{userData.profile?.location}</span>
                  </div>
                )}
                {userData.profile?.website && (
                  <a
                    href={userData.profile?.website?.startsWith('http') ? userData.profile.website : `https://${userData.profile?.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[var(--color-accent-2)] transition-colors hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="truncate max-w-[100px]">{userData.profile?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                )}
              </div>
            )}
            
            {userData._count && (userData._count.followers != null || userData._count.following != null) && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <MetricButton
                  label="followers"
                  value={formatProfileCount(userData._count.followers)}
                  className="w-full justify-start border border-white/[0.07] bg-white/[0.025]"
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${userData.username}/followers`; }}
                />
                <MetricButton
                  label="following"
                  value={formatProfileCount(userData._count.following)}
                  className="w-full justify-start border border-white/[0.07] bg-white/[0.025]"
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${userData.username}/following`; }}
                />
              </div>
            )}
            
            {currentUserId && currentUserId !== userData.id && (
              <div className="relative">
                {isLoadingFollow ? (
                  <div className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[var(--color-accent)]/30 border-r-[var(--color-accent)] rounded-full animate-spin" />
                  </div>
                ) : (
                  <FollowButton
                    targetUserId={userData.id}
                    initialFollowing={isFollowing}
                    onToggle={handleFollowToggle}
                  />
                )}
              </div>
            )}
          </div>
        </div>
    </div>
  );

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
      className="relative inline-block"
      data-profile-trigger
    >
      {children}
      {mounted && isAnimating && createPortal(tooltipContent, document.body)}
    </div>
  );
});
