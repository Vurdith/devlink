"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { PROFILE_TYPE_CONFIG } from "@/lib/profile-types";
import Link from "next/link";
import Image from "next/image";
import { FollowButton } from "@/components/ui/FollowButton";

type ProfileType = "all" | "DEVELOPER" | "CLIENT" | "INFLUENCER" | "STUDIO" | "INVESTOR";

interface User {
  id: string;
  username: string;
  name: string | null;
  profile: {
    avatarUrl: string | null;
    bannerUrl: string | null;
    profileType: string;
    verified: boolean;
    bio: string | null;
  } | null;
  _count: {
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [selectedFilter, setSelectedFilter] = useState<ProfileType>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filters: { value: ProfileType; label: string; icon: string; color: string; bgColor: string }[] = [
    {
      value: "all",
      label: "All Profiles",
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
      color: "text-white",
      bgColor: "bg-white/20"
    },
    {
      value: "DEVELOPER",
      label: PROFILE_TYPE_CONFIG.DEVELOPER.label + "s",
      icon: PROFILE_TYPE_CONFIG.DEVELOPER.icon,
      color: PROFILE_TYPE_CONFIG.DEVELOPER.color,
      bgColor: PROFILE_TYPE_CONFIG.DEVELOPER.bgColor
    },
    {
      value: "CLIENT",
      label: PROFILE_TYPE_CONFIG.CLIENT.label + "s",
      icon: PROFILE_TYPE_CONFIG.CLIENT.icon,
      color: PROFILE_TYPE_CONFIG.CLIENT.color,
      bgColor: PROFILE_TYPE_CONFIG.CLIENT.bgColor
    },
    {
      value: "STUDIO",
      label: PROFILE_TYPE_CONFIG.STUDIO.label + "s",
      icon: PROFILE_TYPE_CONFIG.STUDIO.icon,
      color: PROFILE_TYPE_CONFIG.STUDIO.color,
      bgColor: PROFILE_TYPE_CONFIG.STUDIO.bgColor
    },
    {
      value: "INFLUENCER",
      label: PROFILE_TYPE_CONFIG.INFLUENCER.label + "s",
      icon: PROFILE_TYPE_CONFIG.INFLUENCER.icon,
      color: PROFILE_TYPE_CONFIG.INFLUENCER.color,
      bgColor: PROFILE_TYPE_CONFIG.INFLUENCER.bgColor
    },
    {
      value: "INVESTOR",
      label: PROFILE_TYPE_CONFIG.INVESTOR.label + "s",
      icon: PROFILE_TYPE_CONFIG.INVESTOR.icon,
      color: PROFILE_TYPE_CONFIG.INVESTOR.color,
      bgColor: PROFILE_TYPE_CONFIG.INVESTOR.bgColor
    }
  ];

  const fetchUsers = useCallback(async (cursor?: string | null) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      let url = selectedFilter === "all" 
        ? "/api/discover" 
        : `/api/discover?type=${selectedFilter}`;
      
      if (cursor) {
        url += `${url.includes('?') ? '&' : '?'}cursor=${cursor}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (cursor) {
          setUsers(prev => [...prev, ...(data.users || [])]);
        } else {
          setUsers(data.users || []);
        }
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    setUsers([]);
    setNextCursor(null);
    setHasMore(false);
    fetchUsers();
  }, [selectedFilter, fetchUsers]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && nextCursor) {
          fetchUsers(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [hasMore, loadingMore, nextCursor, fetchUsers]);

  const getProfileConfig = (type: string) => {
    return PROFILE_TYPE_CONFIG[type as keyof typeof PROFILE_TYPE_CONFIG] || PROFILE_TYPE_CONFIG.GUEST;
  };

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, isFollowing, _count: { ...u._count, followers: u._count.followers + (isFollowing ? 1 : -1) } } 
        : u
    ));
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Discover</h1>
        <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
          Find developers, clients, studios, influencers, and investors in the Roblox community.
        </p>
      </div>
      
      {/* Filter Tabs - Horizontal scroll on mobile */}
      <div className="mb-4 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0 ${
                selectedFilter === filter.value
                  ? `${filter.bgColor} ${filter.color} border border-current/30 shadow-lg`
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg ${selectedFilter === filter.value ? "bg-current/20" : "bg-white/10"}`}>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d={filter.icon} />
                </svg>
              </div>
              <span className="font-medium text-xs sm:text-sm">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
              <div className="h-16 sm:h-20 bg-white/5" />
              <div className="p-3 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 -mt-10 sm:-mt-12 border-3 sm:border-4 border-[var(--background)]" />
                </div>
                <div className="h-4 sm:h-5 w-28 sm:w-32 bg-white/10 rounded mb-2" />
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/10 rounded mb-3" />
                <div className="h-5 sm:h-6 w-20 sm:w-24 bg-white/10 rounded mb-3" />
                <div className="h-3 sm:h-4 w-full bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map((user) => {
              const config = getProfileConfig(user.profile?.profileType || "GUEST");
              const isCurrentUser = session?.user?.id === user.id;
              
              return (
                <div 
                  key={user.id} 
                  className="glass rounded-xl sm:rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  {/* Banner - fixed height, always visible */}
                  <Link href={`/u/${user.username}`} className="block">
                    <div className="h-16 sm:h-20 w-full bg-gradient-to-br from-purple-900/30 to-slate-900/50 relative">
                      {user.profile?.bannerUrl && (
                        <Image
                          src={user.profile.bannerUrl}
                          alt=""
                          width={400}
                          height={80}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-3 sm:p-6">
                    {/* Avatar - overlapping the banner */}
                    <Link href={`/u/${user.username}`} className="block -mt-10 sm:-mt-14 mb-3 sm:mb-4 w-fit">
                      <div className="relative">
                        {user.profile?.avatarUrl ? (
                          <Image
                            src={user.profile.avatarUrl}
                            alt={user.username}
                            width={64}
                            height={64}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 sm:border-4 border-[var(--background)]"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-3 sm:border-4 border-[var(--background)]">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {user.profile?.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[var(--background)]">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    {/* Name & Username */}
                    <Link href={`/u/${user.username}`}>
                      <h3 className="font-semibold text-sm sm:text-base text-white truncate hover:underline">
                        {user.name || user.username}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1.5 sm:mb-2">@{user.username}</p>
                    </Link>
                    
                    {/* Profile Type Badge */}
                    <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium ${config.bgColor} ${config.color} mb-2 sm:mb-3`}>
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d={config.icon} />
                      </svg>
                      {config.label}
                    </div>
                    
                    {/* Bio */}
                    {user.profile?.bio ? (
                      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3 sm:mb-4">
                        {user.profile.bio}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-[var(--muted-foreground)]/50 italic mb-3 sm:mb-4">
                        No bio yet
                      </p>
                    )}
                    
                    {/* Stats + Follow Button Row - consistent height */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 min-h-[40px]">
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <Link 
                          href={`/u/${user.username}/followers`}
                          className="text-[var(--muted-foreground)] hover:text-white transition-colors"
                        >
                          <span className="font-semibold text-white tabular-nums">{user._count.followers}</span> followers
                        </Link>
                        <Link 
                          href={`/u/${user.username}/following`}
                          className="text-[var(--muted-foreground)] hover:text-white transition-colors"
                        >
                          <span className="font-semibold text-white tabular-nums">{user._count.following}</span> following
                        </Link>
                      </div>
                      
                      {/* Always reserve space for the button for consistent alignment */}
                      <div className="flex-shrink-0">
                        {!isCurrentUser && session ? (
                          <FollowButton 
                            targetUserId={user.id}
                            initialFollowing={user.isFollowing || false}
                            compact
                            onToggle={(following) => handleFollowToggle(user.id, following)}
                          />
                        ) : (
                          /* Invisible placeholder to maintain alignment */
                          <div className="w-[72px] sm:w-[80px]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                <span>Loading more...</span>
              </div>
            )}
            {!hasMore && users.length > 0 && (
              <p className="text-[var(--muted-foreground)] text-sm">You've reached the end! 🎉</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted-foreground)]">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
          <p className="text-[var(--muted-foreground)]">
            {selectedFilter === "all" 
              ? "No users have joined yet. Be the first!"
              : `No ${filters.find(f => f.value === selectedFilter)?.label.toLowerCase()} have joined yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
