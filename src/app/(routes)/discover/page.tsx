import { Suspense } from "react";
import { getAuthSession } from "@/server/auth";
import { fetchDiscoverUsers, getFollowingStatus } from "@/server/discover/fetch-discover-users";
import { DiscoverClient } from "./discover-client";

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

// Loading skeleton shown during streaming
function DiscoverSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden glass-soft rounded-2xl border border-white/10 p-4 sm:p-6">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse" />
      </div>
      <div className="relative overflow-hidden glass-soft rounded-2xl border border-white/10 p-2 flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative overflow-hidden glass-soft border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
            <div className="h-24 sm:h-28 w-full bg-white/5" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 border-4 border-[var(--background)]" />
                  <div className="min-w-0">
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-white/10 rounded-xl" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-24 bg-white/10 rounded-lg" />
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full bg-white/10 rounded" />
                <div className="h-3 w-4/5 bg-white/10 rounded" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-3 w-28 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Server Component that fetches initial data
async function DiscoverContent() {
  // Fetch data in parallel
  const [session, initialData] = await Promise.all([
    getAuthSession(),
    fetchDiscoverUsers("all"),
  ]);

  // Get following status if logged in
  let followingSet = new Set<string>();
  if (session?.user?.id && initialData.users.length > 0) {
    followingSet = await getFollowingStatus(
      session.user.id,
      initialData.users.map((u) => u.id)
    );
  }

  // Add isFollowing to users
  const usersWithFollowing = initialData.users.map((user) => ({
    ...user,
    isFollowing: followingSet.has(user.id),
  }));

  return (
    <DiscoverClient
      initialUsers={usersWithFollowing}
      initialNextCursor={initialData.nextCursor}
      initialHasMore={initialData.hasMore}
      currentUserId={session?.user?.id}
    />
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverContent />
    </Suspense>
  );
}
