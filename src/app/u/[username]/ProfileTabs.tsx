"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PostFeed } from "@/components/feed/PostFeed";
import { ReviewsSection } from "@/components/ui/ReviewsSection";
import { PortfolioEditor } from "@/components/portfolio/PortfolioEditor";
import { PortfolioItemDisplay } from "@/components/portfolio/PortfolioItemDisplay";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { SkillsDisplay, AvailabilityBadge } from "@/components/ui/SkillsDisplay";
import { 
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  formatRate,
  type ExperienceLevel,
  type AvailabilityStatus,
  type RateUnit,
} from "@/lib/skills";

interface UserSkill {
  id: string;
  skillId: string;
  experienceLevel: string;
  yearsOfExp: number | null;
  isPrimary: boolean;
  headline?: string | null;
  rate?: number | null;
  rateUnit?: string | null;
  skillAvailability?: string | null;
  description?: string | null;
  skill: { id: string; name: string; category: string };
}

interface ProfileData {
  location?: string | null;
  website?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  currency?: string | null;
  responseTime?: string | null;
}

interface ProfileTabsProps {
  username: string;
  currentUserId?: string;
  userId: string;
  skills?: UserSkill[];
  profileData?: ProfileData;
}

type TabType = "about" | "posts" | "reposts" | "liked" | "replies" | "saved" | "portfolio" | "reviews";

// Expandable Skill Card Component
function ExpandableSkillCard({ 
  skill, 
  levelConfig, 
  availabilityConfig,
  currency 
}: { 
  skill: UserSkill; 
  levelConfig: typeof EXPERIENCE_LEVELS[ExperienceLevel];
  availabilityConfig: typeof AVAILABILITY_STATUS[AvailabilityStatus] | null;
  currency: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasExpandableContent = skill.description;
  
  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        skill.isPrimary 
          ? 'bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20' 
          : 'bg-white/[0.01] border-white/[0.06] hover:border-white/10'
      }`}
    >
      {/* Main content */}
      <div className="p-5">
        {/* Top row: Name + Rate */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            {skill.isPrimary && (
              <span className="text-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
            )}
            <h4 className="font-semibold text-white text-base">{skill.skill.name}</h4>
          </div>
          
          {/* Rate */}
          {skill.rate && skill.rateUnit && (
            <span className="text-sm font-medium text-emerald-400">
              {formatRate(skill.rate, skill.rateUnit as RateUnit, currency)}
            </span>
          )}
        </div>
        
        {/* Middle row: Metadata */}
        <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
          <span className={levelConfig?.color || 'text-white/50'}>
            {levelConfig?.label}
          </span>
          
          {skill.yearsOfExp && (
            <>
              <span className="text-white/20">•</span>
              <span>{skill.yearsOfExp}+ years</span>
            </>
          )}
          
          {availabilityConfig && (
            <>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  skill.skillAvailability === 'AVAILABLE' ? 'bg-emerald-400' :
                  skill.skillAvailability === 'OPEN_TO_OFFERS' ? 'bg-blue-400' :
                  skill.skillAvailability === 'BUSY' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className={availabilityConfig.color}>{availabilityConfig.label}</span>
              </span>
            </>
          )}
        </div>
        
        {/* Headline */}
        {skill.headline && (
          <p className="text-sm text-white/60 leading-relaxed">{skill.headline}</p>
        )}
      </div>
      
      {/* Details section - full width like actions area */}
      {hasExpandableContent && (
        <div 
          className="flex items-center gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01] cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs text-white/40">{expanded ? 'Hide details' : 'Show details'}</span>
          <svg 
            className={`w-3 h-3 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      
      {/* Expanded description - separate full-width section */}
      {expanded && skill.description && (
        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.01]">
          <p className="text-sm text-white/50 leading-relaxed">
            {skill.description}
          </p>
        </div>
      )}
    </div>
  );
}

// Client-side cache for tab data (persists during session)
// NOTE: Engagement tabs (liked, reposts, saved) skip cache for real-time accuracy
const tabDataCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds client-side cache
const ENGAGEMENT_TABS = ['liked', 'reposts', 'saved'] as const;

