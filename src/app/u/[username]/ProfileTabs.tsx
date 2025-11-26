"use client";
import { useState, useEffect, useCallback } from "react";
import { PostFeed } from "@/components/feed/PostFeed";
import { ReviewsSection } from "@/components/ui/ReviewsSection";
import { PortfolioEditor } from "@/components/portfolio/PortfolioEditor";
import { PortfolioItemDisplay } from "@/components/portfolio/PortfolioItemDisplay";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface ProfileTabsProps {
  username: string;
  currentUserId?: string;
  userId: string;
}

type TabType = "posts" | "reposts" | "liked" | "replies" | "saved" | "portfolio" | "reviews";

export function ProfileTabs({ username, currentUserId, userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
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

  const fetchPosts = useCallback(async (tabType: TabType, page: number = 1, append: boolean = false) => {
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

      // Add cache-bust timestamp
      params.append("_t", Date.now().toString());
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let newPosts: any[] = [];
        
        if (tabType === "saved") {
          newPosts = data.savedPosts?.map((saved: any) => saved.post) || [];
        } else {
          newPosts = data.posts || data;
        }
        
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
        return [updatedPost, ...prevPosts];
      }
      
      // If we're on the "liked" tab and the post is no longer liked, remove it
      if (activeTab === "liked") {
        const isStillLiked = updatedPost.likes?.some((like: any) => like.userId === currentUserId);
        if (!isStillLiked && currentUserId) {
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // If we're on the "reposts" tab and the post is no longer reposted, remove it
      if (activeTab === "reposts") {
        const isStillReposted = updatedPost.reposts?.some((repost: any) => repost.userId === currentUserId);
        if (!isStillReposted && currentUserId) {
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // If we're on the "saved" tab and the post is no longer saved, remove it
      if (activeTab === "saved") {
        const isStillSaved = updatedPost.savedBy?.some((saved: any) => saved.userId === currentUserId);
        if (!isStillSaved && currentUserId) {
          return prevPosts.filter(post => post.id !== updatedPost.id);
        }
      }
      // Otherwise, update the post in place
      return prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post);
    });
    
    // Immediately refetch the current tab to ensure we have the latest data
    // This ensures that if you like something on feed, then go to profile, it appears instantly
    // Uses 100ms delay to allow API to complete the database operation
    setTimeout(() => {
      if (activeTab === "liked" || activeTab === "reposts" || activeTab === "saved") {
        fetchPosts(activeTab);
      }
    }, 100);
  }, [activeTab, currentUserId, fetchPosts]);

  useEffect(() => {
    // Reset pagination when switching tabs
    setCurrentPage(1);
    setHasMore(false);
    
    if (activeTab === "portfolio") {
      fetchPortfolio();
    } else {
      // Always fetch fresh data when switching tabs
      fetchPosts(activeTab, 1, false);
    }
  }, [activeTab, userId, fetchPosts]);

  // Listen for engagement updates from other pages (e.g., feed page)
  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post } = event.detail;
      // Immediately update local state if this post should be in the current tab
      handlePostUpdate(post);
    };

    window.addEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
    return () => window.removeEventListener('postEngagementUpdate', handleEngagementUpdate as EventListener);
  }, [handlePostUpdate]);

  // Refetch current tab when page becomes visible (e.g., navigating back from feed)
  useEffect(() => {
    let lastVisibilityState = document.visibilityState;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastVisibilityState === 'hidden') {
        // Page became visible after being hidden - refetch current tab to get latest data
        if (activeTab === "liked" || activeTab === "reposts" || activeTab === "saved") {
          fetchPosts(activeTab);
        }
      }
      lastVisibilityState = document.visibilityState;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab, fetchPosts]);

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

  // Render reply with preview of original post
  const renderReplyWithPreview = (reply: any) => {
    if (!reply.replyTo) return null;

    return (
      <div key={reply.id} className="space-y-3">
        {/* Preview of original post */}
        <div className="glass rounded-[var(--radius)] p-3 border border-white/10 bg-black/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Replying to</span>
            <span className="text-xs font-medium text-white">@{reply.replyTo.user?.username || 'unknown'}</span>
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {reply.replyTo.content}
          </div>
          <button
            onClick={() => window.location.href = `/p/${reply.replyTo.id}`}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go to post
          </button>
        </div>
        
        {/* The actual reply */}
        <div className="ml-4">
          <PostFeed posts={[reply]} currentUserId={currentUserId} showNavigationArrow={false} hidePinnedIndicator={false} onUpdate={handlePostUpdate} />
        </div>
      </div>
    );
  };

  // Check if current user can see private tabs
  const canSeePrivateTabs = currentUserId === userId;

  return (
    <div className="mt-4 sm:mt-8">
      {/* Tab Navigation - Always scrollable, always show labels */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 bg-black/40 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-purple-500/20">
        {tabs.map((tab) => {
          // Hide private tabs if not the owner
          if (tab.private && !canSeePrivateTabs) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium transition-all duration-200 flex-shrink-0 rounded-lg sm:rounded-xl whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white bg-purple-500/20 border border-purple-500/40"
                  : "text-[var(--muted-foreground)] hover:text-purple-300 hover:bg-purple-500/10 border border-transparent"
              }`}
            >
              <span className={`flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 ${activeTab === tab.id ? 'text-purple-400' : ''}`}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500/20 border-t-purple-500"></div>
          </div>
        ) : activeTab === "portfolio" ? (
          <>
            {/* Portfolio Header with Add Button */}
            {isOwner && (
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border border-purple-500/30 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Your Portfolio</h3>
                      <p className="text-sm text-purple-300/80">
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
              <div className="space-y-6">
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
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-red-500">Failed to load {activeTab}</h3>
                <p className="text-sm text-red-500/80 mt-1">{error}</p>
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
      {showPortfolioEditor && (
        <PortfolioEditor 
          onClose={() => {
            setShowPortfolioEditor(false);
            setEditingItem(null);
          }}
          onSave={handleSavePortfolioItem}
          existingItem={editingItem}
          userId={userId}
        />
      )}
    </div>
  );
}


