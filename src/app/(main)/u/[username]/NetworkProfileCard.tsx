import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { surface } from "@/components/ui/design-system";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";

export interface NetworkUser {
  id: string;
  username: string;
  name: string | null;
  _count: { followers: number; following: number };
  profile: {
    avatarUrl: string | null;
    bannerUrl?: string | null;
    profileType?: string | null;
    verified?: boolean;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
  } | null;
}

interface NetworkProfileCardProps {
  user: NetworkUser;
  currentUserId?: string;
  initiallyFollowing: boolean;
}

export function NetworkProfileCard({
  user,
  currentUserId,
  initiallyFollowing,
}: NetworkProfileCardProps) {
  const profileType = user.profile?.profileType;

  return (
    <div className={surface("panelMuted", "group relative overflow-hidden transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.035]")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-28 bg-white/[0.025] sm:block"
        style={{
          backgroundImage: user.profile?.bannerUrl
            ? `linear-gradient(180deg, rgba(8,11,16,0.12), rgba(8,11,16,0.74)), url(${user.profile.bannerUrl})`
            : "linear-gradient(135deg, rgba(var(--color-accent-2-rgb),0.14), rgba(var(--color-accent-rgb),0.07))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:pl-5">
        <ProfileTooltip user={user} currentUserId={currentUserId}>
          <Link
            href={`/u/${user.username}`}
            className="relative z-10 flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(10,13,18)]"
          >
            <Avatar src={user.profile?.avatarUrl ?? undefined} size={56} className="border-4 border-[rgb(10,13,18)]" />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-semibold text-white transition-colors group-hover:text-[var(--color-accent-2)]">
                  {user.name || user.username}
                </span>
                {currentUserId === user.id ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.045] px-1.5 py-0.5 text-[10px] font-semibold text-white/60">
                    You
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm text-[var(--muted-foreground)]">@{user.username}</p>
            </div>
          </Link>
        </ProfileTooltip>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {profileType ? <ProfileTypeLabel profileType={profileType} variant="inline" /> : null}
            {user.profile?.location ? (
              <span className="truncate rounded-md border border-white/[0.08] bg-white/[0.028] px-2 py-1 text-xs text-white/52">
                {user.profile.location}
              </span>
            ) : null}
          </div>
          {user.profile?.bio ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/58">{user.profile.bio}</p>
          ) : (
            <p className="mt-2 text-sm italic text-white/35">No bio yet</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
            {[
              ["followers", user._count.followers],
              ["following", user._count.following],
            ].map(([label, count]) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <strong className="font-semibold text-white">{count}</strong>
                {label}
              </span>
            ))}
          </div>
        </div>

        {currentUserId !== user.id ? (
          <div className="relative z-20 flex-shrink-0">
            <FollowButton targetUserId={user.id} initialFollowing={initiallyFollowing} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}