export function ProfileTabs({ username, currentUserId, userId, skills = [], profileData = {} }: ProfileTabsProps) {
  // Default to "about" if there's content, otherwise "posts"
  const hasAboutContent = skills.length > 0 || profileData.location || profileData.website;
  const [activeTab, setActiveTab] = useState<TabType>(hasAboutContent ? "about" : "posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPortfolioEditor, setShowPortfolioEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const POSTS_PER_PAGE = 20;

  const isOwner = currentUserId === userId;

  const tabs = [
    ...(hasAboutContent ? [{
      id: "about" as TabType, 
      label: "About", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }] : []),
    { 
      id: "posts" as TabType, 
      label: "Posts", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: "replies" as TabType, 
      label: "Replies", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: "reposts" as TabType, 
      label: "Reposts", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    { 
      id: "liked" as TabType, 
      label: "Liked", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: "saved" as TabType, 
      label: "Saved", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ), 
      private: true 
    },
    { 
      id: "portfolio" as TabType, 
      label: "Portfolio", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      id: "reviews" as TabType, 
      label: "Reviews", 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    },
  ];

  const fetchPosts = useCallback(async (tabType: TabType, page: number = 1, append: boolean = false, forceRefresh: boolean = false) => {
    // Build cache key
    const cacheKey = `${userId}:${tabType}:${page}`;
    
    // Skip cache for engagement tabs (liked, reposts, saved) - they need real-time accuracy
    const isEngagementTab = ENGAGEMENT_TABS.includes(tabType as any);
    
    // Check client-side cache first (unless forcing refresh, appending, or engagement tab)
    if (!forceRefresh && !append && !isEngagementTab) {
      const cached = tabDataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setPosts(cached.data);
        setHasMore(cached.data.length === POSTS_PER_PAGE);
        return; // Use cached data
      }
    }
    
    setLoading(true);
    setError(null);
    try {
      let endpoint = `/api/posts`;
      let params = new URLSearchParams();
      
      // Add pagination params
      const skip = (page - 1) * POSTS_PER_PAGE;
      const limit = POSTS_PER_PAGE;
      
      switch (tabType) {
        case "posts":
          params.append("userId", userId);
          params.append("limit", limit.toString());
          params.append("skip", skip.toString());
          break;
        case "reposts":
          endpoint = `/api/users/${userId}/reposts`;
          params.append("page", page.toString());
          params.append("limit", limit.toString());
          break;
        case "liked":
          endpoint = `/api/users/${userId}/liked`;
          params.append("page", page.toString());
          params.append("limit", limit.toString());
          break;
        case "replies":
          endpoint = `/api/users/${userId}/replies`;
          params.append("page", page.toString());
          params.append("limit", limit.toString());
          break;
        case "saved":
          endpoint = `/api/posts/save`;
          params.append("page", page.toString());
          params.append("limit", limit.toString());
          break;
        case "reviews":
          // Reviews are handled by ReviewsSection component, no need to fetch posts
          setPosts([]);
          setLoading(false);
          return;
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      // Use default caching (let browser and server handle it)
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        let newPosts: any[] = [];
        
        if (tabType === "saved") {
          newPosts = data.savedPosts?.map((saved: any) => saved.post) || [];
        } else {
          newPosts = data.posts || data;
        }
        
        // Cache the result
        tabDataCache.set(cacheKey, { data: newPosts, timestamp: Date.now() });
        
        // If appending (load more), add to existing posts; otherwise replace
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        // Check if there are more posts to load
        setHasMore(newPosts.length === limit);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      console.error(`Error fetching ${tabType}:`, error);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to load ${tabType}. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, POSTS_PER_PAGE, toast]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const endpoint = isOwner 
        ? `/api/portfolio/mine` 
        : `/api/portfolio?userId=${userId}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data.portfolioItems || []);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = useCallback(async (updatedPost: any) => {
    // Invalidate relevant caches when engagement changes
    const invalidateCacheFor = (tab: TabType) => {
      const cacheKey = `${userId}:${tab}:1`;
      tabDataCache.delete(cacheKey);
    };
    
    // Immediately update local state for instant UI feedback
    setPosts(prevPosts => {
      // Check if post should be added to current tab (for when you like/repost/save on feed, then navigate to profile)
      const shouldBeInTab = 
        (activeTab === "liked" && updatedPost.likes?.some((like: any) => like.userId === currentUserId)) ||
        (activeTab === "reposts" && updatedPost.reposts?.some((repost: any) => repost.userId === currentUserId)) ||
        (activeTab === "saved" && updatedPost.savedBy?.some((saved: any) => saved.userId === currentUserId));
      
      const postExists = prevPosts.some(post => post.id === updatedPost.id);
      
      // If post should be in tab but isn't, add it at the top for instant feedback
      if (shouldBeInTab && !postExists && currentUserId) {
        invalidateCacheFor(activeTab);
        return [updatedPost, ...prevPosts];
      }
      
      // If we're on the "liked" tab and the post is no longer liked, remove it
      if (activeTab === "liked") {
        const isStillLiked = updatedPost.likes?.some((like: any) => like.userId === currentUserId);
        if (!isStillLiked && currentUserId) {
          invalidateCacheFor("liked");
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // If we're on the "reposts" tab and the post is no longer reposted, remove it
      if (activeTab === "reposts") {
        const isStillReposted = updatedPost.reposts?.some((repost: any) => repost.userId === currentUserId);
        if (!isStillReposted && currentUserId) {
          invalidateCacheFor("reposts");
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // If we're on the "saved" tab and the post is no longer saved, remove it
      if (activeTab === "saved") {
        const isStillSaved = updatedPost.savedBy?.some((saved: any) => saved.userId === currentUserId);
        if (!isStillSaved && currentUserId) {
          invalidateCacheFor("saved");
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // Otherwise, update the post in place
      return prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post);
    });
    
    // For engagement tabs, do a background refresh after a short delay (no loading state)
    if (activeTab === "liked" || activeTab === "reposts" || activeTab === "saved") {
      setTimeout(() => {
        fetchPosts(activeTab, 1, false, true); // Force refresh in background
      }, 500);
    }
  }, [activeTab, currentUserId, fetchPosts, userId]);

  useEffect(() => {
    // Reset pagination when switching tabs
    setCurrentPage(1);
    setHasMore(false);
    
    if (activeTab === "portfolio") {
      fetchPortfolio();
    } else {
      // Fetch data (will use cache if available and fresh)
      fetchPosts(activeTab, 1, false, false);
    }
  }, [activeTab, userId, fetchPosts]);

  // Listen for engagement updates from other pages (e.g., feed page)
  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post, action, liked, reposted, saved } = event.detail;
      
      // Clear ALL relevant caches immediately
      const clearCaches = () => {
        ['posts', 'reposts', 'liked', 'saved', 'replies'].forEach(tab => {
          for (let page = 1; page <= 10; page++) {
            tabDataCache.delete(`${userId}:${tab}:${page}`);
          }
        });
      };
      
      // Handle specific actions
      if (action === 'repost') {
        clearCaches();
        if (activeTab === 'reposts') {
          if (reposted === false) {
            // Remove post from reposts tab immediately
            setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
          }
          // Force refresh
          fetchPosts('reposts', 1, false, true);
        }
      } else if (action === 'save') {
        clearCaches();
        if (activeTab === 'saved') {
          if (saved === false) {
            // Remove post from saved tab immediately
            setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
          }
          // Force refresh
          fetchPosts('saved', 1, false, true);
        }
      } else if (action === 'like') {
        clearCaches();
        if (activeTab === 'liked') {
          if (liked === false) {
            // Remove post from liked tab immediately
            setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
          }
          // Force refresh
          fetchPosts('liked', 1, false, true);
        }
      } else {
        // For any other action, still update
        handlePostUpdate(post);
      }
    };

    window.addEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
    return () => window.removeEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
  }, [handlePostUpdate, activeTab, userId, fetchPosts]);

  // Background refresh when page becomes visible (only if cache is stale)
  useEffect(() => {
    let lastVisibilityState = document.visibilityState;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastVisibilityState === 'hidden') {
        // Only do a background refresh if we have stale data
        const cacheKey = `${userId}:${activeTab}:1`;
        const cached = tabDataCache.get(cacheKey);
        const isStale = !cached || Date.now() - cached.timestamp > CACHE_TTL;
        
        if (isStale && (activeTab === "liked" || activeTab === "reposts" || activeTab === "saved")) {
          // Background refresh - don't show loading state
          fetchPosts(activeTab, 1, false, true);
        }
      }
      lastVisibilityState = document.visibilityState;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab, fetchPosts, userId]);

  const handleSavePortfolioItem = (newItem: any) => {
    if (editingItem) {
      setPortfolioItems(portfolioItems.map(item => item.id === newItem.id ? newItem : item));
      setEditingItem(null);
    } else {
      setPortfolioItems([newItem, ...portfolioItems]);
    }
    setShowPortfolioEditor(false);
  };

  const handleDeletePortfolioItem = (itemId: string) => {
    setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
    toast({ title: "Success", description: "Portfolio item deleted" });
  };

  const handleEditPortfolioItem = (item: any) => {
    setEditingItem(item);
    setShowPortfolioEditor(true);
  };

  // Render reply with preview of original post - Twitter-like thread view
  const renderReplyWithPreview = (reply: any) => {
    if (!reply.replyTo) return null;

    const originalPost = reply.replyTo;
    const originalAuthor = originalPost.user;

    return (
      <div key={reply.id} className="relative overflow-hidden glass-soft glass-hover rounded-2xl border border-white/10 overflow-hidden transition-colors">
        {/* Original post preview - compact thread header */}
        <button
          onClick={() => window.location.href = `/p/${originalPost.id}`}
          className="w-full text-left p-4 pb-3 hover:bg-white/[0.02] transition-colors group"
        >
          <div className="flex items-start gap-3">
            {/* Avatar with thread line */}
            <div className="relative flex flex-col items-center">
              <img
                src={originalAuthor?.image || '/default-avatar.png'}
                alt={originalAuthor?.username || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[rgba(var(--color-accent-rgb),0.3)] transition-all"
              />
              {/* Thread connector line */}
              <div className="w-0.5 h-6 bg-gradient-to-b from-white/20 to-transparent mt-2" />
            </div>
            
            {/* Original post content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/90 group-hover:text-white truncate">
                  {originalAuthor?.displayName || originalAuthor?.username || 'Unknown'}
                </span>
                <span className="text-xs text-white/40">@{originalAuthor?.username || 'unknown'}</span>
              </div>
              <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                {originalPost.content}
              </p>
              {originalPost.media?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{originalPost.media.length} {originalPost.media.length === 1 ? 'image' : 'images'}</span>
                </div>
              )}
            </div>
            
            {/* Arrow indicator */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/20 group-hover:text-[rgba(var(--color-accent-rgb),0.6)] transition-colors flex-shrink-0 mt-1">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
        
        {/* Divider with "replied" indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[rgba(var(--color-accent-rgb),0.6)]">
              <path d="M3 10h10a5 5 0 0 1 5 5v6M3 10l6 6M3 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Replied</span>
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        
        {/* The actual reply */}
        <div className="px-0">
          <PostFeed 
            posts={[reply]} 
            currentUserId={currentUserId} 
            showNavigationArrow={false} 
            hidePinnedIndicator={true}
            onUpdate={handlePostUpdate} 
          />
        </div>
      </div>
    );
  };

  // Check if current user can see private tabs
  const canSeePrivateTabs = currentUserId === userId;

  return (
    <div className="mt-4 sm:mt-8">
      {/* Tab Navigation - Horizontal scroll container */}
      <div 
        className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto glass-soft rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-white/10"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {tabs.map((tab) => {
          // Hide private tabs if not the owner
          if (tab.private && !canSeePrivateTabs) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium transition-all duration-200 flex-shrink-0 rounded-lg sm:rounded-xl whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white bg-[rgba(var(--color-accent-rgb),0.14)] border border-[rgba(var(--color-accent-rgb),0.28)]"
                  : "text-[var(--muted-foreground)] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className={`flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 ${activeTab === tab.id ? 'text-[var(--color-accent)]' : ''}`}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {/* Post skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden glass-soft rounded-xl border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                      <div className="h-4 w-16 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="flex gap-4 mt-3">
                      <div className="h-4 w-12 bg-white/5 rounded" />
                      <div className="h-4 w-12 bg-white/5 rounded" />
                      <div className="h-4 w-12 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "about" ? (
          <div className="space-y-6">
            {/* Skills Section - Detailed cards */}
            {skills.length > 0 && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills & Services
                </h3>
                <div className="space-y-3">
                  {skills.map((s) => {
                    const levelConfig = EXPERIENCE_LEVELS[s.experienceLevel as ExperienceLevel];
                    const availabilityConfig = s.skillAvailability ? AVAILABILITY_STATUS[s.skillAvailability as AvailabilityStatus] : null;
                    
                    return (
                      <ExpandableSkillCard
                        key={s.id}
                        skill={s}
                        levelConfig={levelConfig}
                        availabilityConfig={availabilityConfig}
                        currency={profileData.currency || "USD"}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Info - Only location and website */}
            {(profileData.location || profileData.website) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Location Card */}
                {profileData.location && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium text-white/80">{profileData.location}</p>
                    </div>
                  </div>
                )}
                
                {/* Website Card */}
                {profileData.website && (
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/[0.08] to-transparent border border-[var(--color-accent)]/20 flex items-center gap-3 group hover:border-[var(--color-accent)]/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center group-hover:bg-[var(--color-accent)]/30 transition-colors">
                      <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/40 uppercase tracking-wide">Website</p>
                      <p className="text-sm font-medium text-[var(--color-accent)] truncate group-hover:underline">
                        {profileData.website.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        ) : activeTab === "portfolio" ? (
          <>
            {/* Portfolio Header with Add Button */}
            {isOwner && (
              <div className="relative overflow-hidden mb-8 p-5 rounded-2xl glass-soft border border-white/10">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-55"
                  style={{
                    background:
                      "radial-gradient(900px 260px at 20% 0%, rgba(var(--color-accent-rgb),0.12), transparent 62%), radial-gradient(700px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.08), transparent 60%)",
                  }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[rgba(var(--color-accent-rgb),0.3)]">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Your Portfolio</h3>
                      <p className="text-sm text-[rgba(var(--color-accent-rgb),0.8)]">
                        {portfolioItems.length === 0 
                          ? "Showcase your best work" 
                          : `${portfolioItems.length} ${portfolioItems.length === 1 ? 'item' : 'items'} showcased`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="glow"
                    size="md"
                    onClick={() => {
                      setEditingItem(null);
                      setShowPortfolioEditor(true);
                    }}
                    className="flex items-center gap-2.5 whitespace-nowrap"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Portfolio Item
                  </Button>
                </div>
              </div>
            )}

            {/* Portfolio Items */}
            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {portfolioItems.map((item) => (
                  <PortfolioItemDisplay 
                    key={item.id}
                    item={item}
                    isOwner={isOwner}
                    onEdit={handleEditPortfolioItem}
                    onDelete={handleDeletePortfolioItem}
                  />
                ))}
              </div>
            ) : !isOwner ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[rgba(var(--color-accent-rgb),0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">No public portfolio items</p>
                <p className="text-sm">This user hasn't shared their portfolio yet.</p>
              </div>
            ) : null}
          </>
        ) : error ? (
          <div className="rounded-lg bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-[var(--color-accent)]">Failed to load {activeTab}</h3>
                <p className="text-sm text-[var(--color-accent)]/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : activeTab === "reviews" ? (
          <ReviewsSection
            targetUserId={userId}
            targetUsername={username}
            currentUserId={currentUserId}
            canReview={true}
          />
        ) : activeTab === "replies" && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(renderReplyWithPreview)}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    fetchPosts(activeTab, currentPage + 1, true);
                  }}
                  disabled={loading}
                  variant="secondary"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : posts.length > 0 ? (
          <div>
            <PostFeed posts={posts} currentUserId={currentUserId} hidePinnedIndicator={false} onUpdate={handlePostUpdate} />
            {hasMore && (
              <div className="text-center pt-8">
                <Button
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    fetchPosts(activeTab, currentPage + 1, true);
                  }}
                  disabled={loading}
                  variant="secondary"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <div className="flex justify-center mb-4">
              {activeTab === "posts" && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {activeTab === "replies" && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {activeTab === "reposts" && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {activeTab === "liked" && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              {activeTab === "saved" && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
              {(activeTab as any) === "reviews" && (
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
            <p className="text-lg font-medium mb-2">
              No {activeTab} yet
            </p>
            <p className="text-sm">
              {activeTab === "posts" && "When you post, it will appear here."}
              {activeTab === "replies" && "When you reply to posts, they will appear here."}
              {activeTab === "reposts" && "When you repost something, it will appear here."}
              {activeTab === "liked" && "Posts you like will appear here."}
              {activeTab === "saved" && "Posts you save will appear here."}
              {(activeTab as any) === "reviews" && "Reviews from other users will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* Portfolio Editor Modal */}
      <PortfolioEditor 
        isOpen={showPortfolioEditor}
        onClose={() => {
          setShowPortfolioEditor(false);
          setEditingItem(null);
        }}
        onSave={handleSavePortfolioItem}
        existingItem={editingItem}
        userId={userId}
        userSkills={skills}
      />
    </div>
  );
}


