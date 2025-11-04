"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import Image from "next/image";
import { FollowButton } from "./FollowButton";

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
}

import { getProfileTypeConfig } from "@/lib/profile-types";

export function ProfileTooltip({ user, currentUserId, children, position = "bottom" }: ProfileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringTooltip = useRef(false);
  const isHoveringTrigger = useRef(false);

  // Check if current user is following this user
  useEffect(() => {
    if (currentUserId && user.id && currentUserId !== user.id) {
      setIsLoadingFollowing(true);
      fetch(`/api/follow/check?targetUserId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setIsFollowing(data.following);
        })
        .catch(() => setIsFollowing(false))
        .finally(() => setIsLoadingFollowing(false));
    }
  }, [currentUserId, user.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Mount effect for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate tooltip position when it becomes visible
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      
      switch (position) {
        case "top":
          x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.top - tooltipRect.height - 12;
          break;
        case "bottom":
          x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.bottom + 12;
          break;
        case "left":
          x = triggerRect.left - tooltipRect.width - 12;
          y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
        case "right":
          x = triggerRect.right + 12;
          y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
      }
      
      // Ensure tooltip stays within viewport
      const margin = 16;
      x = Math.max(margin, Math.min(x, window.innerWidth - tooltipRect.width - margin));
      y = Math.max(margin, Math.min(y, window.innerHeight - tooltipRect.height - margin));
      
      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set hovering trigger state
    isHoveringTrigger.current = true;
    
    // Reset fading state immediately
    setIsFadingOut(false);
    
    // Show tooltip after 0.2 second delay
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setIsFadingOut(false);
    }, 200);
  };

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set hovering trigger state to false
    isHoveringTrigger.current = false;
    
    // Only hide if not hovering over tooltip OR trigger
    if (!isHoveringTooltip.current && !isHoveringTrigger.current) {
      // Set fading out state
      setIsFadingOut(true);
      
      // Hide tooltip after 0.2 second delay (mouse must stay out for 0.2s)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        // Reset fading state after a short delay
        setTimeout(() => {
          setIsFadingOut(false);
        }, 300);
      }, 200);
    }
  };

  const handleFollowToggle = (following: boolean) => {
    setIsFollowing(following);
  };

  const BridgeElement = () => {
    const handleBridgeMouseEnter = () => {
      isHoveringTooltip.current = true;
      setIsFadingOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleBridgeMouseLeave = () => {
      isHoveringTooltip.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Only hide if not hovering over trigger either
      if (!isHoveringTrigger.current) {
        setIsFadingOut(true);
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setIsFadingOut(false);
          }, 300);
        }, 200);
      }
    };

    const bridgeClasses = {
      top: "absolute w-full h-4 -bottom-4 left-0 pointer-events-none z-[10001]",
      bottom: "absolute w-full h-4 -top-4 left-0 pointer-events-none z-[10001]",
      left: "absolute h-full w-4 -right-4 top-0 pointer-events-none z-[10001]",
      right: "absolute h-full w-4 -left-4 top-0 pointer-events-none z-[10001]"
    };

    return (
      <div 
        className={bridgeClasses[position as keyof typeof bridgeClasses]}
        onMouseEnter={handleBridgeMouseEnter}
        onMouseLeave={handleBridgeMouseLeave}
        style={{ pointerEvents: 'auto' }}
      />
    );
  };

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
            initial={{ 
              opacity: 0, 
              y: position === "top" ? 5 : position === "bottom" ? -5 : 0
            }}
            animate={{ 
              opacity: 1, 
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              y: position === "top" ? 5 : position === "bottom" ? -5 : 0
            }}
            transition={{ 
              duration: 0.15, 
              ease: "easeOut"
            }}
          >
            <div className="relative pointer-events-none">
              <div 
                className="glass rounded-[var(--radius)] p-4 border border-white/20 backdrop-blur-xl pointer-events-auto max-w-sm overflow-hidden"
                style={{ cursor: 'default', boxShadow: 'none', boxSizing: 'border-box' }}
                onMouseEnter={() => {
                  isHoveringTooltip.current = true;
                  setIsFadingOut(false);
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                }}
                onMouseLeave={() => {
                  isHoveringTooltip.current = false;
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                  
                  if (!isHoveringTrigger.current) {
                    setIsFadingOut(true);
                    timeoutRef.current = setTimeout(() => {
                      setIsVisible(false);
                      setTimeout(() => {
                        setIsFadingOut(false);
                      }, 300);
                    }, 200);
                  }
                }}
              >
              {/* Banner */}
              {user.profile?.bannerUrl && (
                <motion.div 
                  className="relative h-20 mb-3 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Image
                    src={user.profile.bannerUrl}
                    alt="Profile banner"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}
              
              {/* Profile Header */}
              <div className="flex items-start gap-3 mb-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/u/${user.username}`;
                    }}
                    className="relative group cursor-pointer"
                  >
                    <div className="group-hover:opacity-80 transition-opacity">
                      <Avatar src={user.profile?.avatarUrl} size={48} />
                    </div>
                    {/* Hover eyeball icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[10000]">
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.div 
                    className="flex items-center gap-2 mb-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/u/${user.username}`;
                      }}
                      className="font-semibold text-white hover:underline transition-colors cursor-pointer truncate"
                    >
                      {user.name || user.username}
                    </button>
                    {user.profile?.verified && (
                      <motion.span 
                        className="text-blue-400 flex items-center"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </motion.span>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    className="text-sm text-[var(--muted-foreground)] mb-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    @{user.username}
                  </motion.div>
                  
                  {user.profile?.profileType && (
                    <motion.span 
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] tracking-wide ${(() => {
                        switch (user.profile!.profileType) {
                          case "DEVELOPER":
                            return "border-blue-500/40 bg-blue-500/10 text-blue-400";
                          case "CLIENT":
                            return "border-green-500/40 bg-green-500/10 text-green-400";
                          case "STUDIO":
                            return "border-purple-500/40 bg-purple-500/10 text-purple-400";
                          case "INFLUENCER":
                            return "border-red-500/40 bg-red-500/10 text-red-400";
                          case "INVESTOR":
                            return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
                          case "GUEST":
                            return "border-gray-500/40 bg-gray-500/10 text-gray-400";
                          default:
                            return "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]";
                        }
                      })()}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" className="currentColor"><path d="M12 3l6 3v6c0 4-6 9-6 9s-6-5-6-9V6l6-3Z" fill="currentColor"/></svg>
                      {getProfileTypeConfig(user.profile.profileType).label}
                    </motion.span>
                  )}
                </div>
              </div>
              
              {/* Bio */}
              {user.profile?.bio && (
                <motion.div 
                  className="mb-3 text-sm text-[var(--muted-foreground)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {user.profile.bio}
                </motion.div>
              )}
              
              {/* Location and Website */}
              {(user.profile?.location || user.profile?.website) && (
                <motion.div 
                  className="mb-4 space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {user.profile?.location && (
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{user.profile.location}</span>
                    </div>
                  )}
                  {user.profile?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.profile.website}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Stats */}
              {user._count && (
                <motion.div 
                  className="flex gap-4 mb-4 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/u/${user.username}/followers`;
                    }}
                    className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-white">{user._count.followers}</span>
                    <span className="text-[var(--muted-foreground)] ml-1">followers</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/u/${user.username}/following`;
                    }}
                    className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-white">{user._count.following}</span>
                    <span className="text-[var(--muted-foreground)] ml-1">following</span>
                  </button>
                </motion.div>
              )}
              
              {/* Follow Button */}
              {currentUserId && currentUserId !== user.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <FollowButton
                    targetUserId={user.id}
                    initialFollowing={isFollowing}
                    onToggle={handleFollowToggle}
                    disabled={isLoadingFollowing}
                  />
                </motion.div>
              )}
              </div>
            </div>
            
            <BridgeElement />
          </motion.div>
        )}
      </AnimatePresence>
  );

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block cursor-pointer"
      style={{ touchAction: 'none', cursor: 'pointer' }}
      data-profile-trigger
    >
      {children}
      {mounted && createPortal(tooltipContent, document.body)}
    </div>
  );
}
