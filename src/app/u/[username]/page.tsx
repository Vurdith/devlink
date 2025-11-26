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
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

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

  // Get profile type colors - distinct colors for each type
  const getProfileTypeColors = (type: string) => {
    switch (type) {
      case "DEVELOPER":
        return "border-blue-400/50 bg-blue-500/15 text-blue-300 shadow-sm shadow-blue-500/20";
      case "CLIENT":
        return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20";
      case "STUDIO":
        return "border-violet-400/50 bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/20";
      case "INFLUENCER":
        return "border-pink-400/50 bg-pink-500/15 text-pink-300 shadow-sm shadow-pink-500/20";
      case "INVESTOR":
        return "border-amber-400/50 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/20";
      case "GUEST":
        return "border-gray-400/50 bg-gray-500/15 text-gray-300 shadow-sm shadow-gray-500/20";
      default:
        return "border-purple-400/50 bg-purple-500/15 text-purple-300 shadow-sm shadow-purple-500/20";
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-10">
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl">
        {/* Banner */}
        <div className="relative h-32 sm:h-52 w-full group">
          {user.profile?.bannerUrl ? (
            <Image src={user.profile.bannerUrl} alt="Banner" fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-indigo-900/50" />
          )}
          {/* Banner overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <BannerEditOverlay editable={session?.user?.email === user.email} />
        </div>
        
        {/* Purple glow effects */}
        <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 bg-purple-500/30 pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 bg-purple-600/20 pointer-events-none" />
        
        {/* Main profile card */}
        <div className="relative backdrop-blur-xl bg-black/40 border border-purple-500/20 px-3 sm:px-6 md:px-8 pt-6 sm:pt-12 pb-4 sm:pb-8 shadow-2xl shadow-purple-500/10">
          {/* Follow button */}
          {session?.user?.email !== user.email && (
            <div className="absolute right-2 sm:right-4 top-2 sm:top-4">
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
          
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Avatar with purple ring */}
            <div className="relative w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] group self-center flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full opacity-75 blur-sm" />
              <Avatar size={80} className="relative ring-2 sm:ring-4 ring-purple-500/30 sm:hidden" src={user.profile?.avatarUrl || undefined} />
              <Avatar size={120} className="relative ring-4 ring-purple-500/30 hidden sm:block" src={user.profile?.avatarUrl || undefined} />
              <AvatarEditOverlay editable={session?.user?.email === user.email} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                <span className="truncate">{user.name ?? user.username}</span>
                {user.profile?.verified && (
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white sm:w-[14px] sm:h-[14px]">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-purple-300/80">@{user.username}</p>
              
              {/* Profile type badge */}
              {user.profile?.profileType && (
                <div className="mt-2">
                  <Badge className={`gap-1.5 px-3 py-1 ${getProfileTypeColors(user.profile.profileType)}`}>
                    <ProfileTypeIcon profileType={user.profile.profileType} size={14} />
                    {getProfileTypeConfig(user.profile.profileType).label}
                  </Badge>
                </div>
              )}
              
              {/* Stats badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {rating !== "—" && (
                  <Badge className="gap-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 px-3 py-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    {rating}
                  </Badge>
                )}
                <Link href={`/u/${user.username}/followers`} className="hover:scale-105 transition-transform">
                  <Badge variant="muted" className="gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 px-3 py-1 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="font-semibold">{user?._count?.followers ?? 0}</span> Followers
                  </Badge>
                </Link>
                <Link href={`/u/${user.username}/following`} className="hover:scale-105 transition-transform">
                  <Badge variant="muted" className="gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 px-3 py-1 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="font-semibold">{user?._count?.following ?? 0}</span> Following
                  </Badge>
                </Link>
                {!user.profile?.verified && session?.user?.email === user.email && (
                  <Link href="/verify" className="hover:scale-105 transition-transform">
                    <Badge className="gap-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 px-3 py-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      Get Verified
                    </Badge>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {user.profile?.bio && (
            <p className="mt-6 text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed border-l-2 border-purple-500/30 pl-4">
              {user.profile.bio}
            </p>
          )}
          
          {/* Client-side live updates */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              if (window.__devlink_profile_live_hook) return;
              window.__devlink_profile_live_hook = true;
              window.addEventListener('devlink:profile-updated', function(){ location.reload(); });
              window.addEventListener('devlink:follow-toggled', function(){ location.reload(); });
            })();
          `}} />
          
          {/* Location & Website */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
            {user.profile?.location && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.profile.location}</span>
              </div>
            )}
            {user.profile?.website && (
              <a 
                href={user.profile.website} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-purple-300 hover:text-purple-200">{user.profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </section>
      
      {/* Tabs section */}
      <div className="mt-6">
        <ProfileTabs username={username} currentUserId={currentUserId} userId={user.id} />
      </div>
    </main>
  );
}
