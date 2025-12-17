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
    };
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
    expiresAt: Date;
    totalVotes: number;
  };
  likes: Array<{ id: string; userId: string }>;
  reposts: Array<{ id: string; userId: string }>;
  replies: Array<{ id: string }>;
  views: number;
  isPinned: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
}

interface AnimatedHomeContentProps {
  session: { user?: { id: string; email?: string } } | null;
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
  { panel: string; icon: string; titleHover: string; shadowHover: string }
> = {
  blue: {
    panel: "bg-blue-500/10 border border-blue-400/20 hover:border-blue-400/35",
    icon: "text-blue-300 bg-blue-500/15 border border-blue-400/25",
    titleHover: "group-hover/card:text-blue-200",
    shadowHover: "group-hover/card:shadow-lg group-hover/card:shadow-blue-500/20",
  },
  green: {
    panel: "bg-emerald-500/10 border border-emerald-400/20 hover:border-emerald-400/35",
    icon: "text-emerald-300 bg-emerald-500/15 border border-emerald-400/25",
    titleHover: "group-hover/card:text-emerald-200",
    shadowHover: "group-hover/card:shadow-lg group-hover/card:shadow-emerald-500/20",
  },
  red: {
    panel: "bg-rose-500/10 border border-rose-400/20 hover:border-rose-400/35",
    icon: "text-rose-300 bg-rose-500/15 border border-rose-400/25",
    titleHover: "group-hover/card:text-rose-200",
    shadowHover: "group-hover/card:shadow-lg group-hover/card:shadow-rose-500/20",
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
  const handlePostUpdate = useCallback((updatedPost: any) => {
    setLastLocalUpdate(Date.now());
    setFeedPosts(prevPosts => prevPosts.map(p => 
      p.id === updatedPost.id ? { ...p, ...updatedPost } : p
    ));
  }, []);
  
  return (
    <>
      {!session && (
        <div className="pt-20 pb-16 text-center">
          <div className="glass noise-overlay rounded-3xl p-10 sm:p-12 max-w-6xl mx-auto border border-white/10 hover:border-[var(--color-accent)]/30 transition-all duration-300 relative overflow-hidden group">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-70"
              style={{
                background:
                  "radial-gradient(1100px 380px at 25% 0%, rgba(var(--color-accent-rgb),0.16), transparent 62%), radial-gradient(900px 360px at 92% 10%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-8 animate-slide-down">
                <ThemeLogoImg
                  className="w-20 h-20 object-contain animate-float"
                />
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[var(--color-accent)] via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  DevLink
                </h1>
              </div>
              
              <p className="text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed animate-slide-up stagger-1">
                The pulse of the Roblox development community
              </p>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed animate-slide-up stagger-2">
                Join thousands of developers, clients, and influencers building the future of Roblox
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                {features.map((item, index) => {
                  const style = FEATURE_STYLES[item.color] ?? FEATURE_STYLES.blue;
                  return (
                  <div 
                    key={item.title}
                    className={cn("text-center group/card animate-slide-up cursor-default rounded-2xl p-6 transition-all duration-300", style.panel, style.shadowHover)}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div 
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition-all duration-300",
                        style.icon
                      )}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        {item.icon === "monitor" && (
                          <>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </>
                        )}
                        {item.icon === "briefcase" && (
                          <>
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </>
                        )}
                        {item.icon === "bell" && (
                          <>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </>
                        )}
                      </svg>
                    </div>
                    <div className={cn("text-2xl font-semibold mb-3 text-white transition-colors", style.titleHover)}>{item.title}</div>
                    <div className="text-white/60 group-hover/card:text-white/75 transition-colors">{item.desc}</div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Section */}
      {session && currentUserProfile && (
        <div className="mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative group">
            {/* Animated glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)]/20 via-cyan-500/20 to-[var(--color-accent)]/20 rounded-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-glow-pulse"></div>
            
            <div className="relative glass noise-overlay rounded-2xl p-6 border border-[var(--color-accent)]/24 group-hover:border-[var(--color-accent)]/45 transition-all duration-300 shadow-2xl overflow-hidden">
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 shimmer-hover" />
              
              <div className="relative flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent)]/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-[var(--color-accent)]/30 shadow-lg shadow-[var(--color-accent)]/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create Post</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">Share with the community</p>
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

      {/* Main Feed Section */}
      <div className="mb-32 pb-16 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <PostFeed 
          posts={feedPosts} 
          currentUserId={currentUserProfile?.id}
          hidePinnedIndicator={true}
          showNavigationArrow={false}
          onUpdate={handlePostUpdate}
        />
      </div>
    </>
  );
});
