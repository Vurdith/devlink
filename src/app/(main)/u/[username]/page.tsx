import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";
import { getAuthSession } from "@/server/auth";
import { AboutEditor } from "./AboutEditor";
import { ProfileLiveEvents } from "./ProfileLiveEvents";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileBanner, ProfileAvatar } from "./ProfileMedia";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/types/profile";
import { responseCache } from "@/server/cache";

// Cache page for 60 seconds - engagement state is fetched client-side
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, profile: { select: { bio: true, avatarUrl: true } } },
  });
  if (!user) return { title: "User Not Found" };
  const title = `${user.name || user.username} (@${user.username})`;
  const description = user.profile?.bio?.slice(0, 160) || `Check out ${user.username}'s profile on DevLink.`;
  return {
    title,
    description,
    openGraph: { title, description, images: user.profile?.avatarUrl ? [user.profile.avatarUrl] : [], type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

// Cache profile data for faster repeat loads
async function getProfileData(username: string) {
  const cacheKey = `profile:page:${username.toLowerCase()}`;
  
  const cached = await responseCache.get<Awaited<ReturnType<typeof prisma.user.findUnique>> & { avgRating: number | null }>(cacheKey);
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
          availability: true,
          hourlyRate: true,
          responseTime: true,
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
    getAuthSession(),
    getProfileData(username)
  ]);

  if (!user) notFound();
  if (!("profile" in user) || !("skills" in user) || !("_count" in user) || !("avgRating" in user)) {
    notFound();
  }
  
  const currentUserId = session?.user?.id;
  
  // Fetch following status only if logged in (separate fast query)
  const initialFollowing = currentUserId
    ? !!(await prisma.follower.findUnique({ 
        where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
        select: { id: true }
      }))
    : false;
    
  const rating = user.avgRating ? user.avgRating.toFixed(1) : "-";

  const isOwnProfile = session?.user?.email === user.email;
  const profileType = user.profile?.profileType ?? null;
  const profileTypeConfig = profileType ? getProfileTypeConfig(profileType) : null;

  return (
    <main className="mx-auto max-w-6xl px-3 sm:px-5 py-4 sm:py-8">
      <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(10,13,19,0.82)] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        {/* Banner */}
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="relative -mt-16 px-4 pb-5 sm:-mt-20 sm:px-6 sm:pb-7 lg:px-8">
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={isOwnProfile}
          />

          <div className="grid gap-5 rounded-xl border border-white/[0.08] bg-[rgba(7,10,15,0.72)] p-4 shadow-[0_18px_46px_rgba(0,0,0,0.24)] backdrop-blur-md sm:grid-cols-[auto_1fr_auto] sm:items-end sm:p-5">
            <ProfileAvatar
              initialAvatarUrl={user.profile?.avatarUrl}
              isOwnProfile={isOwnProfile}
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-white truncate tracking-tight sm:text-3xl">
                  {user.name ?? user.username}
                </h1>
                {user.profile?.verified && (
                  <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/25">
                    <svg className="h-3 w-3 text-blue-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted-foreground)]">
                <span className="truncate">@{user.username}</span>
                <span className="hidden text-white/20 sm:inline">/</span>
                <Link href={`/u/${user.username}/followers`} className="transition-colors hover:text-white">
                  <span className="font-medium text-white">{user?._count?.followers ?? 0}</span>{" "}
                  followers
                </Link>
                <span className="hidden text-white/20 sm:inline">/</span>
                <Link href={`/u/${user.username}/following`} className="transition-colors hover:text-white">
                  <span className="font-medium text-white">{user?._count?.following ?? 0}</span>{" "}
                  following
                </Link>
                {rating !== "-" && (
                  <>
                    <span className="hidden text-white/20 sm:inline">/</span>
                    <span className="text-amber-200/90">
                      <span className="font-medium text-amber-200">{rating}</span>{" "}
                      rating
                    </span>
                  </>
                )}
              </div>

              {user.profile?.bio && (
                <p className="mt-4 max-w-3xl text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                  {user.profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {profileTypeConfig && profileType && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium ${profileTypeConfig.bgColor} ${profileTypeConfig.color}`}
                >
                  <ProfileTypeIcon profileType={profileType} size={13} />
                  {profileTypeConfig.label}
                </span>
              )}
              {!isOwnProfile && (
                <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
              )}
            </div>
          </div>
          
          <ProfileLiveEvents />
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
        session={session}
      />
    </main>
  );
}
