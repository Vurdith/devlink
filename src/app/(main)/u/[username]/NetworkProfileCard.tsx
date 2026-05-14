import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { MetricLink, ToneBadge } from "@/components/ui/DataDisplay";
import { FollowButton } from "@/components/ui/FollowButton";
import { surface } from "@/components/ui/design-system";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { cn } from "@/lib/cn";
import { UserRound, UsersRound } from "lucide-react";

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
    <div className={surface("panelMuted", "group relative flex h-full min-h-[20rem] flex-col overflow-hidden transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.035]")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="relative h-32 flex-shrink-0 overflow-hidden border-b border-white/[0.06] bg-white/[0.02] sm:h-36">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: user.profile?.bannerUrl
              ? `linear-gradient(180deg, rgba(8,11,16,0.02), rgba(8,11,16,0.18) 52%, rgba(8,11,16,0.62)), url(${user.profile.bannerUrl})`
              : "radial-gradient(520px 150px at 14% 0%, rgba(var(--color-accent-rgb),0.18), transparent 70%), linear-gradient(135deg, rgba(var(--color-accent-2-rgb),0.13), rgba(var(--color-accent-rgb),0.06) 52%, rgba(7,9,13,0.88))",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="grid flex-1 gap-4 bg-[rgba(7,9,13,0.88)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
        <ProfileTooltip user={user} currentUserId={currentUserId}>
          <Link
            href={`/u/${user.username}`}
            className="relative z-10 -mt-12 flex min-w-0 items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(10,13,18)] sm:-mt-[3.25rem]"
          >
            <Avatar src={user.profile?.avatarUrl ?? undefined} size={68} className="border-4 border-[rgb(10,13,18)]" />
            <div className="min-w-0 pt-12">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-semibold text-white transition-colors group-hover:text-[var(--color-accent-2)]">
                  {user.name || user.username}
                </span>
                {currentUserId === user.id ? (
                  <ToneBadge tone="muted" className="px-1.5 py-0.5 text-[10px]">You</ToneBadge>
                ) : null}
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <span className="truncate text-sm text-[var(--muted-foreground)]">@{user.username}</span>
                {profileType ? <ProfileTypeLabel profileType={profileType} variant="compact" /> : null}
              </div>
            </div>
          </Link>
        </ProfileTooltip>

        <div className={cn("min-w-0 sm:row-start-2", currentUserId === user.id ? "sm:col-span-2" : "")}>
          {user.profile?.location ? (
            <ToneBadge tone="muted" className="max-w-full">
              {user.profile.location}
            </ToneBadge>
          ) : null}
          {user.profile?.bio ? (
            <p className="mt-2 line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.36)] pl-3 text-sm leading-relaxed text-white/62">{user.profile.bio}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3 text-xs text-[var(--muted-foreground)]">
            <MetricLink
              href={`/u/${user.username}/followers`}
              className="relative z-20"
              label="followers"
              value={user._count.followers}
              tone="muted"
              icon={<UsersRound className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <MetricLink
              href={`/u/${user.username}/following`}
              className="relative z-20"
              label="following"
              value={user._count.following}
              tone="muted"
              icon={<UserRound className="h-3.5 w-3.5" aria-hidden="true" />}
            />
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
