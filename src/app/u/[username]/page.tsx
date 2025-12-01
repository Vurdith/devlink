import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { AboutEditor } from "./AboutEditor";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileBanner, ProfileAvatar } from "./ProfileMedia";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import { responseCache } from "@/lib/cache";

// Revalidate every 60 seconds
export const revalidate = 60;

// Cache profile data for faster repeat loads
async function getProfileData(username: string) {
  const cacheKey = `profile:page:${username.toLowerCase()}`;
  
  const cached = await responseCache.get<any>(cacheKey);
  if (cached) return cached;
  
  // Single query with rating aggregate using raw SQL for efficiency
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
      _count: { select: { followers: true, following: true, reviewsReceived: true } },
    },
  });
  
  if (!user) return null;
  
  // Get average rating if user has reviews (only if needed)
  let avgRating = null;
  if (user._count.reviewsReceived > 0) {
    const ratingAgg = await prisma.review.aggregate({
      where: { reviewedId: user.id },
      _avg: { rating: true }
    });
    avgRating = ratingAgg._avg.rating;
  }
  
  const userWithRating = { ...user, avgRating };
  await responseCache.set(cacheKey, userWithRating, 60);
  return userWithRating;
}

export default async function UserProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  
  // Fetch session and profile data in parallel
  const [session, user] = await Promise.all([
    getServerSession(authOptions),
    getProfileData(username)
  ]);

  if (!user) notFound();
  
  const currentUserId = (session?.user as any)?.id as string | undefined;
  
  // Fetch following status only if logged in (separate fast query)
  const initialFollowing = currentUserId
    ? !!(await prisma.follower.findUnique({ 
        where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
        select: { id: true }
      }))
    : false;
    
  const rating = user.avgRating ? user.avgRating.toFixed(1) : "—";

  const getProfileTypeColors = (type: string) => {
    switch (type) {
      case "DEVELOPER":
        return "border-blue-400/50 bg-blue-500/15 text-blue-300";
      case "CLIENT":
        return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300";
      case "STUDIO":
        return "border-violet-400/50 bg-violet-500/15 text-violet-300";
      case "INFLUENCER":
        return "border-pink-400/50 bg-pink-500/15 text-pink-300";
      case "INVESTOR":
        return "border-amber-400/50 bg-amber-500/15 text-amber-300";
      case "GUEST":
        return "border-gray-400/50 bg-gray-500/15 text-gray-300";
      default:
        return "border-purple-400/50 bg-purple-500/15 text-purple-300";
    }
  };

  const isOwnProfile = session?.user?.email === user.email;

  return (
    <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-10">
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl">
        {/* Banner - Client component for instant updates */}
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        {/* Main profile card */}
        <div className="relative bg-[#0a0a0f]/95 border-t border-purple-500/20 px-4 sm:px-8 pb-4 sm:pb-8">
          
          {/* Avatar and Follow button row */}
          <div className="flex justify-between items-start">
            {/* Avatar - Client component for instant updates */}
            <ProfileAvatar 
              initialAvatarUrl={user.profile?.avatarUrl}
              isOwnProfile={isOwnProfile}
            />
            
            {/* Follow button - top right */}
            {!isOwnProfile && (
              <div className="mt-3">
                <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
              </div>
            )}
          </div>
          
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={isOwnProfile}
          />
          
          {/* Name & Username */}
          <div className="mt-3">
            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-white">
              <span className="truncate">{user.name ?? user.username}</span>
              {user.profile?.verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white sm:w-3 sm:h-3">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/80">@{user.username}</p>
          </div>
          
          {/* Profile type badge */}
          {user.profile?.profileType && (
            <div className="mt-2">
              <Badge className={`gap-1 text-xs px-2 py-0.5 ${getProfileTypeColors(user.profile.profileType)}`}>
                <ProfileTypeIcon profileType={user.profile.profileType} size={12} />
                {getProfileTypeConfig(user.profile.profileType).label}
              </Badge>
            </div>
          )}
          
          {/* Stats row - inline flex for consistent alignment */}
          <div className="mt-3 inline-flex items-stretch gap-1.5 flex-wrap">
            {rating !== "—" && (
              <div className="inline-flex items-center gap-1 text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <span className="font-medium">{rating}</span>
              </div>
            )}
            <Link href={`/u/${user.username}/followers`} className="inline-flex items-center gap-1 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 px-2.5 py-1 rounded-full transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="font-semibold">{user?._count?.followers ?? 0}</span>
              <span className="hidden sm:inline">Followers</span>
            </Link>
            <Link href={`/u/${user.username}/following`} className="inline-flex items-center gap-1 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 px-2.5 py-1 rounded-full transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="font-semibold">{user?._count?.following ?? 0}</span>
              <span className="hidden sm:inline">Following</span>
            </Link>
          </div>
          
          {/* Bio */}
          {user.profile?.bio && (
            <p className="mt-4 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed border-l-2 border-purple-500/30 pl-3">
              {user.profile.bio}
            </p>
          )}
          
          {/* Location & Website */}
          {(user.profile?.location || user.profile?.website) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
              {user.profile?.location && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                >
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-purple-300">{user.profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          )}
          
          {/* Client-side live updates */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              if (window.__devlink_profile_live_hook) return;
              window.__devlink_profile_live_hook = true;
              
              // Clear all profile caches
              function clearProfileCaches() {
                try {
                  Object.keys(sessionStorage).forEach(function(key) {
                    if (key.startsWith('navbar-profile-')) {
                      sessionStorage.removeItem(key);
                    }
                  });
                } catch(e) {}
              }
              
              // Profile updates are handled by Next.js router.refresh() - no page reload needed
              // The Navbar listens for this event and updates its state directly
              window.addEventListener('devlink:profile-updated', function(e) {
                clearProfileCaches();
                // Don't reload - the MediaEditor already calls router.refresh()
              });
              
              // Follow toggle needs a full reload to update follower counts
              window.addEventListener('devlink:follow-toggled', function(){ 
                clearProfileCaches();
                location.reload(); 
              });
            })();
          `}} />
        </div>
      </section>
      
      {/* Tabs section */}
      <ProfileTabs username={username} currentUserId={currentUserId} userId={user.id} />
    </main>
  );
}
