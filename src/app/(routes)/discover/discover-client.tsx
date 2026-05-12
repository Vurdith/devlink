"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PROFILE_TYPE_CONFIG } from "@/types/profile";
import Link from "next/link";
import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink";
import { MetricLink } from "@/components/ui/DataDisplay";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { SegmentedTabs, type SegmentedTabItem } from "@/components/ui/SegmentedTabs";
import { iconBox, surface } from "@/components/ui/design-system";
import { Search } from "lucide-react";

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
    intent: "Browse public profiles"
  },
  {
    value: "DEVELOPER",
    label: PROFILE_TYPE_CONFIG.DEVELOPER.label + "s",
    shortLabel: "Developers",
    icon: PROFILE_TYPE_CONFIG.DEVELOPER.icon,
    intent: "Find Roblox builders"
  },
  {
    value: "CLIENT",
    label: PROFILE_TYPE_CONFIG.CLIENT.label + "s",
    shortLabel: "Clients",
    icon: PROFILE_TYPE_CONFIG.CLIENT.icon,
    intent: "Find teams hiring"
  },
  {
    value: "STUDIO",
    label: PROFILE_TYPE_CONFIG.STUDIO.label + "s",
    shortLabel: "Studios",
    icon: PROFILE_TYPE_CONFIG.STUDIO.icon,
    intent: "Compare studios"
  },
  {
    value: "INFLUENCER",
    label: PROFILE_TYPE_CONFIG.INFLUENCER.label + "s",
    shortLabel: "Influencers",
    icon: PROFILE_TYPE_CONFIG.INFLUENCER.icon,
    intent: "Find audience-led creators"
  },
  {
    value: "INVESTOR",
    label: PROFILE_TYPE_CONFIG.INVESTOR.label + "s",
    shortLabel: "Investors",
    icon: PROFILE_TYPE_CONFIG.INVESTOR.icon,
    intent: "Find backers and advisors"
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
  if (user._count.followers > 0) return `${formatCount(user._count.followers)} followers`;
  return "No bio added";
}

function DiscoverUserRow({
  user,
  currentUserId,
  onFollowToggle,
}: {
  user: User;
  currentUserId?: string;
  onFollowToggle: (userId: string, isFollowing: boolean) => void;
}) {
  const isCurrentUser = currentUserId === user.id;
  const displayName = user.name || user.username;

  return (
    <div
      className={surface(
        "panelMuted",
        "group relative overflow-hidden transition-colors duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.22)] hover:bg-white/[0.04]"
      )}
    >
      <Link href={`/u/${user.username}`} className="absolute inset-0 z-0" aria-label={`Open @${user.username}`}>
        <span className="sr-only">Open @{user.username}</span>
      </Link>

      <div className="relative z-10 grid min-w-0 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 gap-3.5">
          <Link href={`/u/${user.username}`} className="relative flex-shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
            {user.profile?.avatarUrl ? (
              <Image
                src={user.profile.avatarUrl}
                alt={user.username}
                width={52}
                height={52}
                className="h-12 w-12 rounded-full border border-white/[0.12] object-cover sm:h-[52px] sm:w-[52px]"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[0.12] bg-gradient-to-br from-[var(--color-accent-2)] to-[var(--color-accent)] text-lg font-bold text-white sm:h-[52px] sm:w-[52px]">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            {user.profile?.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--background)] bg-[var(--color-accent-2)]">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Link
                href={`/u/${user.username}`}
            className="truncate rounded text-base font-semibold text-white outline-none transition-colors group-hover:text-[var(--color-accent-2)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
              >
                {displayName}
              </Link>
              <ProfileTypeLabel profileType={getProfileType(user)} variant="compact" />
            </div>
            <div className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">@{user.username}</div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/62">
              {getSignal(user)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-3 text-xs text-[var(--muted-foreground)] md:border-t-0 md:pt-0 md:justify-end">
            <MetricLink href={`/u/${user.username}/followers`} className="relative z-20" label="followers" value={formatCount(user._count.followers)} />
            <MetricLink href={`/u/${user.username}/following`} className="relative z-20" label="following" value={formatCount(user._count.following)} />
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
  const filterTabs: SegmentedTabItem<ProfileType>[] = filters.map((filter) => ({
    id: filter.value,
    label: filter.shortLabel,
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={filter.icon} />
      </svg>
    ),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
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
        <div className="relative p-4 sm:p-6">
          <div>
            <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Browse Roblox creators
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Filter by role and open profiles that look relevant.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[236px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SegmentedTabs
            items={filterTabs}
            value={selectedFilter}
            onValueChange={handleFilterChange}
            ariaLabel="Discover roles"
            size="sm"
            listClassName="lg:flex-col lg:overflow-visible lg:pb-0"
            itemClassName="lg:min-w-0"
          />

          <div className={surface("empty", "mt-3 hidden p-4 lg:block")}>
            <div className={iconBox("cyan", "mb-3 h-9 w-9")}>
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="text-sm font-semibold text-white">{selectedFilterLabel}</div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{selectedFilterIntent}</p>
            <ActionLink href="/search" variant="secondary" size="sm" className="mt-3">
              Search profiles
            </ActionLink>
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
            <div className="text-xs text-[var(--muted-foreground)]">{users.length} shown</div>
          </div>

          <section className="space-y-2">
              {users.map((user) => (
                <DiscoverUserRow key={user.id} user={user} currentUserId={currentUserId} onFollowToggle={handleFollowToggle} />
              ))}
          </section>
          
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                <span>Loading more profiles</span>
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
              <p className="text-sm text-[var(--muted-foreground)]">No more profiles in this role.</p>
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


