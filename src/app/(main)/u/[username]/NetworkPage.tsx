import type { ReactNode } from "react";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface } from "@/components/ui/design-system";
import { NetworkProfileCard, type NetworkUser } from "./NetworkProfileCard";

interface NetworkPageProps {
  title: string;
  eyebrow?: string;
  description: string;
  headerIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
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
  users,
  currentUserId,
  followingIds,
}: NetworkPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-3 py-6 sm:px-5 sm:py-10">
      <section className={surface("panelStrong", "noise-overlay relative mb-5 overflow-hidden p-5 sm:p-6")}>
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
          </div>
          <div className={iconBox("cyan", "h-11 w-11 flex-shrink-0 sm:h-12 sm:w-12")}>{headerIcon}</div>
        </div>
      </section>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
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
