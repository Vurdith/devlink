"use client";

import { useState, useEffect, useCallback } from "react";
import { PostFeed } from "@/components/feed/PostFeed";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { PortfolioEditor } from "@/components/portfolio/PortfolioEditor";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import type { PortfolioItem } from "@/types/api";
import { ProfileTabNavigation } from "./ProfileTabNavigation";
import { ProfileAboutTab } from "./ProfileAboutTab";
import { ProfileRepliesTab, EmptyState } from "./ProfileRepliesTab";
import { ProfilePortfolioTab } from "./ProfilePortfolioTab";
import { type UserSkill } from "./ExpandableSkillCard";
import type { TabType, TabPost } from "./profile-types";

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
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  } | null;
}

const tabDataCache = new Map<string, { data: TabPost[]; timestamp: number }>();
const CACHE_TTL = 30000;
const ENGAGEMENT_TABS: readonly TabType[] = ["liked", "reposts", "saved"];

export function ProfileTabs({
  username,
  currentUserId,
  userId,
  skills = [],
  profileData = {},
  session,
}: ProfileTabsProps) {
  const hasAboutContent = skills.length > 0 || profileData.location || profileData.website;
  const [activeTab, setActiveTab] = useState<TabType>(
    hasAboutContent ? "about" : "posts"
  );
  const [posts, setPosts] = useState<TabPost[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPortfolioEditor, setShowPortfolioEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const POSTS_PER_PAGE = 20;
  const isOwner = currentUserId === userId;

  const tabs = [
    ...(hasAboutContent
      ? [
          {
            id: "about" as TabType,
            label: "About",
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
    {
      id: "posts" as TabType,
      label: "Posts",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "replies" as TabType,
      label: "Replies",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      id: "reposts" as TabType,
      label: "Reposts",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      id: "liked" as TabType,
      label: "Liked",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "saved" as TabType,
      label: "Saved",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
      private: true,
    },
    {
      id: "portfolio" as TabType,
      label: "Portfolio",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: "reviews" as TabType,
      label: "Reviews",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ];

  const fetchPosts = useCallback(
    async (
      tabType: TabType,
      page: number = 1,
      append: boolean = false,
      forceRefresh: boolean = false
    ) => {
      const cacheKey = `${userId}:${tabType}:${page}`;
      const isEngagementTab = ENGAGEMENT_TABS.includes(tabType);

      if (!forceRefresh && !append && !isEngagementTab) {
        const cached = tabDataCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setPosts(cached.data);
          setHasMore(cached.data.length === POSTS_PER_PAGE);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        let endpoint = `/api/posts`;
        const params = new URLSearchParams();
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
          let newPosts: TabPost[] = [];

          if (tabType === "saved") {
            newPosts =
              data.savedPosts?.map((saved: { post: TabPost }) => saved.post) ||
              [];
          } else {
            newPosts = data.posts || data;
          }

          tabDataCache.set(cacheKey, { data: newPosts, timestamp: Date.now() });

          if (append) {
            setPosts((prev) => [...prev, ...newPosts]);
          } else {
            setPosts(newPosts);
          }

          setHasMore(newPosts.length === limit);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load posts";
        console.error(`Error fetching ${tabType}:`, error);
        setError(errorMessage);
        toast({
          title: "Error",
          description: `Failed to load ${tabType}. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [userId, toast]
  );

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

  const handlePostUpdate = useCallback(
    (updatedPostInput: unknown) => {
      const updatedPost = updatedPostInput as TabPost;
      const invalidateCacheFor = (tab: TabType) => {
        const cacheKey = `${userId}:${tab}:1`;
        tabDataCache.delete(cacheKey);
      };

      setPosts((prevPosts) => {
        const shouldBeInTab =
          (activeTab === "liked" &&
            updatedPost.likes?.some((like) => like.userId === currentUserId)) ||
          (activeTab === "reposts" &&
            updatedPost.reposts?.some(
              (repost) => repost.userId === currentUserId
            )) ||
          (activeTab === "saved" &&
            updatedPost.savedBy?.some((saved) => saved.userId === currentUserId));

        const postExists = prevPosts.some((post) => post.id === updatedPost.id);

        if (shouldBeInTab && !postExists && currentUserId) {
          invalidateCacheFor(activeTab);
          return [updatedPost, ...prevPosts];
        }

        if (activeTab === "liked") {
          const isStillLiked = updatedPost.likes?.some(
            (like) => like.userId === currentUserId
          );
          if (!isStillLiked && currentUserId) {
            invalidateCacheFor("liked");
            return prevPosts.filter((post) => post.id !== updatedPost.id);
          }
        }
        if (activeTab === "reposts") {
          const isStillReposted = updatedPost.reposts?.some(
            (repost) => repost.userId === currentUserId
          );
          if (!isStillReposted && currentUserId) {
            invalidateCacheFor("reposts");
            return prevPosts.filter((post) => post.id !== updatedPost.id);
          }
        }
        if (activeTab === "saved") {
          const isStillSaved = updatedPost.savedBy?.some(
            (saved) => saved.userId === currentUserId
          );
          if (!isStillSaved && currentUserId) {
            invalidateCacheFor("saved");
            return prevPosts.filter((post) => post.id !== updatedPost.id);
          }
        }
        return prevPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        );
      });

      if (activeTab === "liked" || activeTab === "reposts" || activeTab === "saved") {
        setTimeout(() => {
          fetchPosts(activeTab, 1, false, true);
        }, 500);
      }
    },
    [activeTab, currentUserId, fetchPosts, userId]
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(false);

    if (activeTab === "portfolio") {
      fetchPortfolio();
    } else {
      fetchPosts(activeTab, 1, false, false);
    }
  }, [activeTab, userId, fetchPosts]);

  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post, action, liked, reposted, saved } = event.detail;

      const clearCaches = () => {
        ["posts", "reposts", "liked", "saved", "replies"].forEach((tab) => {
          for (let page = 1; page <= 10; page++) {
            tabDataCache.delete(`${userId}:${tab}:${page}`);
          }
        });
      };

      if (action === "repost") {
        clearCaches();
        if (activeTab === "reposts") {
          if (reposted === false) {
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
          }
          fetchPosts("reposts", 1, false, true);
        }
      } else if (action === "save") {
        clearCaches();
        if (activeTab === "saved") {
          if (saved === false) {
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
          }
          fetchPosts("saved", 1, false, true);
        }
      } else if (action === "like") {
        clearCaches();
        if (activeTab === "liked") {
          if (liked === false) {
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
          }
          fetchPosts("liked", 1, false, true);
        }
      } else {
        handlePostUpdate(post);
      }
    };

    window.addEventListener(
      "postEngagementUpdate",
      handleEngagementUpdate as EventListener
    );
    return () =>
      window.removeEventListener(
        "postEngagementUpdate",
        handleEngagementUpdate as EventListener
      );
  }, [handlePostUpdate, activeTab, userId, fetchPosts]);

  useEffect(() => {
    let lastVisibilityState = document.visibilityState;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        lastVisibilityState === "hidden"
      ) {
        const cacheKey = `${userId}:${activeTab}:1`;
        const cached = tabDataCache.get(cacheKey);
        const isStale = !cached || Date.now() - cached.timestamp > CACHE_TTL;

        if (
          isStale &&
          (activeTab === "liked" ||
            activeTab === "reposts" ||
            activeTab === "saved")
        ) {
          fetchPosts(activeTab, 1, false, true);
        }
      }
      lastVisibilityState = document.visibilityState;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeTab, fetchPosts, userId]);

  const handleSavePortfolioItem = (newItem: PortfolioItem) => {
    if (editingItem) {
      setPortfolioItems(
        portfolioItems.map((item) =>
          item.id === newItem.id ? newItem : item
        )
      );
      setEditingItem(null);
    } else {
      setPortfolioItems([newItem, ...portfolioItems]);
    }
    setShowPortfolioEditor(false);
  };

  const handleDeletePortfolioItem = (itemId: string) => {
    setPortfolioItems(portfolioItems.filter((item) => item.id !== itemId));
    toast({ title: "Success", description: "Portfolio item deleted" });
  };

  const handleEditPortfolioItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setShowPortfolioEditor(true);
  };

  const canSeePrivateTabs = currentUserId === userId;

  const renderEmptyIcon = () => {
    switch (activeTab) {
      case "posts":
        return (
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "replies":
        return (
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "reposts":
        return (
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      case "liked":
        return (
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case "saved":
        return (
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 sm:mt-8">
      <ProfileTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canSeePrivateTabs={canSeePrivateTabs}
      />

      <div className="min-h-[400px]">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden glass-soft rounded-xl border border-white/10 p-4"
              >
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
          <ProfileAboutTab skills={skills} profileData={profileData} />
        ) : activeTab === "portfolio" ? (
          <ProfilePortfolioTab
            portfolioItems={portfolioItems}
            isOwner={isOwner}
            skills={skills}
            onAddItem={() => {
              setEditingItem(null);
              setShowPortfolioEditor(true);
            }}
            onEditItem={handleEditPortfolioItem}
            onDeleteItem={handleDeletePortfolioItem}
          />
        ) : error ? (
          <div className="rounded-lg bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-medium text-[var(--color-accent)]">
                  Failed to load {activeTab}
                </h3>
                <p className="text-sm text-[var(--color-accent)]/80 mt-1">
                  {error}
                </p>
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
          <ProfileRepliesTab
            posts={posts}
            currentUserId={currentUserId}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={() => {
              setCurrentPage((prev) => prev + 1);
              fetchPosts(activeTab, currentPage + 1, true);
            }}
            onUpdate={handlePostUpdate}
            session={session}
          />
        ) : posts.length > 0 ? (
          <div>
            <PostFeed
              posts={posts}
              currentUserId={currentUserId}
              hidePinnedIndicator={false}
              onUpdate={handlePostUpdate}
              session={session}
            />
            {hasMore && (
              <div className="text-center pt-8">
                <Button
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1);
                    fetchPosts(activeTab, currentPage + 1, true);
                  }}
                  disabled={loading}
                  variant="secondary"
                  size="lg"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState tab={activeTab} icon={renderEmptyIcon()} />
        )}
      </div>

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

export type { TabType, TabPost };
