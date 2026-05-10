"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PROFILE_TYPE_CONFIG } from "@/types/profile";
import Link from "next/link";
import Image from "next/image";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { Compass, Search, Users } from "lucide-react";

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

const filters: { value: ProfileType; label: string; shortLabel: string; icon: string; intent: string }[] = [
  {
    value: "all",
    label: "All profiles",
    shortLabel: "All",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    intent: "Browse the full community"
  },
  {
    value: "DEVELOPER",
    label: PROFILE_TYPE_CONFIG.DEVELOPER.label + "s",
    shortLabel: "Developers",
    icon: PROFILE_TYPE_CONFIG.DEVELOPER.icon,
    intent: "Find builders to follow or hire"
  },
  {
    value: "CLIENT",
    label: PROFILE_TYPE_CONFIG.CLIENT.label + "s",
    shortLabel: "Clients",
    icon: PROFILE_TYPE_CONFIG.CLIENT.icon,
    intent: "Spot people posting work"
  },
  {
    value: "STUDIO",
    label: PROFILE_TYPE_CONFIG.STUDIO.label + "s",
    shortLabel: "Studios",
    icon: PROFILE_TYPE_CONFIG.STUDIO.icon,
    intent: "Compare teams and agencies"
  },
  {
    value: "INFLUENCER",
    label: PROFILE_TYPE_CONFIG.INFLUENCER.label + "s",
    shortLabel: "Influencers",
    icon: PROFILE_TYPE_CONFIG.INFLUENCER.icon,
    intent: "Track community voices"
  },
  {
    value: "INVESTOR",
    label: PROFILE_TYPE_CONFIG.INVESTOR.label + "s",
    shortLabel: "Investors",
    icon: PROFILE_TYPE_CONFIG.INVESTOR.icon,
    intent: "Find capital and advisors"
  }
];

function formatCount(count: number) {
  return new Intl.NumberFormat("en", { notation: count > 999 ? "compact" : "standard" }).format(count);
}

function getProfileType(user: User) {
  return user.profile?.profileType || "GUEST";
}

function getSignal(user: User) {
  if (user.profile?.bio) return user.profile.bio;
  if (user._count.followers > 0) return `${formatCount(user._count.followers)} followers on DevLink`;
  return "Profile is ready to browse.";
}

