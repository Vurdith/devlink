"use client";
import { useState, useEffect } from "react";
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
  const { toast } = useToast();

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

  useEffect(() => {
    if (activeTab === "portfolio") {
      fetchPortfolio();
    } else {
      fetchPosts(activeTab);
    }
  }, [activeTab, userId]);

  const fetchPosts = async (tabType: TabType) => {
    setLoading(true);
    try {
      let endpoint = `/api/posts`;
      let params = new URLSearchParams();
      
      switch (tabType) {
        case "posts":
          params.append("userId", userId);
          break;
        case "reposts":
          endpoint = `/api/users/${userId}/reposts`;
          break;
        case "liked":
          endpoint = `/api/users/${userId}/liked`;
          break;
        case "replies":
          endpoint = `/api/users/${userId}/replies`;
          break;
        case "saved":
          endpoint = `/api/posts/save`;
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

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (tabType === "saved") {
          setPosts(data.savedPosts?.map((saved: any) => saved.post) || []);
        } else {
          setPosts(data.posts || data);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${tabType}:`, error);
    } finally {
      setLoading(false);
    }
  };

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
          <PostFeed posts={[reply]} currentUserId={currentUserId} showNavigationArrow={false} hidePinnedIndicator={false} />
        </div>
      </div>
    );
  };

  // Check if current user can see private tabs
  const canSeePrivateTabs = currentUserId === userId;

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-purple-500/20 mb-6 overflow-x-auto glass rounded-t-2xl p-2">
        {tabs.map((tab) => {
          // Hide private tabs if not the owner
          if (tab.private && !canSeePrivateTabs) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative flex-shrink-0 ${
                activeTab === tab.id
                  ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="flex items-center justify-center">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : activeTab === "portfolio" ? (
          <>
            {/* Portfolio Header with Add Button */}
            {isOwner && (
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                  {portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'}
                </h3>
                <Button 
                  onClick={() => {
                    setEditingItem(null);
                    setShowPortfolioEditor(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Item
                </Button>
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
            ) : (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">
                  {isOwner ? "No portfolio items yet" : "No public portfolio items"}
                </p>
                <p className="text-sm">
                  {isOwner 
                    ? "Showcase your work, projects, and achievements here." 
                    : "This user hasn't shared their portfolio yet."}
                </p>
              </div>
            )}
          </>
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
          </div>
        ) : posts.length > 0 ? (
          <PostFeed posts={posts} currentUserId={currentUserId} hidePinnedIndicator={false} />
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


