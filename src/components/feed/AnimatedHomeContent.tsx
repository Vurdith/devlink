"use client";
import dynamic from "next/dynamic";
import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Bell, BriefcaseBusiness, Code2, MessageSquare, Search, Sparkles, Users } from "lucide-react";
import { PostFeed } from "./PostFeed";
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
    desc: "Ship notes, portfolio drops, and technical asks.",
    Icon: Code2,
  },
  {
    title: "Clients",
    desc: "Find builders through live work and replies.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Teams",
    desc: "Turn feed activity into messages and projects.",
    Icon: Users,
  },
];

const workQueue = [
  { label: "Scan updates", desc: "Recent posts from builders and teams", Icon: Sparkles },
  { label: "Resume chats", desc: "Jump back into active conversations", Icon: MessageSquare },
  { label: "Check jobs", desc: "Review new opportunities and signals", Icon: BriefcaseBusiness },
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
  const followingCount = currentUserProfile?._count.following ?? 0;
  const followerCount = currentUserProfile?._count.followers ?? 0;

  return (
    <>
      {!session && (
        <div className="pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
            <section className="min-w-0 animate-slide-up">
              <div className="mb-7 flex items-center gap-4">
                <ThemeLogoImg className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-2)]">Developer network</p>
                  <h1 className="mt-1 text-5xl font-bold leading-none tracking-normal text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    DevLink
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-xl font-medium leading-tight text-white/82 sm:text-2xl lg:text-3xl">
                A working feed for Roblox developers, clients, and teams.
              </p>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/54">
                Follow builders, read project updates, spot hiring signals, and turn useful activity into conversations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.36)] bg-[rgba(var(--color-accent-2-rgb),0.14)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[rgba(var(--color-accent-2-rgb),0.20)]"
                >
                  Join DevLink <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white/78 transition-colors hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white"
                >
                  Sign in
                </Link>
              </div>
            </section>

            <section className={surface("panel", "noise-overlay relative min-w-0 overflow-hidden p-4 animate-slide-up stagger-1 sm:p-5")}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.46)] to-transparent" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">Live workspace preview</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-normal text-white">What starts here</h2>
                </div>
                <Search className="h-5 w-5 text-[var(--color-accent-2)]" />
              </div>

              <div className="space-y-3">
                {audienceLanes.map(({ title, desc, Icon }) => (
                  <div key={title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
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
              <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-400/[0.06] px-4 py-3 text-sm leading-6 text-emerald-100/78">
                New posts, job signals, and messages belong in one daily starting point.
              </div>
            </section>
          </div>
        </div>
      )}

      {session && currentUserProfile && (
        <div className="grid min-w-0 gap-5 pb-20 pt-4 animate-slide-up lg:grid-cols-[minmax(0,760px)_minmax(280px,1fr)] lg:items-start lg:gap-8 lg:pb-28 lg:pt-8">
          <main className="min-w-0">
            <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-2)]">Start here</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                  Good to see you, {firstName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
                  Compose once, then scan the latest project updates, replies, and hiring signals.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/62">
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

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <section className={surface("toolbar", "noise-overlay p-4")}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Today&apos;s workspace</h2>
                  <p className="mt-1 text-xs text-white/45">@{currentUserProfile.username}</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-white/62">
                  {followingCount} following
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="text-xl font-semibold text-white">{followerCount}</div>
                  <div className="mt-1 text-xs text-white/45">followers</div>
                </div>
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="text-xl font-semibold text-white">{feedPosts.length}</div>
                  <div className="mt-1 text-xs text-white/45">updates</div>
                </div>
              </div>
            </section>

            <section className={surface("empty", "p-3")}>
              <h2 className="px-1 pb-2 text-sm font-semibold text-white">Next useful moves</h2>
              <div className="space-y-1">
                {workQueue.map(({ label, desc, Icon }) => (
                  <div key={label} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.035]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/62">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/86">{label}</div>
                      <p className="mt-0.5 text-xs leading-5 text-white/42">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
});
