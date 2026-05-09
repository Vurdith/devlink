import { prisma } from "@/server/db";
import { iconBox, surface } from "@/components/ui/design-system";
import { getAuthSession } from "@/server/auth";
import { NetworkProfileCard } from "../NetworkProfileCard";

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

      <div className="grid gap-4 sm:grid-cols-2">
        {followers.map((f) => {
          return (
            <NetworkProfileCard
              key={f.id}
              user={f.follower}
              currentUserId={currentUserId}
              initiallyFollowing={followingIds.has(f.follower.id)}
            />
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
