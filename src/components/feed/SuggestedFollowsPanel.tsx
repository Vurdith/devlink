"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, UsersRound } from "lucide-react";

import { FollowButton } from "@/components/ui/FollowButton";
import { ToneBadge } from "@/components/ui/DataDisplay";
import { surface } from "@/components/ui/design-system";
import type { SuggestedFollowUser } from "@/server/discover/suggested-users";

function formatCount(count: number) {
  return new Intl.NumberFormat("en", { notation: count > 999 ? "compact" : "standard" }).format(count);
}

function getDisplayName(user: SuggestedFollowUser) {
  return user.name || user.username;
}

export function SuggestedFollowsPanel({ suggestions }: { suggestions: SuggestedFollowUser[] }) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const visibleSuggestions = useMemo(
    () => suggestions.filter((suggestion) => !hiddenIds.has(suggestion.id)),
    [hiddenIds, suggestions]
  );

  if (visibleSuggestions.length === 0) return null;

  return (
    <section className={surface("panelMuted", "noise-overlay relative mb-5 overflow-hidden p-4 sm:p-5")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />
            <h2 className="text-base font-semibold tracking-normal text-white">Tune your feed</h2>
          </div>
          <p className="mt-1 max-w-xl text-sm leading-5 text-white/52">
            Follow a few relevant people so the next Home feed has better work, hiring signals, and replies.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/72 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
        >
          Discover
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-2">
        {visibleSuggestions.map((user) => {
          const displayName = getDisplayName(user);
          const primarySkill = user.matchingSkills[0] || user.skills[0]?.skill.name;

          return (
            <article
              key={user.id}
              className="grid min-w-0 gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href={`/u/${user.username}`}
                  className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
                >
                  {user.profile?.avatarUrl ? (
                    <Image
                      src={user.profile.avatarUrl}
                      alt={displayName}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-sm font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/u/${user.username}`}
                      className="truncate text-sm font-semibold text-white transition-colors hover:text-[var(--color-accent-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
                    >
                      {displayName}
                    </Link>
                    {user.profile?.verified ? <ToneBadge tone="info">Verified</ToneBadge> : null}
                  </div>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-white/48">
                    <span className="truncate">@{user.username}</span>
                    <span aria-hidden="true">/</span>
                    <span className="inline-flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatCount(user._count.followers)} followers
                    </span>
                    {primarySkill ? (
                      <>
                        <span aria-hidden="true">/</span>
                        <span className="truncate">{primarySkill}</span>
                      </>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs font-medium text-[var(--color-accent-2)]">{user.reason}</p>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <FollowButton
                  targetUserId={user.id}
                  compact
                  onToggle={(following) => {
                    if (!following) return;
                    setHiddenIds((current) => new Set(current).add(user.id));
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
