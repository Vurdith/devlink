import { prisma } from "@/server/db";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { iconBox, surface } from "@/components/ui/design-system";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { getAuthSession } from "@/server/auth";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/types/profile";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true } });
  if (!user) return null;

  const followers = await prisma.follower.findMany({
    where: { followingId: user.id },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          _count: { select: { followers: true, following: true } },
          profile: {
            select: {
              avatarUrl: true,
              bannerUrl: true,
              profileType: true,
              verified: true,
              bio: true,
              website: true,
              location: true,
            },
          },
        },
      },
    },
  });

  const ids = followers.map((f) => f.follower.id);
  const existing =
    currentUserId && ids.length
      ? await prisma.follower.findMany({ where: { followerId: currentUserId, followingId: { in: ids } } })
      : [];
  const followingIds = new Set(existing.map((r) => r.followingId));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className={surface("panel", "mb-5 overflow-hidden p-5")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Network</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Followers of @{user.username}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {followers.length} {followers.length === 1 ? "person follows" : "people follow"} this profile.
            </p>
          </div>
          <div className={iconBox("cyan", "h-11 w-11")}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 9a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {followers.map((f) => {
          const profileType = f.follower.profile?.profileType;
          const typeConfig = profileType ? getProfileTypeConfig(profileType) : null;

          return (
            <div key={f.id} className={surface("panelMuted", "group relative flex flex-col gap-3 overflow-hidden p-4 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04] sm:flex-row sm:items-center")}>
              <ProfileTooltip user={f.follower} currentUserId={currentUserId}>
                <Link href={`/u/${f.follower.username}`} className="relative z-10 flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={f.follower.profile?.avatarUrl ?? undefined} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white group-hover:text-[var(--color-accent-2)]">
                        {f.follower.name || f.follower.username}
                      </span>
                      <span className="truncate text-sm text-[var(--muted-foreground)]">@{f.follower.username}</span>
                      {currentUserId === f.follower.id && (
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-white/70">You</span>
                      )}
                      {profileType && typeConfig && (
                        <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold ${typeConfig.bgColor} ${typeConfig.color}`}>
                          <ProfileTypeIcon profileType={profileType} size={10} />
                          {typeConfig.label}
                        </span>
                      )}
                    </div>
                    {f.follower.profile?.bio ? (
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--muted-foreground)]">{f.follower.profile.bio}</p>
                    ) : (
                      <p className="mt-1 text-xs text-white/35">No bio yet</p>
                    )}
                  </div>
                </Link>
              </ProfileTooltip>

              <div className="relative z-20 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
                  <span><strong className="font-semibold text-white">{f.follower._count.followers}</strong> followers</span>
                  <span><strong className="font-semibold text-white">{f.follower._count.following}</strong> following</span>
                </div>
                {currentUserId !== f.follower.id && (
                  <FollowButton targetUserId={f.follower.id} initialFollowing={followingIds.has(f.follower.id)} compact />
                )}
              </div>
            </div>
          );
        })}

        {followers.length === 0 && (
          <div className={surface("empty", "px-6 py-14 text-center text-[var(--muted-foreground)]")}>
            <div className={iconBox("muted", "mx-auto mb-4 h-14 w-14")}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">No followers yet</p>
          </div>
        )}
      </div>
    </main>
  );
}
