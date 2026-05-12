import type { Metadata } from "next";
import { prismaRead } from "@/server/db-read";
import { notFound } from "next/navigation";
import { ActionLink } from "@/components/ui/ActionLink";
import { MetricLink } from "@/components/ui/DataDisplay";
import { FollowButton } from "@/components/ui/FollowButton";
import { surface } from "@/components/ui/design-system";
import { getAuthSession } from "@/server/auth";
import { ProfileLiveEvents } from "./ProfileLiveEvents";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileBanner, ProfileAvatar } from "./ProfileMedia";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { fetchInitialFollowingState, fetchProfilePageData } from "@/server/users/profile-page-data";
import type { TabType } from "./profile-types";

// Cache page for 60 seconds - engagement state is fetched client-side
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prismaRead.user.findUnique({
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

const profileTabs = new Set<TabType>([
  "about",
  "posts",
  "replies",
  "reposts",
  "liked",
  "saved",
  "portfolio",
  "reviews",
]);

function readInitialTab(tab?: string | string[]): TabType | undefined {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value && profileTabs.has(value as TabType) ? (value as TabType) : undefined;
}

function FollowersIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-3.46-6M15 20.2c0-3-2.9-5.2-6.5-5.2S2 17.2 2 20.2V21h13v-.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 14.5c2.3.6 4 2.4 4 4.7v.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FollowingIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2.5 21v-.9c0-3 2.7-5.1 6-5.1 1.2 0 2.3.3 3.2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m15 18 2 2 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RatingIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function UserProfilePage(props: {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ tab?: string | string[] }>;
}) {
  const { username } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  
  // Fetch session and profile data in parallel
  const [session, user] = await Promise.all([
    getAuthSession(),
    fetchProfilePageData(username),
  ]);

  if (!user) notFound();
  
  const currentUserId = session?.user?.id;
  
  // Fetch following status only if logged in (separate fast query)
  const initialFollowing = await fetchInitialFollowingState(currentUserId, user.id);
    
  const rating = user.avgRating ? user.avgRating.toFixed(1) : "-";

  const isOwnProfile = currentUserId === user.id;
  const profileType = user.profile?.profileType ?? null;
  const initialTab = readInitialTab(searchParams?.tab);

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-8">
      <section className={surface("panelStrong", "relative overflow-hidden rounded-[14px] bg-[rgba(9,12,18,0.88)]")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="relative px-4 pb-6 sm:px-6 sm:pb-7 lg:px-8">
          <div className="-mt-14 rounded-[14px] border border-white/[0.08] bg-[rgba(7,10,16,0.76)] p-4 backdrop-blur-2xl sm:-mt-20 sm:p-5">
            <div className="grid min-w-0 gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:items-start">
              <ProfileAvatar
                initialAvatarUrl={user.profile?.avatarUrl}
                isOwnProfile={isOwnProfile}
              />

              <div className="min-w-0">
                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                      <h1 className="min-w-0 max-w-full break-words font-[var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {user.name ?? user.username}
                      </h1>
                      {user.profile?.verified ? (
                        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(var(--color-accent-2-rgb),0.40)] bg-[rgba(var(--color-accent-2-rgb),0.16)]" aria-label="Verified profile">
                          <svg className="h-3.5 w-3.5 text-[var(--color-accent-2)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-[var(--muted-foreground)]">
                      <span className="min-w-0 max-w-full truncate">@{user.username}</span>
                      {profileType ? (
                        <>
                          <span className="text-white/16">/</span>
                          <ProfileTypeLabel profileType={profileType} variant="hero" />
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start sm:justify-start lg:justify-end">
                    {isOwnProfile ? (
                      <ActionLink
                        href="/profile-hub"
                        variant="secondary"
                        size="md"
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent-2)]" aria-hidden="true">
                            <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        aria-label="Edit profile"
                      >
                        Edit profile
                      </ActionLink>
                    ) : (
                      <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
                    )}
                  </div>
                </div>

                {user.profile?.bio ? (
                  <p className="mt-5 max-w-3xl border-l-2 border-[rgba(var(--color-accent-2-rgb),0.45)] pl-4 text-base font-medium leading-relaxed text-white/78 whitespace-pre-wrap">
                      {user.profile.bio}
                  </p>
                ) : (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
                    {isOwnProfile
                      ? "Add a short bio so visitors can understand your focus at a glance."
                      : "No public bio yet."}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
                  <MetricLink href={`/u/${user.username}/followers`} label="followers" value={user?._count?.followers ?? 0} icon={<FollowersIcon />} />
                  <MetricLink href={`/u/${user.username}/following`} label="following" value={user?._count?.following ?? 0} icon={<FollowingIcon />} />
                  <MetricLink href={`/u/${user.username}?tab=reviews`} label="rating" value={rating} icon={<RatingIcon />} tone="rating" />
                </div>
              </div>
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
        initialTab={initialTab}
      />
    </main>
  );
}
