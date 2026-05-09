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
    <div className={surface("panelMuted", "group relative flex h-full min-h-[236px] flex-col overflow-hidden transition-colors hover:border-white/[0.16] hover:bg-white/[0.035]")}>
      <div
        aria-hidden="true"
        className="h-24 flex-shrink-0 bg-white/[0.025] sm:h-28"
        style={{
          backgroundImage: user.profile?.bannerUrl
            ? `linear-gradient(180deg, rgba(8,11,16,0.12), rgba(8,11,16,0.74)), url(${user.profile.bannerUrl})`
            : "linear-gradient(135deg, rgba(var(--color-accent-2-rgb),0.14), rgba(var(--color-accent-rgb),0.07))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col p-4 pt-0">
        <ProfileTooltip user={user} currentUserId={currentUserId}>
          <Link href={`/u/${user.username}`} className="relative z-10 -mt-9 flex min-w-0 items-end gap-3">
            <Avatar src={user.profile?.avatarUrl ?? undefined} size={56} className="border-4 border-[rgb(10,13,18)]" />
            <div className="min-w-0 pb-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-semibold text-white group-hover:text-[var(--color-accent-2)]">
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

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {profileType ? <ProfileTypeLabel profileType={profileType} variant="inline" className="mb-3" /> : null}
            {user.profile?.bio ? (
              <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-white/58">{user.profile.bio}</p>
            ) : (
              <p className="min-h-10 text-sm text-white/35">No bio yet</p>
            )}
            <div className="mt-3 flex gap-4 text-xs text-[var(--muted-foreground)]">
              <span><strong className="font-semibold text-white">{user._count.followers}</strong> followers</span>
              <span><strong className="font-semibold text-white">{user._count.following}</strong> following</span>
            </div>
          </div>

          {currentUserId !== user.id ? (
            <div className="relative z-20 flex-shrink-0">
              <FollowButton targetUserId={user.id} initialFollowing={initiallyFollowing} compact />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
