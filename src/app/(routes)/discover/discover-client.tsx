"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PROFILE_TYPE_CONFIG } from "@/lib/profile-types";
import Link from "next/link";
import Image from "next/image";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";

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

interface DiscoverClientProps {
  initialUsers: User[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  currentUserId?: string;
}

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

export function DiscoverClient({ 
  initialUsers, 
  initialNextCursor, 
  initialHasMore,
  currentUserId 
}: DiscoverClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<ProfileType>("all");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async (filter: ProfileType, cursor?: string | null) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      let url = filter === "all" 
        ? "/api/discover" 
        : `/api/discover?type=${filter}`;
      
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
  }, []);

  // When filter changes, fetch new data
  const handleFilterChange = useCallback((filter: ProfileType) => {
    if (filter === selectedFilter) return;
    setSelectedFilter(filter);
    setUsers([]);
    setNextCursor(null);
    setHasMore(false);
    fetchUsers(filter);
  }, [selectedFilter, fetchUsers]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && nextCursor) {
          fetchUsers(selectedFilter, nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [hasMore, loadingMore, nextCursor, selectedFilter, fetchUsers]);

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
    <div className="max-w-6xl mx-auto">
      {/* Header + Filters (single cohesive panel) */}
      <div className="relative overflow-hidden glass-soft rounded-2xl border border-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-55"
          style={{
            background:
              "radial-gradient(900px 260px at 20% 0%, rgba(var(--color-accent-rgb),0.10), transparent 62%), radial-gradient(700px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.08), transparent 60%)",
          }}
        />
        <div className="relative p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-[var(--font-space-grotesk)]">Discover</h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            Find developers, clients, studios, influencers, and investors in the Roblox community.
          </p>

          <div className="mt-4 sm:mt-5 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

          <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0 ${
                  selectedFilter === filter.value
                    ? `${filter.bgColor} ${filter.color} border border-current/30 shadow-lg`
                    : "bg-white/[0.03] text-[var(--muted-foreground)] hover:bg-white/[0.06] hover:text-white border border-white/10"
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
      </div>
      
      {/* Users Grid */}
      <div className="mt-4 sm:mt-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="relative overflow-hidden glass-soft border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
              <div className="h-24 sm:h-28 bg-white/5" />
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
              const isCurrentUser = currentUserId === user.id;
              
              return (
                <div 
                  key={user.id} 
                  className="relative overflow-hidden glass-soft rounded-xl sm:rounded-2xl transition-all duration-200 border border-white/10 hover:border-white/20 flex flex-col h-[340px] sm:h-[390px]"
                >
                  {/* Banner */}
                  <Link href={`/u/${user.username}`} className="block">
                    <div className="relative h-24 sm:h-28 w-full bg-gradient-to-br from-[rgba(var(--color-accent-rgb),0.18)] via-black/20 to-black/40">
                      {user.profile?.bannerUrl && (
                        <Image
                          src={user.profile.bannerUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-start justify-between gap-3">
                      <ProfileTooltip user={user} currentUserId={currentUserId}>
                        <Link href={`/u/${user.username}`} className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            {user.profile?.avatarUrl ? (
                              <Image
                                src={user.profile.avatarUrl}
                                alt={user.username}
                                width={48}
                                height={48}
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-4 border-[var(--background)]"
                              />
                            ) : (
                              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-pink-500 flex items-center justify-center text-white text-lg font-bold border-4 border-[var(--background)]">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {user.profile?.verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full grid place-items-center border-2 border-[var(--background)]">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">{user.name || user.username}</div>
                            <div className="text-xs text-[var(--muted-foreground)] truncate">@{user.username}</div>
                          </div>
                        </Link>
                      </ProfileTooltip>

                      <div className="flex-shrink-0 pt-0.5">
                        {!isCurrentUser && currentUserId ? (
                          <FollowButton 
                            targetUserId={user.id}
                            initialFollowing={user.isFollowing || false}
                            compact
                            onToggle={(following) => handleFollowToggle(user.id, following)}
                          />
                        ) : (
                          <div className="w-[72px]" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border border-white/10 ${config.bgColor} ${config.color}`}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d={config.icon} />
                        </svg>
                        {config.label}
                      </span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <p className="mt-4 mb-4 text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3 min-h-[60px]">
                      {user.profile?.bio || "No bio yet"}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-4">
                        <Link href={`/u/${user.username}/followers`} className="hover:text-white transition-colors">
                          <span className="font-semibold text-white tabular-nums">{user._count.followers}</span>{" "}
                          followers
                        </Link>
                        <Link href={`/u/${user.username}/following`} className="hover:text-white transition-colors">
                          <span className="font-semibold text-white tabular-nums">{user._count.following}</span>{" "}
                          following
                        </Link>
                      </div>
                      <Link href={`/u/${user.username}`} className="text-white/40 hover:text-white/70 transition-colors" aria-label={`Open ${user.username}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
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
              <p className="text-[var(--muted-foreground)] text-sm">You’re all caught up.</p>
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
    </div>
  );
}


