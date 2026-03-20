"use client";
import { memo, useState, useEffect, useCallback } from "react";
import { CreatePost } from "./CreatePost";
import { PostFeed } from "./PostFeed";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { cn } from "@/lib/cn";

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

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
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
    _count?: {
      followers: number;
      following: number;
    };
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    order: number;
  }>;
  isSlideshow: boolean;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      isSelected?: boolean;
    }>;
    isMultiple: boolean;
    expiresAt: Date | null;
    totalVotes: number;
  };
  likes?: Array<{ id: string; userId: string }>;
  reposts?: { id: string; userId: string }[];
  replies?: Array<{ id: string; userId: string }>;
  views: number;
  isPinned: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  _count?: {
    likes: number;
    reposts: number;
    replies?: number;
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
  postsWithViewCounts: Post[];
}

const features = [
  { icon: "monitor", title: "Developers", desc: "Showcase your work", color: "blue" },
  { icon: "briefcase", title: "Clients", desc: "Find talent", color: "green" },
  { icon: "bell", title: "Influencers", desc: "Promote projects", color: "red" }
];

const FEATURE_STYLES: Record<
  string,
  { panel: string; icon: string; titleHover: string; glow: string }
> = {
  blue: {
    panel: "glass-soft border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-500/5",
    icon: "text-blue-400 bg-blue-500/10 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    titleHover: "group-hover/card:text-blue-300",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  green: {
    panel: "glass-soft border-emerald-400/20 hover:border-emerald-400/40 hover:bg-emerald-500/5",
    icon: "text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    titleHover: "group-hover/card:text-emerald-300",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  red: {
    panel: "glass-soft border-rose-400/20 hover:border-rose-400/40 hover:bg-rose-500/5",
    icon: "text-rose-400 bg-rose-500/10 border border-rose-400/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    titleHover: "group-hover/card:text-rose-300",
    glow: "rgba(244, 63, 94, 0.4)",
  },
};

