"use client";
import dynamic from "next/dynamic";
import { memo } from "react";
import { ArrowRight, Bell, BriefcaseBusiness, Code2, Search, Users } from "lucide-react";
import { PostFeed } from "./PostFeed";
import { ActionLink } from "@/components/ui/ActionLink";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { skeleton, surface } from "@/components/ui/design-system";
import type { FeedPost } from "@/types/post";
import { useHomeFeedPosts } from "./useHomeFeedPosts";

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  profile: {
    avatarUrl: string | null;
    bannerUrl: string | null;
    profileType: string;
    verified: boolean;
    bio: string | null;
    website: string | null;
    location: string | null;
  } | null;
  _count: {
    followers: number;
    following: number;
  };
}

interface AnimatedHomeContentProps {
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  } | null;
  currentUserProfile: UserProfile | null;
  postsWithViewCounts: FeedPost[];
}

const audienceLanes = [
  {
    title: "Developers",
    desc: "Build notes, portfolio drops, and technical asks.",
    Icon: Code2,
  },
  {
    title: "Clients",
    desc: "Rates, replies, and proof before you message.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Teams",
    desc: "Shortlist people from visible work instead of cold guesses.",
    Icon: Users,
  },
];

function CreatePostFallback() {
  return (
    <div className={surface("panelMuted", "create-post-collapsed noise-overlay relative mb-6 overflow-hidden p-4 sm:p-5")}>
      <div className="flex items-center gap-4">
        <div className={skeleton("h-[46px] w-[46px] rounded-full")} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={skeleton("h-4 w-28 rounded")} />
          <div className={skeleton("h-3 w-full max-w-md rounded")} />
        </div>
        <div className={skeleton("h-11 w-11 rounded-lg")} />
      </div>
    </div>
  );
}

const LazyCreatePost = dynamic(
  () => import("./CreatePost").then((module) => module.CreatePost),
  {
    ssr: false,
    loading: CreatePostFallback,
  }
);
export const AnimatedHomeContent = memo(function AnimatedHomeContent({
  session,
  currentUserProfile,
  postsWithViewCounts
}: AnimatedHomeContentProps) {
  const { feedPosts, handlePostUpdate } = useHomeFeedPosts({
    initialPosts: postsWithViewCounts,
    userId: session?.user?.id,
  });

  const firstName = currentUserProfile?.name?.split(" ")[0] || currentUserProfile?.username || "there";
  const feedCountLabel = feedPosts.length === 1 ? "1 update" : `${feedPosts.length} updates`;

  return (
    <>
      {!session && (
        <div className="pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
            <section className="min-w-0 animate-slide-up">
              <div className="mb-7 flex items-center gap-4">
                <ThemeLogoImg className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
                <div>
                  <h1 className="mt-1 text-5xl font-bold leading-none tracking-normal text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    DevLink
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-xl font-medium leading-tight text-white/82 sm:text-2xl lg:text-3xl">
                A working feed for Roblox developers, clients, and teams.
              </p>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/56">
                Follow builders, read current work, spot hiring signals, and move the right conversation into messages.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ActionLink
                  href="/register"
                  variant="primary"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Join DevLink
                </ActionLink>
                <ActionLink href="/login" variant="secondary">
                  Sign in
                </ActionLink>
              </div>
            </section>

            <section className={surface("panel", "noise-overlay relative min-w-0 overflow-hidden p-4 animate-slide-up stagger-1 sm:p-5")}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.46)] to-transparent" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-normal text-white">See the work before the pitch</h2>
                  <p className="mt-1 text-sm leading-5 text-white/48">Profiles, posts, jobs, and replies live in one loop.</p>
                </div>
                <Search className="h-5 w-5 text-[var(--color-accent-2)]" />
              </div>

              <div className="space-y-2">
                {audienceLanes.map(({ title, desc, Icon }) => (
                  <div key={title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-white/[0.11] hover:bg-white/[0.04]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[var(--color-accent-2)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <p className="mt-1 text-sm leading-5 text-white/52">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {session && currentUserProfile && (
        <div className="mx-auto grid w-full max-w-3xl min-w-0 gap-5 pb-20 pt-4 animate-slide-up lg:pb-28 lg:pt-8">
          <main className="min-w-0">
            <div className="mb-5 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                  Good to see you, {firstName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
                  Post what changed, then scan the people and projects worth answering.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/64">
                <Bell className="h-4 w-4 text-[var(--color-accent-2)]" />
                {feedCountLabel}
              </div>
            </div>

            <div className="mb-5">
              <LazyCreatePost currentUserProfile={{
                avatarUrl: currentUserProfile.profile?.avatarUrl ?? null,
                name: currentUserProfile.name,
                username: currentUserProfile.username
              }} />
            </div>

            <PostFeed
              posts={feedPosts}
              currentUserId={currentUserProfile?.id}
              hidePinnedIndicator={true}
              showNavigationArrow={false}
              onUpdate={handlePostUpdate}
              session={session}
            />
          </main>
        </div>
      )}
    </>
  );
});
