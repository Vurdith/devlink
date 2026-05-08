"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { PortfolioEditor } from "@/components/portfolio/PortfolioEditor";
import { useToast } from "@/hooks/useToast";
import type { PortfolioItem } from "@/types/api";
import { ProfileTabNavigation } from "./ProfileTabNavigation";
import { ProfileTabError, ProfileTabLoadingSkeleton } from "./ProfileTabFeedback";
import { ProfileAboutTab } from "./ProfileAboutTab";
import { ProfilePortfolioTab } from "./ProfilePortfolioTab";
import { ProfilePostsTab } from "./ProfilePostsTab";
import { type UserSkill } from "./ExpandableSkillCard";
import { getProfileTabs } from "./profile-tab-config";
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

  const tabs = getProfileTabs(Boolean(hasAboutContent));

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

  const fetchPortfolio = useCallback(async () => {
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
    } catch {
    } finally {
      setLoading(false);
    }
  }, [isOwner, userId]);

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
  }, [activeTab, userId, fetchPosts, fetchPortfolio]);

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
          <ProfileTabLoadingSkeleton />
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
          <ProfileTabError activeTab={activeTab} error={error} />
        ) : activeTab === "reviews" ? (
          <ReviewsSection
            targetUserId={userId}
            targetUsername={username}
            currentUserId={currentUserId}
            canReview={true}
          />
        ) : (
          <ProfilePostsTab
            activeTab={activeTab}
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
            emptyIcon={renderEmptyIcon()}
          />
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
