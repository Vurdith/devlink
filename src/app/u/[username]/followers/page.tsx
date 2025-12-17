import { prisma } from "@/server/db";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileTooltip } from "@/components/ui/ProfileTooltip";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;
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
  const ids = followers.map(f => f.follower.id);
  const existing = currentUserId && ids.length ? await prisma.follower.findMany({ where: { followerId: currentUserId, followingId: { in: ids } } }) : [];
  const followingIds = new Set(existing.map(r => r.followingId));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold mb-4">Followers of @{user.username}</h1>
      <div className="space-y-2">
        {followers.map((f) => (
          <div key={f.id} className="group relative bg-[#0d0d12] border border-white/10 rounded-[var(--radius)] p-3 flex items-center gap-3">
            <div className="absolute inset-0 rounded-[var(--radius)] pointer-events-none transition-colors group-hover:bg-white/10" />
            <ProfileTooltip user={f.follower} currentUserId={currentUserId}>
              <Link href={`/u/${f.follower.username}`} className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                <Avatar src={f.follower.profile?.avatarUrl ?? undefined} size={36} />
                <div className="min-w-0">
                  <div className="text-sm flex items-center gap-2 min-w-0">
                    <span className="truncate">@{f.follower.username}</span>
                    {currentUserId === f.follower.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">You</span>
                    )}
                    {f.follower.profile?.profileType && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${getProfileTypeConfig(f.follower.profile.profileType).bgColor} ${getProfileTypeConfig(f.follower.profile.profileType).color}`}
                      >
                        <ProfileTypeIcon profileType={f.follower.profile.profileType} size={10} />
                        {getProfileTypeConfig(f.follower.profile.profileType).label}
                      </span>
                    )}
                  </div>
                  {f.follower.profile?.bio && (
                    <div className="text-xs text-[var(--muted-foreground)] truncate max-w-[60ch]">
                      {f.follower.profile.bio.slice(0, 150)}
                    </div>
                  )}
                </div>
              </Link>
            </ProfileTooltip>
            <div className="ml-auto relative z-20">
              {currentUserId !== f.follower.id && (
                <FollowButton targetUserId={f.follower.id} initialFollowing={followingIds.has(f.follower.id)} compact />
              )}
            </div>
          </div>
        ))}
        {followers.length === 0 && <p className="text-[var(--muted-foreground)]">No followers yet.</p>}
      </div>
    </main>
  );
}