export const AnimatedHomeContent = memo(function AnimatedHomeContent({
  session,
  currentUserProfile,
  postsWithViewCounts
}: AnimatedHomeContentProps) {
  // Manage posts state locally so we can update on engagement changes
  const [feedPosts, setFeedPosts] = useState<Post[]>(postsWithViewCounts || []);
  // Track when we last made a local update to avoid server overwriting optimistic state
  const [lastLocalUpdate, setLastLocalUpdate] = useState(0);
  // Track if we've fetched fresh engagement state
  const [engagementFetched, setEngagementFetched] = useState(false);

  // Update posts when new data comes from server
  // BUT don't overwrite if we just made a local update (prevents reverting optimistic state)
  useEffect(() => {
    const timeSinceLastUpdate = Date.now() - lastLocalUpdate;
    // Only sync from server if it's been more than 2 seconds since last local update
    if (timeSinceLastUpdate > 2000) {
      setFeedPosts(postsWithViewCounts || []);
      setEngagementFetched(false); // Need to re-fetch engagement for new posts
    }
  }, [postsWithViewCounts, lastLocalUpdate]);

  // Fetch fresh engagement state client-side after mount
  // This allows the page to be cached while still showing accurate engagement
  useEffect(() => {
    if (!session?.user?.id || engagementFetched || feedPosts.length === 0) return;

    const fetchEngagement = async () => {
      try {
        const postIds = feedPosts.map(p => p.id);
        const response = await fetch('/api/posts/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postIds })
        });

        if (!response.ok) return;

        const { engagement } = await response.json();
        if (!engagement) return;

        // Update posts with fresh engagement state
        setFeedPosts(prevPosts => prevPosts.map(post => {
          const postEngagement = engagement[post.id];
          if (!postEngagement) return post;

          return {
            ...post,
            isLiked: postEngagement.isLiked,
            isReposted: postEngagement.isReposted,
            isSaved: postEngagement.isSaved
          };
        }));

        setEngagementFetched(true);
      } catch (error) {
        console.error('Failed to fetch engagement:', error);
      }
    };

    // Small delay to not block initial render
    const timeoutId = setTimeout(fetchEngagement, 100);
    return () => clearTimeout(timeoutId);
  }, [session?.user?.id, engagementFetched, feedPosts.length]);

  // Listen for engagement updates and update posts immediately
  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post, action, liked, reposted, saved } = event.detail;

      // Mark that we're making a local update
      setLastLocalUpdate(Date.now());

      setFeedPosts(prevPosts => prevPosts.map(p => {
        if (p.id !== post.id) return p;

        // Update the specific engagement state
        const updates: Partial<Post> = {};
        if (action === 'like' && liked !== undefined) {
          updates.isLiked = liked;
        }
        if (action === 'repost' && reposted !== undefined) {
          updates.isReposted = reposted;
        }
        if (action === 'save' && saved !== undefined) {
          updates.isSaved = saved;
        }

        return { ...p, ...updates } as Post;
      }));
    };

    window.addEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
    return () => window.removeEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
  }, []);

  // Handle post updates from child components
  const handlePostUpdate = useCallback((updatedPostInput: unknown) => {
    const updatedPost = updatedPostInput as Post;
    setLastLocalUpdate(Date.now());
    setFeedPosts(prevPosts => prevPosts.map(p =>
      p.id === updatedPost.id ? { ...p, ...updatedPost } : p
    ));
  }, []);

  return (
    <>
      {!session && (
        <div className="pt-24 pb-20 text-center relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6">

            <div className="flex flex-col items-center justify-center gap-6 mb-10 animate-slide-down">
              <ThemeLogoImg
                className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              />
              <h1
                className="text-6xl sm:text-7xl lg:text-[6.5rem] font-bold tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                DevLink
              </h1>
            </div>

            <p className="text-xl md:text-2xl lg:text-3xl text-white/50 font-medium tracking-tight mb-20 max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-1">
              The pulse of the Roblox development community. <span className="text-white/80">Discover talent, promote projects, and build the future.</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up stagger-2">
              {features.map((item, index) => {
                const style = FEATURE_STYLES[item.color] ?? FEATURE_STYLES.blue;
                return (
                  <div
                    key={item.title}
                    className={cn("group/card relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 cursor-pointer border", style.panel)}
                    style={{ animationDelay: `${0.3 + index * 0.15}s` }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(400px circle at 50% 100%, ${style.glow} 0%, transparent 70%)`
                      }}
                    />

                    <div className="relative z-10">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-500",
                          style.icon
                        )}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          {item.icon === "monitor" && (
                            <>
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          )}
                          {item.icon === "briefcase" && (
                            <>
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          )}
                          {item.icon === "bell" && (
                            <>
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          )}
                        </svg>
                      </div>
                      <div className={cn("text-2xl font-bold mb-3 tracking-tight text-white/90 transition-colors duration-300 font-[var(--font-space-grotesk)]", style.titleHover)}>
                        {item.title}
                      </div>
                      <div className="text-white/50 text-base leading-relaxed group-hover/card:text-white/70 transition-colors duration-300">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* Create Post Section */}
      {session && currentUserProfile && (
        <div className="mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative group">
            {/* Animated glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)]/10 via-cyan-500/10 to-[var(--color-accent)]/10 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-glow-pulse"></div>

            <div className="relative glass-soft rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-2xl overflow-hidden">
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
              </div>

              <div className="relative flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-[var(--color-accent)]/30 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Create Post</h2>
                  <p className="text-xs text-[var(--muted-foreground)] opacity-70">Share with the community</p>
                </div>
              </div>

              <CreatePost currentUserProfile={{
                avatarUrl: currentUserProfile.profile?.avatarUrl ?? null,
                name: currentUserProfile.name,
                username: currentUserProfile.username
              }} />
            </div>
          </div>
        </div>
      )}

      <div className="mb-32 pb-16 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <PostFeed
          posts={feedPosts}
          currentUserId={currentUserProfile?.id}
          hidePinnedIndicator={true}
          showNavigationArrow={false}
          onUpdate={handlePostUpdate}
          session={session}
        />
      </div>
    </>
  );
});
