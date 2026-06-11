import { getAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchRankedHomeFeedPosts } from "@/server/feed/home-feed";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { fetchCurrentUserProfile, needsPasswordSetup } from "@/server/users/current-user-profile";
import { fetchSuggestedFollows } from "@/server/discover/suggested-users";

// Cache page for 30 seconds - engagement state is fetched client-side
export const revalidate = 30;

export default async function HomePage() {
  const session = await getAuthSession();
  const rankedPosts = await fetchRankedHomeFeedPosts({ currentUserId: session?.user?.id });

  // Redirect new OAuth users to set password
  if (session?.user?.needsPassword && await needsPasswordSetup(session.user.id)) {
    redirect("/complete-signup");
  }

  const currentUserId = session?.user?.id;
  const username = session?.user?.username;

  const [engagementSummary, currentUserProfile, suggestedFollows] = await Promise.all([
    rankedPosts.length > 0
      ? fetchPostEngagementSummary(
          rankedPosts.map((post) => post.id),
          currentUserId,
          getPostPollIds(rankedPosts)
        )
      : Promise.resolve(null),
    fetchCurrentUserProfile(username),
    fetchSuggestedFollows(currentUserId),
  ]);

  const postsWithViewCounts = engagementSummary
    ? rankedPosts.map((post) => attachPostEngagement(post, engagementSummary))
    : [];

  return (
    <div className="min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedHomeContent 
          session={session}
          currentUserProfile={currentUserProfile}
          postsWithViewCounts={postsWithViewCounts}
          suggestedFollows={suggestedFollows}
        />
      </div>
    </div>
  );
}
