import { prisma } from "@/server/db";
import { iconBox, surface } from "@/components/ui/design-system";
import { getAuthSession } from "@/server/auth";
import { NetworkProfileCard } from "../NetworkProfileCard";

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true } });
  if (!user) return null;

  const following = await prisma.follower.findMany({
    where: { followerId: user.id },
    include: {
      following: {
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

  const ids = following.map((f) => f.following.id);
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
            <h1 className="mt-2 text-2xl font-bold text-white">@{user.username} is following</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {following.length} {following.length === 1 ? "profile" : "profiles"} in this feed.
            </p>
          </div>
          <div className={iconBox("cyan", "h-11 w-11")}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zm5 9v5m-2.5-2.5h5M2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            </svg>
          </div>
        </div>
      </section>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
        {following.map((f) => {
          return (
            <NetworkProfileCard
              key={f.id}
              user={f.following}
              currentUserId={currentUserId}
              initiallyFollowing={followingIds.has(f.following.id)}
            />
          );
        })}

        {following.length === 0 && (
          <div className={surface("empty", "px-6 py-14 text-center text-[var(--muted-foreground)]")}>
            <div className={iconBox("muted", "mx-auto mb-4 h-14 w-14")}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">Not following anyone yet</p>
          </div>
        )}
      </div>
    </main>
  );
}
