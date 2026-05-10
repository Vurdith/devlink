import type { Metadata } from "next";
import { prismaRead } from "@/server/db-read";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/ui/FollowButton";
import { surface } from "@/components/ui/design-system";
import Link from "next/link";
import { getAuthSession } from "@/server/auth";
import { AboutEditor } from "./AboutEditor";
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

function ProfileStatLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string | number;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-baseline gap-1.5 rounded-md px-1 py-1 transition-colors hover:text-[var(--color-accent-2)]"
    >
      <span className="text-sm font-semibold leading-none text-white group-hover:text-[var(--color-accent-2)]">
        {value}
      </span>
      <span className="text-sm text-white/50 group-hover:text-white/70">
        {label}
      </span>
    </Link>
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
  const hasPublicWebsite = Boolean(user.profile?.website);
  const websiteUrl = user.profile?.website?.replace(/^https?:\/\//, "");

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-8">
      <section className={surface("panelStrong", "relative overflow-hidden bg-[rgba(9,12,18,0.86)]")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="relative px-4 pb-6 sm:px-6 sm:pb-7 lg:px-8">
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={isOwnProfile}
          />

          <div className="grid min-w-0 gap-5 border-b border-white/[0.06] pb-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
              <div className="-mt-14 flex items-end gap-4 sm:-mt-16 sm:items-end lg:block">
                <ProfileAvatar
                  initialAvatarUrl={user.profile?.avatarUrl}
                  isOwnProfile={isOwnProfile}
                />
                <div className="min-w-0 pb-1 sm:hidden">
                  <p className="truncate text-sm font-medium text-[var(--muted-foreground)]">@{user.username}</p>
                  {profileType ? (
                    <div className="mt-2">
                      <ProfileTypeLabel profileType={profileType} variant="compact" />
                    </div>
                  ) : null}
                </div>
              </div>

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
                  {profileType ? <ProfileTypeLabel profileType={profileType} variant="hero" className="hidden sm:inline-flex" /> : null}
                </div>

                <div className="mt-2 hidden min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[var(--muted-foreground)] sm:flex">
                  <span className="min-w-0 max-w-full truncate">@{user.username}</span>
                  {user.profile?.location ? (
                    <>
                      <span className="text-white/16">|</span>
                      <span className="min-w-0 max-w-full truncate">{user.profile.location}</span>
                    </>
                  ) : null}
                  {hasPublicWebsite ? (
                    <>
                      <span className="text-white/16">|</span>
                      <a
                        href={user.profile?.website ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 max-w-full truncate text-[var(--color-accent-2)] transition-colors hover:text-white"
                      >
                        {websiteUrl}
                      </a>
                    </>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <ProfileStatLink href={`/u/${user.username}/followers`} label="followers" value={user?._count?.followers ?? 0} />
                  <span className="text-white/18">/</span>
                  <ProfileStatLink href={`/u/${user.username}/following`} label="following" value={user?._count?.following ?? 0} />
                  <span className="text-white/18">/</span>
                  <Link
                    href={`/u/${user.username}?tab=reviews`}
                    className="group inline-flex items-baseline gap-1.5 rounded-md px-1 py-1 transition-colors hover:text-amber-200"
                  >
                    <span className="text-sm font-semibold leading-none text-white group-hover:text-amber-200">{rating}</span>
                    <span className="text-sm text-white/50 group-hover:text-white/70">rating</span>
                  </Link>
                </div>

                {user.profile?.bio ? (
                  <div className="mt-5 max-w-3xl">
                    <p className="break-words text-base font-medium leading-relaxed text-white/78 whitespace-pre-wrap">
                      {user.profile.bio}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
                    {isOwnProfile
                      ? "Add a short bio so visitors can understand your focus at a glance."
                      : "This profile has not added a public bio yet."}
                  </p>
                )}

              </div>

              {!isOwnProfile ? (
                <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1 lg:min-w-48 lg:items-end">
                  <div className="w-full lg:w-auto">
                    <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
                  </div>
                </div>
              ) : null}
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
