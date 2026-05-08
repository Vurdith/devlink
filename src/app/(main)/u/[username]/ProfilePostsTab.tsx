import { Button } from "@/components/ui/Button";
import { PostFeed } from "@/components/feed/PostFeed";
import { EmptyState, ProfileRepliesTab } from "./ProfileRepliesTab";
import type { TabPost, TabType } from "./profile-types";

interface ProfilePostsTabProps {
  activeTab: TabType;
  posts: TabPost[];
  currentUserId?: string;
  hasMore: boolean;
  loading: boolean;
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  } | null;
  emptyIcon: React.ReactNode;
  onLoadMore: () => void;
  onUpdate: (updatedPostInput: unknown) => void;
}

export function ProfilePostsTab({
  activeTab,
  posts,
  currentUserId,
  hasMore,
  loading,
  session,
  emptyIcon,
  onLoadMore,
  onUpdate,
}: ProfilePostsTabProps) {
  if (activeTab === "replies" && posts.length > 0) {
    return (
      <ProfileRepliesTab
        posts={posts}
        currentUserId={currentUserId}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        onUpdate={onUpdate}
        session={session}
      />
    );
  }

  if (posts.length > 0) {
    return (
      <div>
        <PostFeed posts={posts} currentUserId={currentUserId} hidePinnedIndicator={false} onUpdate={onUpdate} session={session} />
        {hasMore && (
          <div className="text-center pt-8">
            <Button onClick={onLoadMore} disabled={loading} variant="secondary" size="lg">
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <EmptyState tab={activeTab} icon={emptyIcon} />;
}
