import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { AboutEditor } from "./AboutEditor";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileBanner, ProfileAvatar } from "./ProfileMedia";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";
import { responseCache } from "@/lib/cache";
import type { ExperienceLevel, AvailabilityStatus } from "@/lib/skills";

// Cache page for 60 seconds - engagement state is fetched client-side
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
          location: true,
          currency: true,
        }
      },
      skills: {
        select: {
          id: true,
          skillId: true,
          experienceLevel: true,
          yearsOfExp: true,
          isPrimary: true,
          headline: true,
          rate: true,
          rateUnit: true,
          skillAvailability: true,
          description: true,
          skill: {
            select: {
              id: true,
              name: true,
              category: true,
            }
          }
        },
        orderBy: [
          { isPrimary: "desc" },
          { createdAt: "asc" },
        ],
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

  const isOwnProfile = session?.user?.email === user.email;
  const profileType = user.profile?.profileType ?? null;
  const profileTypeConfig = profileType ? getProfileTypeConfig(profileType) : null;

  return (
    <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-10">
      <section className="relative overflow-hidden glass-soft rounded-xl sm:rounded-2xl border border-white/10">
        {/* Banner */}
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        {/* Content (Discover-card style) */}
        <div className="relative p-4 sm:p-6">
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={isOwnProfile}
          />

          {/* Identity row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <ProfileAvatar
                initialAvatarUrl={user.profile?.avatarUrl}
                isOwnProfile={isOwnProfile}
              />

              <div className="min-w-0 flex items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
                      {user.name ?? user.username}
                    </h1>
                    {user.profile?.verified && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/25 border border-blue-400/40 flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] truncate">@{user.username}</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {!isOwnProfile && (
                <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
              )}
            </div>
          </div>

          {/* Profile type + divider (Discover style) */}
          {profileTypeConfig && profileType && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border border-white/10 ${profileTypeConfig.bgColor} ${profileTypeConfig.color}`}
              >
                <ProfileTypeIcon profileType={profileType} size={12} />
                {profileTypeConfig.label}
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          )}

          {/* Bio */}
          {user.profile?.bio && (
            <p className="mt-4 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
              {user.profile.bio}
            </p>
          )}

          {/* Stats (Discover footer vibe) */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-4">
              <Link href={`/u/${user.username}/followers`} className="hover:text-white transition-colors">
                <span className="font-semibold text-white tabular-nums">{user?._count?.followers ?? 0}</span>{" "}
                followers
              </Link>
              <Link href={`/u/${user.username}/following`} className="hover:text-white transition-colors">
                <span className="font-semibold text-white tabular-nums">{user?._count?.following ?? 0}</span>{" "}
                following
              </Link>
              {rating !== "—" && (
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <span className="font-semibold text-amber-300 tabular-nums">{rating}</span>
                  <span className="text-amber-300/70">rating</span>
                </span>
              )}
            </div>
          </div>
          
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
                } catch(e) {
                  // Silently ignore - sessionStorage may be unavailable (private browsing, iframe, etc.)
                }
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
      <ProfileTabs 
        username={username} 
        currentUserId={currentUserId} 
        userId={user.id} 
        skills={user.skills}
        profileData={{
          location: user.profile?.location,
          website: user.profile?.website,
          availability: user.profile?.availability,
          hourlyRate: user.profile?.hourlyRate,
          currency: user.profile?.currency,
          responseTime: user.profile?.responseTime,
        }}
      />
    </main>
  );
}
