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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className={surface("panel", "mb-5 overflow-hidden p-5")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
          </div>
          <div className={iconBox("cyan", "h-11 w-11")}>{headerIcon}</div>
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
            className="sm:col-span-2"
            icon={emptyIcon}
          />
        ) : null}
      </div>
    </main>
  );
}