function DiscoverUserRow({
  user,
  currentUserId,
  onFollowToggle,
  featured = false,
}: {
  user: User;
  currentUserId?: string;
  onFollowToggle: (userId: string, isFollowing: boolean) => void;
  featured?: boolean;
}) {
  const isCurrentUser = currentUserId === user.id;
  const displayName = user.name || user.username;

  return (
    <div
      className={surface(
        featured ? "panel" : "panelMuted",
        cn(
          "group relative overflow-hidden transition-all duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.22)] hover:bg-white/[0.045]",
          featured ? "min-h-[228px]" : "min-h-[128px]"
        )
      )}
    >
      <Link href={`/u/${user.username}`} className="absolute inset-0 z-0" aria-label={`Open @${user.username}`}>
        <span className="sr-only">Open @{user.username}</span>
      </Link>

      {featured ? (
        <div className="relative h-20 w-full bg-gradient-to-br from-[rgba(var(--color-accent-2-rgb),0.13)] via-white/[0.025] to-black/40 sm:h-24">
          {user.profile?.bannerUrl && (
            <Image
              src={user.profile.bannerUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,11,16,0.96)] via-black/20 to-transparent" />
        </div>
      ) : null}

      <div className={cn("relative z-10 flex min-w-0 gap-3 p-4", featured ? "-mt-7 flex-col" : "items-start sm:items-center")}>
        <div className={cn("flex min-w-0 gap-3", featured ? "items-end" : "items-start sm:items-center")}>
          <ProfileTooltip user={user} currentUserId={currentUserId}>
            <Link href={`/u/${user.username}`} className="relative flex-shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
              {user.profile?.avatarUrl ? (
                <Image
                  src={user.profile.avatarUrl}
                  alt={user.username}
                  width={featured ? 64 : 52}
                  height={featured ? 64 : 52}
                  className={cn(
                    "rounded-full border border-white/[0.12] object-cover",
                    featured ? "h-16 w-16 ring-4 ring-[rgba(8,11,16,0.92)]" : "h-12 w-12 sm:h-[52px] sm:w-[52px]"
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "grid place-items-center rounded-full border border-white/[0.12] bg-gradient-to-br from-[var(--color-accent-2)] to-[var(--color-accent)] font-bold text-white",
                    featured ? "h-16 w-16 text-xl ring-4 ring-[rgba(8,11,16,0.92)]" : "h-12 w-12 text-lg sm:h-[52px] sm:w-[52px]"
                  )}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              {user.profile?.verified && (
                <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--background)] bg-blue-500">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              )}
            </Link>
          </ProfileTooltip>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <ProfileTooltip user={user} currentUserId={currentUserId}>
                <Link
                  href={`/u/${user.username}`}
                  className={cn(
                    "truncate rounded font-semibold text-white outline-none transition-colors group-hover:text-[var(--color-accent-2)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                    featured ? "text-lg" : "text-sm"
                  )}
                >
                  {displayName}
                </Link>
              </ProfileTooltip>
              <ProfileTypeLabel profileType={getProfileType(user)} variant="compact" />
            </div>
            <div className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">@{user.username}</div>
          </div>
        </div>

        <div className={cn("min-w-0 flex-1", featured ? "space-y-4" : "sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4")}>
          <p className={cn("line-clamp-2 text-sm leading-relaxed text-white/68", featured ? "border-l border-[rgba(var(--color-accent-2-rgb),0.28)] pl-3" : "")}>
            {getSignal(user)}
          </p>

          <div className={cn("mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] sm:mt-0", featured ? "" : "sm:justify-end")}>
            <Link href={`/u/${user.username}/followers`} className="relative z-20 rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
              <span className="font-semibold text-white tabular-nums">{formatCount(user._count.followers)}</span> followers
            </Link>
            <Link href={`/u/${user.username}/following`} className="relative z-20 rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
              <span className="font-semibold text-white tabular-nums">{formatCount(user._count.following)}</span> following
            </Link>
            {!isCurrentUser && currentUserId ? (
              <span className="relative z-20 ml-auto sm:ml-1">
                <FollowButton
                  targetUserId={user.id}
                  initialFollowing={user.isFollowing || false}
                  compact
                  onToggle={(following) => onFollowToggle(user.id, following)}
                />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
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
      } else {
        throw new Error("Discover request failed");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError(
        cursor
          ? "We couldn't load more profiles. Scroll a little and try again."
          : "We couldn't refresh this discover view. Your previous results are still here if we had them."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // When filter changes, fetch new data
  const handleFilterChange = useCallback((filter: ProfileType) => {
    if (filter === selectedFilter) return;
    setSelectedFilter(filter);
    setError(null);
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

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, isFollowing, _count: { ...u._count, followers: u._count.followers + (isFollowing ? 1 : -1) } } 
        : u
    ));
  };

  const selectedFilterLabel = filters.find((filter) => filter.value === selectedFilter)?.label ?? "profiles";
  const selectedFilterIntent = filters.find((filter) => filter.value === selectedFilter)?.intent ?? "Browse the community";
  const canShowRetry = error && !loading && users.length === 0;
  const featuredUsers = users.slice(0, 3);
  const remainingUsers = users.slice(3);
  const totalFollowers = users.reduce((count, user) => count + user._count.followers, 0);
  const verifiedCount = users.filter((user) => user.profile?.verified).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className={surface("panel", "noise-overlay relative overflow-hidden")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(780px 240px at 18% 0%, rgba(var(--color-accent-2-rgb),0.09), transparent 62%), radial-gradient(600px 240px at 92% 12%, rgba(var(--color-accent-rgb),0.055), transparent 60%)",
          }}
        />
        <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Discover
            </div>
            <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Find the next person worth following.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Browse people by role, compare profile signals quickly, then open the profiles that deserve a closer look.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.08] bg-black/15 p-2 text-center">
            <div className="min-w-0 rounded-lg bg-white/[0.035] px-2 py-2">
              <div className="text-base font-semibold text-white tabular-nums">{formatCount(users.length)}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">shown</div>
            </div>
            <div className="min-w-0 rounded-lg bg-white/[0.035] px-2 py-2">
              <div className="text-base font-semibold text-white tabular-nums">{formatCount(verifiedCount)}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">verified</div>
            </div>
            <div className="min-w-0 rounded-lg bg-white/[0.035] px-2 py-2">
              <div className="text-base font-semibold text-white tabular-nums">{formatCount(totalFollowers)}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">followers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[236px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={surface("toolbar", "p-2")}>
            <div className="mb-2 hidden px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 lg:block">Browse by role</div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleFilterChange(filter.value)}
                  aria-pressed={selectedFilter === filter.value}
                  className={cn(
                    "flex min-w-max items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] lg:min-w-0",
                    selectedFilter === filter.value
                      ? ui.active.cyanStrong
                      : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
                  )}
                >
                  <span className={cn("grid h-7 w-7 flex-shrink-0 place-items-center rounded-md", selectedFilter === filter.value ? "bg-[rgba(var(--color-accent-2-rgb),0.14)] text-[var(--color-accent-2)]" : "bg-white/[0.05] text-white/55")}>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={filter.icon} />
                    </svg>
                  </span>
                  <span className="truncate lg:hidden">{filter.shortLabel}</span>
                  <span className="hidden truncate lg:inline">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={surface("empty", "mt-3 hidden p-4 lg:block")}>
            <div className={iconBox("cyan", "mb-3 h-9 w-9")}>
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="text-sm font-semibold text-white">{selectedFilterLabel}</div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{selectedFilterIntent}</p>
            <Link
              href="/search"
              className="mt-3 inline-flex rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.045] hover:text-white"
            >
              Open search
            </Link>
          </div>
        </aside>

        <main className="min-w-0">
      {canShowRetry ? (
        <FeedbackState
          title="Discover could not load"
          description={error}
          tone="danger"
          className="py-16"
          action={{
            label: "Try again",
            onClick: () => fetchUsers(selectedFilter),
          }}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 9v4" strokeLinecap="round" />
              <path d="M12 17h.01" strokeLinecap="round" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
            </svg>
          }
        />
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={surface("panelMuted", "animate-pulse p-4")}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 h-4 w-36 rounded bg-white/10" />
                  <div className="h-3 w-24 rounded bg-white/10" />
                </div>
                <div className="hidden h-8 w-20 rounded bg-white/10 sm:block" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{selectedFilterLabel}</div>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{selectedFilterIntent}</p>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Showing <span className="font-semibold text-white tabular-nums">{users.length}</span>
            </div>
          </div>

          {featuredUsers.length > 0 ? (
            <section className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Start here
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {featuredUsers.map((user) => (
                  <DiscoverUserRow key={user.id} user={user} currentUserId={currentUserId} onFollowToggle={handleFollowToggle} featured />
                ))}
              </div>
            </section>
          ) : null}

          {remainingUsers.length > 0 ? (
            <section className="space-y-2">
              <div className="mb-2 flex items-center gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">More profiles</div>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              {remainingUsers.map((user) => (
                <DiscoverUserRow key={user.id} user={user} currentUserId={currentUserId} onFollowToggle={handleFollowToggle} />
              ))}
            </section>
          ) : null}
          
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                <span>Loading more...</span>
              </div>
            )}
            {error && users.length > 0 && !loadingMore && (
              <button
                type="button"
                onClick={() => fetchUsers(selectedFilter, nextCursor)}
                className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] px-4 py-2 text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-500/[0.10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/35"
              >
                Retry loading more
              </button>
            )}
            {!hasMore && users.length > 0 && (
              <p className="text-sm text-[var(--muted-foreground)]">End of this role view.</p>
            )}
          </div>
        </>
      ) : (
        <FeedbackState
          title="No profiles found"
          description={
            selectedFilter === "all"
              ? "New community members will appear here as they join."
              : `No ${selectedFilterLabel.toLowerCase()} match this view yet. Clear the filter to browse everyone.`
          }
          className="py-16"
          action={selectedFilter === "all" ? undefined : {
            label: "Show all profiles",
            onClick: () => handleFilterChange("all"),
          }}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
      )}
        </main>
      </div>
    </div>
  );
}


