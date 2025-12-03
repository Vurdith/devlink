"use client";
import { memo, useState, useEffect, useCallback } from "react";
import { CreatePost } from "./CreatePost";
import { PostFeed } from "./PostFeed";

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

export const AnimatedHomeContent = memo(function AnimatedHomeContent({ 
  session, 
  currentUserProfile, 
  postsWithViewCounts 
}: AnimatedHomeContentProps) {
  // Manage posts state locally so we can update on engagement changes
  const [feedPosts, setFeedPosts] = useState<Post[]>(postsWithViewCounts || []);
  
  // Update posts when new data comes from server
  useEffect(() => {
    setFeedPosts(postsWithViewCounts || []);
  }, [postsWithViewCounts]);
  
  // Listen for engagement updates and update posts immediately
  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post, action, liked, reposted, saved } = event.detail;
      
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
    setFeedPosts(prevPosts => prevPosts.map(p => 
      p.id === updatedPost.id ? { ...p, ...updatedPost } : p
    ));
  }, []);
  
  return (
    <>
      {!session && (
        <div className="pt-20 pb-16 text-center">
          <div className="bg-[#0d0d12] rounded-3xl p-12 max-w-6xl mx-auto border border-white/10 hover:border-[var(--color-accent)]/30 transition-all duration-300 relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-8 animate-slide-down">
                <img
                  src="/logo/logo.png"
                  alt="DevLink"
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {features.map((item, index) => (
                  <div 
                    key={item.title}
                    className="text-center group/card animate-slide-up lift-hover cursor-default"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div 
                      className={`w-20 h-20 bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 group-hover/card:shadow-lg group-hover/card:shadow-${item.color}-500/20 transition-all duration-300 border border-${item.color}-500/30`}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={`text-${item.color}-400`}>
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
                    <div className="text-2xl font-semibold mb-3 text-white group-hover/card:text-[var(--color-accent)] transition-colors">{item.title}</div>
                    <div className="text-gray-400 group-hover/card:text-gray-300 transition-colors">{item.desc}</div>
                  </div>
                ))}
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
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)]/20 via-cyan-500/20 to-[var(--color-accent)]/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-glow-pulse"></div>
            
            <div className="relative bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/30 group-hover:border-[var(--color-accent)]/50 transition-all duration-300 shadow-2xl overflow-hidden">
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
