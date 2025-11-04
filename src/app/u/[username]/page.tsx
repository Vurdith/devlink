import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { AvatarEditOverlay, BannerEditOverlay } from "./MediaEditor";
import { AboutEditor } from "./AboutEditor";
import { ProfileTabs } from "./ProfileTabs";

export default async function UserProfilePage(props: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions);
  const { username } = await props.params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
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
      },
      reviewsReceived: {
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true
                }
              }
            }
          }
        }
      },
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) notFound();
  const currentUserId = (session?.user as any)?.id as string | undefined;
  const initialFollowing = currentUserId
    ? !!(await prisma.follower.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } } }))
    : false;
  const rating = user.reviewsReceived.length
    ? (user.reviewsReceived.reduce((a, r) => a + r.rating, 0) / user.reviewsReceived.length).toFixed(1)
    : "—";
  const typeLabel = user.profile?.profileType
    ? ({ DEVELOPER: "Developer", CLIENT: "Client", STUDIO: "Studio", INFLUENCER: "Influencer", INVESTOR: "Investor", GUEST: "Guest" } as const)[user.profile.profileType]
    : undefined;

  // Get profile type colors
  const getProfileTypeColors = (type: string) => {
    switch (type) {
      case "DEVELOPER":
        return "border-blue-500/40 bg-blue-500/10 text-blue-400";
      case "CLIENT":
        return "border-green-500/40 bg-green-500/10 text-green-400";
      case "STUDIO":
        return "border-purple-500/40 bg-purple-500/10 text-purple-400";
      case "INFLUENCER":
        return "border-red-500/40 bg-red-500/10 text-red-400";
      case "INVESTOR":
        return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
      case "GUEST":
        return "border-gray-500/40 bg-gray-500/10 text-gray-400";
      default:
        return "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]";
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="relative overflow-hidden rounded-[var(--radius)]">
        <div className="relative h-48 w-full group">
          {user.profile?.bannerUrl ? (
            <Image src={user.profile.bannerUrl} alt="Banner" fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-[var(--muted)]" />
          )}
          <BannerEditOverlay editable={session?.user?.email === user.email} />
        </div>
        <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent-2) 0%, transparent 70%)" }} />
        <div className="glass px-6 md:px-8 pt-12 pb-8 glow relative">
          {session?.user?.email !== user.email && (
            <div className="absolute right-4 top-4">
              <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
            </div>
          )}
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={session?.user?.email === user.email}
          />
          <div className="flex items-center gap-6">
            <div className="relative w-[112px] h-[112px] group self-center">
              <Avatar size={112} className="ring-2 ring-white/20" src={user.profile?.avatarUrl || undefined} />
              <AvatarEditOverlay editable={session?.user?.email === user.email} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                {user.name ?? user.username}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">@{user.username}</p>
              {typeLabel && (
                <div className="mt-1">
                  <Badge className={`gap-1 ${getProfileTypeColors(user.profile?.profileType || '')}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" className="currentColor"><path d="M12 3l6 3v6c0 4-6 9-6 9s-6-5-6-9V6l6-3Z" fill="currentColor"/></svg>
                    {typeLabel}
                  </Badge>
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {rating !== "—" && <Badge className="gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  Rating {rating}
                </Badge>}
                <Link href={`/u/${user.username}/followers`} className="hover:opacity-90">
                  <Badge variant="muted" className="gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Followers {user?._count?.followers ?? 0}
                  </Badge>
                </Link>
                <Link href={`/u/${user.username}/following`} className="hover:opacity-90">
                  <Badge variant="muted" className="gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Following {user?._count?.following ?? 0}
                  </Badge>
                </Link>
                {user.profile?.verified ? (
                  <Badge variant="muted" className="gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                      <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"/>
                    </svg>
                    Verified
                  </Badge>
                ) : (
                  session?.user?.email === user.email ? (
                    <Link href="/verify" className="hover:opacity-90">
                      <Badge className="gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4"/>
                          <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                          <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"/>
                        </svg>
                        Get verified
                      </Badge>
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          </div>
          {user.profile?.bio && <p className="mt-6 text-[var(--muted-foreground)] whitespace-pre-wrap">{user.profile.bio}</p>}
          {/* client-side live updates for local edits */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              if (window.__devlink_profile_live_hook) return;
              window.__devlink_profile_live_hook = true;
              window.addEventListener('devlink:profile-updated', function(){ location.reload(); });
              window.addEventListener('devlink:follow-toggled', function(){ location.reload(); });
            })();
          `}} />
          <div className="mt-3 text-sm text-[var(--muted-foreground)] space-y-1">
            {user.profile?.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.profile.location}</span>
              </div>
            )}
            {user.profile?.website && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <a href={user.profile.website} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">{user.profile.website}</a>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="mt-6">
        <ProfileTabs username={username} currentUserId={currentUserId} userId={user.id} />
      </div>
    </main>
  );
}
