import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { fetchDiscoverUsers, getFollowingStatus } from "@/server/discover/fetch-discover-users";
import { DiscoverClient } from "./discover-client";

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

// Loading skeleton shown during streaming
function DiscoverSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-8">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-4" />
        <div className="h-5 w-96 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#0d0d12] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
            <div className="h-16 sm:h-20 bg-white/5" />
            <div className="p-3 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 -mt-10 sm:-mt-12 border-3 sm:border-4 border-[var(--background)]" />
              </div>
              <div className="h-4 sm:h-5 w-28 sm:w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/10 rounded mb-3" />
              <div className="h-5 sm:h-6 w-20 sm:w-24 bg-white/10 rounded mb-3" />
              <div className="h-3 sm:h-4 w-full bg-white/10 rounded" />
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
    getServerSession(authOptions),
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
