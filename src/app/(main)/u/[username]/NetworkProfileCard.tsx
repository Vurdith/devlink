import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { MetricLink, ToneBadge } from "@/components/ui/DataDisplay";
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
    <div className={surface("panelMuted", "group relative overflow-hidden transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.035]")}>
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

      <div className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5">
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
                  <ToneBadge tone="muted" className="px-1.5 py-0.5 text-[10px]">You</ToneBadge>
                ) : null}
              </div>
              <p className="truncate text-sm text-[var(--muted-foreground)]">@{user.username}</p>
            </div>
          </Link>
        </ProfileTooltip>

        <div className="min-w-0 border-t border-white/[0.06] pt-3 sm:border-t-0 sm:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {profileType ? <ProfileTypeLabel profileType={profileType} variant="inline" /> : null}
            {user.profile?.location ? (
              <ToneBadge tone="muted" className="max-w-full">
                {user.profile.location}
              </ToneBadge>
            ) : null}
          </div>
          {user.profile?.bio ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/58">{user.profile.bio}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
            <MetricLink href={`/u/${user.username}/followers`} label="followers" value={user._count.followers} />
            <MetricLink href={`/u/${user.username}/following`} label="following" value={user._count.following} />
          </div>
        </div>

        {currentUserId !== user.id ? (
          <div className="relative z-20 flex-shrink-0 sm:justify-self-end">
            <FollowButton targetUserId={user.id} initialFollowing={initiallyFollowing} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}
