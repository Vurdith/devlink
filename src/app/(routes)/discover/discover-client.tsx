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
import { surface } from "@/components/ui/design-system";
import { Search, UserRound, UsersRound } from "lucide-react";

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
  return "Bio not published";
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
      {user.profile?.bannerUrl ? (
        <div className="relative h-24 overflow-hidden border-b border-white/[0.06] bg-black/25 sm:h-28">
          <Image
            src={user.profile.bannerUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.02),rgba(7,9,13,0.20))]" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="relative h-24 border-b border-white/[0.06] opacity-80 sm:h-28"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--color-accent-3-rgb),0.22), rgba(var(--color-accent-rgb),0.10) 46%, rgba(7,9,13,0.92) 100%)",
          }}
        />
      )}
      <Link href={`/u/${user.username}`} className="absolute inset-0 z-0" aria-label={`Open @${user.username}`}>
        <span className="sr-only">Open @{user.username}</span>
      </Link>

      <div className="relative z-10 grid min-h-[104px] min-w-0 gap-4 bg-[rgba(7,9,13,0.88)] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 gap-4">
          <Link href={`/u/${user.username}`} className="relative flex-shrink-0 self-start rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
            {user.profile?.avatarUrl ? (
              <Image
                src={user.profile.avatarUrl}
                alt={user.username}
                width={64}
                height={64}
                className="h-14 w-14 rounded-full border border-white/[0.14] object-cover ring-4 ring-white/[0.035] transition-transform duration-200 group-hover:scale-[1.02] sm:h-16 sm:w-16"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.14] bg-gradient-to-br from-[var(--color-accent-2)] to-[var(--color-accent)] text-lg font-bold text-white ring-4 ring-white/[0.035] transition-transform duration-200 group-hover:scale-[1.02] sm:h-16 sm:w-16">
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

          <div className="min-w-0 flex-1 self-center">
            <div className="flex min-w-0 items-center">
              <Link
                href={`/u/${user.username}`}
                className="truncate rounded font-[var(--font-space-grotesk)] text-base font-bold tracking-normal text-white outline-none transition-colors group-hover:text-[var(--color-accent-2)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] sm:text-lg"
              >
                {displayName}
              </Link>
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-xs text-[var(--muted-foreground)]">@{user.username}</span>
              <ProfileTypeLabel profileType={getProfileType(user)} variant="compact" />
            </div>
            <p className="mt-3 line-clamp-1 border-l-2 border-[rgba(var(--color-accent-2-rgb),0.45)] pl-3 text-sm font-medium leading-relaxed text-white/66">
              {getSignal(user)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-[var(--muted-foreground)] md:min-w-[260px] md:justify-end md:border-t-0 md:pt-0">
            <MetricLink
              href={`/u/${user.username}/followers`}
              className="relative z-20"
              label="followers"
              value={formatCount(user._count.followers)}
              icon={<UsersRound className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <MetricLink
              href={`/u/${user.username}/following`}
              className="relative z-20"
              label="following"
              value={formatCount(user._count.following)}
              icon={<UserRound className="h-3.5 w-3.5" aria-hidden="true" />}
            />
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
      <section className="mb-4 grid gap-3 border-b border-white/[0.06] px-1 pb-4 sm:mb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
            Discover
          </p>
          <h1 className="mt-1 font-[var(--font-space-grotesk)] text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Browse Roblox creators
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            Filter by role and open profiles that look relevant.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/72">
          {users.length} shown
        </span>
      </section>

      <div className="grid gap-4 lg:grid-cols-[236px_1fr]">
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

          <div className="mt-3 hidden lg:block">
            <ActionLink
              href="/search"
              variant="secondary"
              size="sm"
              className="w-full justify-start gap-2 border-white/[0.08] bg-white/[0.025] text-white/72 hover:border-[rgba(var(--color-accent-2-rgb),0.22)] hover:bg-white/[0.045] hover:text-white"
            >
              <Search className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />
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
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
                {selectedFilterLabel}
              </p>
              <h2 className="mt-1 font-[var(--font-space-grotesk)] text-lg font-semibold tracking-tight text-white">
                {selectedFilterIntent}
              </h2>
            </div>
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


