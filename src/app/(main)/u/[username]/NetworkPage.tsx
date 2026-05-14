import type { ReactNode } from "react";
import Link from "next/link";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface } from "@/components/ui/design-system";
import { NetworkProfileCard, type NetworkUser } from "./NetworkProfileCard";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/types/profile";
import { UsersRound } from "lucide-react";

interface NetworkPageProps {
  title: string;
  eyebrow?: string;
  description: string;
  headerIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
  backHref: string;
  users: NetworkUser[];
  currentUserId?: string;
  followingIds: Set<string>;
}

export function NetworkPage({
  title,
  eyebrow = "Network",
  description,
  headerIcon,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  backHref,
  users,
  currentUserId,
  followingIds,
}: NetworkPageProps) {
  const profileHandle = backHref.split("/").filter(Boolean).at(-1);
  const verifiedCount = users.filter((user) => user.profile?.verified).length;
  const roleCounts = users.reduce<Record<string, number>>((counts, user) => {
    const role = user.profile?.profileType;
    if (!role) return counts;
    counts[role] = (counts[role] ?? 0) + 1;
    return counts;
  }, {});
  const topRoles = Object.entries(roleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-9">
      <section className="mb-5 border-b border-white/[0.07] pb-5">
        <Link
          href={backHref}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-semibold text-white/62 transition-colors hover:border-white/[0.14] hover:bg-white/[0.055] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
          </svg>
          {profileHandle ? `Back to @${profileHandle}` : "Back to profile"}
        </Link>
        <div className={surface("panelStrong", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(760px 220px at 10% 0%, rgba(var(--color-accent-2-rgb),0.13), transparent 62%), radial-gradient(560px 180px at 100% 18%, rgba(var(--color-accent-rgb),0.08), transparent 64%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
            {users.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-black/[0.16] px-3 text-sm font-semibold text-white/78">
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-[var(--color-accent-2)]">
                    <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span>{users.length}</span>
                  <span className="text-xs font-medium text-white/42">people</span>
                </span>
                {verifiedCount > 0 ? (
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-black/[0.16] px-3 text-sm font-semibold text-white/78">
                    <span className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-[var(--color-accent-2)]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                    <span>{verifiedCount}</span>
                    <span className="text-xs font-medium text-white/42">verified</span>
                  </span>
                ) : null}
                {topRoles.map(([role, count]) => {
                  const config = getProfileTypeConfig(role);

                  return (
                    <span key={role} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-black/[0.16] px-3 text-sm font-semibold text-white/78">
                    <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-[var(--color-accent-2)]">
                        <ProfileTypeIcon profileType={role} size={14} />
                      </span>
                      <span>{count}</span>
                      <span className="text-xs font-medium text-white/42">{config.label}</span>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className={iconBox("cyan", "h-11 w-11 flex-shrink-0 sm:h-12 sm:w-12")}>{headerIcon}</div>
        </div>
        </div>
      </section>

      <div className="grid auto-rows-fr gap-3 lg:grid-cols-2">
        {users.map((user) => (
          <NetworkProfileCard
            key={user.id}
            user={user}
            currentUserId={currentUserId}
            initiallyFollowing={followingIds.has(user.id)}
          />
        ))}

        {users.length === 0 ? (
          <FeedbackState
            title={emptyTitle}
            description={emptyDescription}
            className="py-16 sm:col-span-2"
            icon={emptyIcon}
          />
        ) : null}
      </div>
    </main>
  );
}
