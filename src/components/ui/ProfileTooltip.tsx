"use client";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import Image from "next/image";
import { FollowButton } from "./FollowButton";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import { cn } from "@/lib/cn";

// Pre-computed profile type styles for performance
const PROFILE_GRADIENTS: Record<string, string> = {
  DEVELOPER: "from-blue-500/20 via-blue-400/10 to-cyan-500/20",
  CLIENT: "from-emerald-500/20 via-green-400/10 to-teal-500/20",
  STUDIO: "from-red-600/20 via-red-400/10 to-rose-500/20",
  INFLUENCER: "from-rose-500/20 via-pink-400/10 to-red-500/20",
  INVESTOR: "from-amber-500/20 via-yellow-400/10 to-orange-500/20",
  DEFAULT: "from-slate-500/20 via-gray-400/10 to-zinc-500/20",
};

const PROFILE_BORDERS: Record<string, string> = {
  DEVELOPER: "border-blue-500/40 shadow-blue-500/20",
  CLIENT: "border-emerald-500/40 shadow-emerald-500/20",
  STUDIO: "border-red-600/40 shadow-red-600/20",
  INFLUENCER: "border-rose-500/40 shadow-rose-500/20",
  INVESTOR: "border-amber-500/40 shadow-amber-500/20",
  DEFAULT: "border-white/20 shadow-white/10",
};

const BADGE_CLASSES: Record<string, string> = {
  DEVELOPER: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-blue-500/20",
  CLIENT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20",
  STUDIO: "bg-red-600/15 text-red-400 border-red-600/30 shadow-red-600/20",
  INFLUENCER: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/20",
  INVESTOR: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/20",
  DEFAULT: "bg-slate-500/15 text-slate-300 border-slate-500/30 shadow-slate-500/20",
};

interface ProfileTooltipProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      avatarUrl: string | null;
      bannerUrl: string | null;
      bio: string | null;
      profileType: string;
      verified: boolean;
      website: string | null;
      location: string | null;
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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [hasFetchedFollow, setHasFetchedFollow] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: position });
  const [mounted, setMounted] = useState(false);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringTooltip = useRef(false);
  const isHoveringTrigger = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Lazy fetch follow status only when tooltip becomes visible
  useEffect(() => {
    if (!isVisible || hasFetchedFollow || !currentUserId || currentUserId === user.id) return;
    
    // Check cache first
    const cached = followStatusCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setIsFollowing(cached.following);
      setHasFetchedFollow(true);
      return;
    }

    setIsLoadingFollow(true);
    fetch(`/api/follow/check?targetUserId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setIsFollowing(data.following);
        followStatusCache.set(user.id, { following: data.following, timestamp: Date.now() });
      })
      .catch(() => setIsFollowing(false))
      .finally(() => {
        setIsLoadingFollow(false);
        setHasFetchedFollow(true);
      });
  }, [isVisible, hasFetchedFollow, currentUserId, user.id]);

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
    followStatusCache.set(user.id, { following, timestamp: Date.now() });
  };

  const profileType = user.profile?.profileType;
  const profileConfig = profileType ? getProfileTypeConfig(profileType) : null;
  
  // Use pre-computed lookups instead of recreating functions on every render
  const profileGradient = useMemo(() => 
    PROFILE_GRADIENTS[profileType || "DEFAULT"] || PROFILE_GRADIENTS.DEFAULT
  , [profileType]);
  
  const profileBorderColor = useMemo(() => 
    PROFILE_BORDERS[profileType || "DEFAULT"] || PROFILE_BORDERS.DEFAULT
  , [profileType]);
  
  const badgeClasses = useMemo(() => 
    BADGE_CLASSES[profileType || "DEFAULT"] || BADGE_CLASSES.DEFAULT
  , [profileType]);

  const formatCount = (count: number | undefined | null) => {
    if (count == null) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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
      {/* Main card */}
      <div className={cn(
        "relative w-80 rounded-2xl overflow-hidden",
        "bg-[#0d1117]",
        "border",
        profileBorderColor,
        "shadow-2xl shadow-black/60"
      )}>
          {/* Gradient overlay at top */}
          <div className={cn(
            "absolute inset-x-0 top-0 h-32 opacity-40",
            `bg-gradient-to-b ${profileGradient} to-transparent`
          )} />
          
          {/* Banner or gradient */}
          <div className="relative h-20 overflow-hidden">
            {user.profile?.bannerUrl ? (
              <>
                <Image 
                  src={user.profile?.bannerUrl} 
                  alt="" 
                  fill 
                  className="object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e14]" />
              </>
            ) : (
              <div className={cn(
                "absolute inset-0",
                `bg-gradient-to-br ${profileGradient}`,
                "opacity-60"
              )}>
                {/* Animated pattern overlay */}
                <div 
                  className="absolute inset-0 opacity-30" 
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                  }} 
                />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="relative px-4 pb-4 -mt-8">
            {/* Avatar with ring */}
            <div className="flex items-end gap-3 mb-3">
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${user.username}`; }}
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
                  <Avatar src={user.profile?.avatarUrl} size={56} />
                </div>
              </button>
              
              {/* Name and username inline with avatar */}
              <div className="flex-1 min-w-0 pb-1">
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${user.username}`; }}
                  className="group flex items-center gap-1.5"
                >
                  <span className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                    {user.name || user.username}
                  </span>
                  {user.profile?.verified && (
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-blue-400/50 blur-md rounded-full" />
                      <svg className="relative w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  )}
                </button>
                <div className="text-sm text-[var(--muted-foreground)]">@{user.username}</div>
              </div>
            </div>
            
            {/* Profile type badge */}
            {profileConfig && profileType && (
              <div className="mb-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                  "text-xs font-medium border shadow-sm",
                  badgeClasses
                )}>
                  <ProfileTypeIcon profileType={profileType} size={12} />
                  {profileConfig.label}
                </span>
              </div>
            )}
            
            {/* Bio */}
            {user.profile?.bio && (
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-relaxed">
                {user.profile?.bio}
              </p>
            )}
            
            {/* Location and Website */}
            {(user.profile?.location || user.profile?.website) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs text-[var(--muted-foreground)]">
                {user.profile?.location && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate max-w-[120px]">{user.profile?.location}</span>
                  </div>
                )}
                {user.profile?.website && (
                  <a
                    href={user.profile?.website?.startsWith('http') ? user.profile.website : `https://${user.profile?.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="truncate max-w-[100px]">{user.profile?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                )}
              </div>
            )}
            
            {/* Stats */}
            {user._count && (user._count.followers != null || user._count.following != null) && (
              <div className="flex gap-4 mb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${user.username}/followers`; }}
                  className="group flex items-center gap-1.5 text-sm hover:text-red-400 transition-colors"
                >
                  <span className="font-bold text-white group-hover:text-red-400 transition-colors">
                    {formatCount(user._count.followers)}
                  </span>
                  <span className="text-[var(--muted-foreground)] text-xs">followers</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/u/${user.username}/following`; }}
                  className="group flex items-center gap-1.5 text-sm hover:text-red-400 transition-colors"
                >
                  <span className="font-bold text-white group-hover:text-red-400 transition-colors">
                    {formatCount(user._count.following)}
                  </span>
                  <span className="text-[var(--muted-foreground)] text-xs">following</span>
                </button>
              </div>
            )}
            
            {/* Follow Button */}
            {currentUserId && currentUserId !== user.id && (
              <div className="relative">
                {isLoadingFollow ? (
                  <div className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-red-500/30 border-r-red-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <FollowButton
                    targetUserId={user.id}
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
