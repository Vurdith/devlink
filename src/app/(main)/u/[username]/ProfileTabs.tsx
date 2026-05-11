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
import {
  PROFILE_POST_TABS,
  buildProfileTabRequest,
  getProfileTabCacheKey,
  isEngagementProfileTab,
  isProfilePostTab,
  readProfileTabPosts,
  type ProfilePostTab,
} from "./profile-tab-data";
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
  initialTab?: TabType;
}

const tabIntros: Record<TabType, { eyebrow: string; title: string; description: string }> = {
  about: {
    eyebrow: "About",
    title: "Work focus and contact details",
    description: "Skills, rates, links, and reply expectations this profile chose to publish.",
  },
  posts: {
    eyebrow: "Activity",
    title: "Recent posts",
    description: "Original updates and project notes from this profile.",
  },
  replies: {
    eyebrow: "Conversation",
    title: "Replies",
    description: "Where this profile joins technical discussions and community threads.",
  },
  reposts: {
    eyebrow: "Shared",
    title: "Reposts",
    description: "Work, ideas, and updates this profile has chosen to amplify.",
  },
  liked: {
    eyebrow: "Liked",
    title: "Liked posts",
    description: "Posts this profile has marked as useful or interesting.",
  },
  saved: {
    eyebrow: "Saved",
    title: "Saved posts",
    description: "Your saved reference posts are visible only to you.",
  },
  portfolio: {
    eyebrow: "Portfolio",
    title: "Published work",
    description: "Projects with enough context to judge the role, result, and fit.",
  },
  reviews: {
    eyebrow: "Reviews",
    title: "Reviews",
    description: "Feedback left by people who have worked with this profile.",
  },
};

const tabDataCache = new Map<string, { data: TabPost[]; timestamp: number }>();
const CACHE_TTL = 30000;

export function ProfileTabs({
  username,
  currentUserId,
  userId,
  skills = [],
  profileData = {},
  session,
  initialTab,
}: ProfileTabsProps) {
  const hasAboutContent = Boolean(
    skills.length > 0 ||
      profileData.location ||
      profileData.website
  );
  const isOwner = currentUserId === userId;
  const visibleInitialTab = initialTab === "saved" && !isOwner ? undefined : initialTab;
  const [activeTab, setActiveTab] = useState<TabType>(
    visibleInitialTab ?? (hasAboutContent ? "about" : "posts")
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
  const tabs = getProfileTabs(Boolean(hasAboutContent));

  const fetchPosts = useCallback(
    async (
      tabType: ProfilePostTab,
      page: number = 1,
      append: boolean = false,
      forceRefresh: boolean = false
    ) => {
      const cacheKey = getProfileTabCacheKey(userId, tabType, page);
      const isEngagementTab = isEngagementProfileTab(tabType);

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
        const limit = POSTS_PER_PAGE;
        const endpoint = buildProfileTabRequest({ tab: tabType, userId, page, limit });

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to load ${tabType}`);
        }

        const data = await response.json();
        const newPosts = readProfileTabPosts(tabType, data);

        tabDataCache.set(cacheKey, { data: newPosts, timestamp: Date.now() });

        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setHasMore(newPosts.length === limit);
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
      const invalidateCacheFor = (tab: ProfilePostTab) => {
        const cacheKey = getProfileTabCacheKey(userId, tab, 1);
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

      if (isEngagementProfileTab(activeTab)) {
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
    } else if (isProfilePostTab(activeTab)) {
      fetchPosts(activeTab, 1, false, false);
    } else {
      setLoading(false);
      setError(null);
      setPosts([]);
      setHasMore(false);
    }
  }, [activeTab, userId, fetchPosts, fetchPortfolio]);

  useEffect(() => {
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { post, action, liked, reposted, saved } = event.detail;

      const clearCaches = () => {
        PROFILE_POST_TABS.forEach((tab) => {
          for (let page = 1; page <= 10; page++) {
            tabDataCache.delete(getProfileTabCacheKey(userId, tab, page));
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
          isEngagementProfileTab(activeTab)
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
  const activeIntro = tabIntros[activeTab];

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
    <div className="mt-4 px-3 sm:mt-7 sm:px-0">
      <ProfileTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canSeePrivateTabs={canSeePrivateTabs}
      />

      {activeTab !== "about" ? (
        <section className="mb-4 grid gap-3 border-b border-white/[0.06] px-1 pb-4 sm:mb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              {activeIntro.eyebrow}
            </p>
            <h2 className="mt-1 font-[var(--font-space-grotesk)] text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {activeIntro.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              {activeIntro.description}
            </p>
          </div>
          {activeTab === "portfolio" && portfolioItems.length > 0 ? (
            <span className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/72">
              {portfolioItems.length} {portfolioItems.length === 1 ? "case study" : "case studies"}
            </span>
          ) : null}
        </section>
      ) : null}

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
              if (isProfilePostTab(activeTab)) {
                fetchPosts(activeTab, currentPage + 1, true);
              }
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
