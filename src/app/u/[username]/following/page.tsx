import { prisma } from "@/server/db";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { getAuthSession } from "@/server/auth";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

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
          <div key={f.id} className="group relative overflow-hidden glass glass-hover noise-overlay border border-white/10 rounded-[var(--radius)] p-3 flex items-center gap-3">
            <ProfileTooltip user={f.following} currentUserId={currentUserId}>
              <Link href={`/u/${f.following.username}`} className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                <Avatar src={f.following.profile?.avatarUrl ?? undefined} size={36} />
                <div className="min-w-0">
                  <div className="text-sm flex items-center gap-2 min-w-0">
                    <span className="truncate">@{f.following.username}</span>
                    {currentUserId === f.following.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">You</span>
                    )}
                    {f.following.profile?.profileType && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${getProfileTypeConfig(f.following.profile.profileType).bgColor} ${getProfileTypeConfig(f.following.profile.profileType).color}`}
                      >
                        <ProfileTypeIcon profileType={f.following.profile.profileType} size={10} />
                        {getProfileTypeConfig(f.following.profile.profileType).label}
                      </span>
                    )}
                  </div>
                  {f.following.profile?.bio && (
                    <div className="text-xs text-[var(--muted-foreground)] truncate max-w-[60ch]">
                      {f.following.profile.bio.slice(0, 150)}
                    </div>
                  )}
                </div>
              </Link>
            </ProfileTooltip>
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


