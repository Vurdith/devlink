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
      className="group rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.26)] hover:bg-white/[0.055]"
    >
      <span className="block text-base font-semibold leading-none text-white group-hover:text-[var(--color-accent-2)]">
        {value}
      </span>
      <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/42">
        {label}
      </span>
    </Link>
  );
}

function ProfileSignal({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "cyan" | "amber";
}) {
  const toneClass =
    tone === "cyan"
      ? "border-[rgba(var(--color-accent-2-rgb),0.18)] bg-[rgba(var(--color-accent-2-rgb),0.075)] text-[var(--color-accent-2)]"
      : tone === "amber"
        ? "border-amber-300/18 bg-amber-300/[0.07] text-amber-200"
        : "border-white/[0.08] bg-white/[0.028] text-white/68";

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${toneClass}`}>
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span className="text-white/42">{label}</span>
      <span className="min-w-0 truncate font-semibold text-white/86">{value}</span>
    </span>
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
    <main className="mx-auto w-full min-w-0 max-w-6xl px-0 py-3 sm:px-5 sm:py-8">
      <section className={surface("panelStrong", "relative overflow-hidden bg-[rgba(10,13,19,0.86)]")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <ProfileBanner 
          initialBannerUrl={user.profile?.bannerUrl}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="relative -mt-20 px-3 pb-5 sm:-mt-24 sm:px-6 sm:pb-7 lg:px-8">
          <AboutEditor
            initialBio={user.profile?.bio}
            initialLocation={user.profile?.location}
            initialWebsite={user.profile?.website}
            initialName={user.name}
            username={user.username}
            editable={isOwnProfile}
          />

          <div className={surface("toolbar", "relative overflow-hidden bg-[rgba(7,10,15,0.80)] p-4 backdrop-blur-md sm:p-5 lg:p-6")}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-55"
              style={{
                background:
                  "radial-gradient(640px 150px at 12% 0%, rgba(var(--color-accent-2-rgb),0.10), transparent 64%), radial-gradient(520px 150px at 96% 18%, rgba(var(--color-accent-rgb),0.07), transparent 68%)",
              }}
            />
            <div className="relative grid min-w-0 gap-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(220px,auto)] lg:items-start">
              <div className="flex items-end gap-4 sm:items-center lg:block">
                <ProfileAvatar
                  initialAvatarUrl={user.profile?.avatarUrl}
                  isOwnProfile={isOwnProfile}
                />
                <div className="min-w-0 pb-1 sm:hidden">
                  <p className="truncate text-sm font-medium text-[var(--muted-foreground)]">@{user.username}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/38">
                    {isOwnProfile ? "Your public profile" : "Developer profile"}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="min-w-0 max-w-full break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {user.name ?? user.username}
                  </h1>
                  {user.profile?.verified ? (
                    <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/22" aria-label="Verified profile">
                      <svg className="h-3.5 w-3.5 text-blue-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                  ) : null}
                  {profileType ? <ProfileTypeLabel profileType={profileType} variant="hero" /> : null}
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

                {user.profile?.bio ? (
                  <div className="mt-4 max-w-3xl">
                    <p className="break-words border-l-2 border-[rgba(var(--color-accent-2-rgb),0.46)] pl-4 text-[15px] font-medium leading-relaxed text-white/78 whitespace-pre-wrap">
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

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {user.profile?.availability ? (
                    <ProfileSignal label="Availability" value={user.profile.availability} tone="cyan" />
                  ) : null}
                  {user.profile?.responseTime ? (
                    <ProfileSignal label="Replies" value={user.profile.responseTime} />
                  ) : null}
                  {user.profile?.hourlyRate ? (
                    <ProfileSignal
                      label="Rate"
                      value={`${user.profile.currency ?? "USD"} ${user.profile.hourlyRate}/hr`}
                      tone="amber"
                    />
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <ProfileStatLink href={`/u/${user.username}/followers`} label="Followers" value={user?._count?.followers ?? 0} />
                <ProfileStatLink href={`/u/${user.username}/following`} label="Following" value={user?._count?.following ?? 0} />
                <Link
                  href={`/u/${user.username}?tab=reviews`}
                  className="group rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 transition-colors hover:border-amber-300/24 hover:bg-white/[0.055]"
                >
                  <span className="block text-base font-semibold leading-none text-white group-hover:text-amber-200">
                    {rating}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/42">
                    Rating
                  </span>
                </Link>

                {!isOwnProfile ? (
                  <div className="sm:col-span-3 lg:col-span-1">
                    <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
                  </div>
                ) : null}
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
