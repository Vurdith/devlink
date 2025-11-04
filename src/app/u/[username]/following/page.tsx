import { prisma } from "@/server/db";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;
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
          profile: {
            select: {
              avatarUrl: true,
              bannerUrl: true,
              profileType: true,
              verified: true,
              bio: true,
              website: true,
              location: true
            }
          }
        } 
      } 
    } 
  });
  const ids = following.map(f => f.following.id);
  const existing = currentUserId && ids.length ? await prisma.follower.findMany({ where: { followerId: currentUserId, followingId: { in: ids } } }) : [];
  const followingIds = new Set(existing.map(r => r.followingId));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold mb-4">@{user.username} is following</h1>
      <div className="space-y-2">
        {following.map((f) => (
          <div key={f.id} className="group relative glass rounded-[var(--radius)] p-3 flex items-center gap-3">
            <div className="absolute inset-0 rounded-[var(--radius)] pointer-events-none transition-colors group-hover:bg-white/10" />
            <Link href={`/u/${f.following.username}`} className="absolute inset-0" aria-label={`View @${f.following.username}`}>
              <span className="sr-only">View @{f.following.username}</span>
            </Link>
            <div className="pointer-events-none">
              <Avatar src={f.following.profile?.avatarUrl ?? undefined} size={36} />
            </div>
            <div className="relative z-10 pointer-events-none min-w-0">
              <div className="text-sm flex items-center gap-2">@{f.following.username} {currentUserId === f.following.id && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">You</span>)}</div>
              {f.following.profile?.bio && (
                <div className="text-xs text-[var(--muted-foreground)] truncate max-w-[60ch]">{f.following.profile.bio.slice(0,150)}</div>
              )}
            </div>
            <div className="ml-auto relative z-20">
              {currentUserId !== f.following.id && (
                <FollowButton targetUserId={f.following.id} initialFollowing={followingIds.has(f.following.id)} compact />
              )}
            </div>
          </div>
        ))}
        {following.length === 0 && <p className="text-[var(--muted-foreground)]">Not following anyone yet.</p>}
      </div>
    </main>
  );
}


