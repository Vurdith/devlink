import { getAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchHomeFeedCandidates, fetchHomeFeedPostDetails } from "@/server/feed/fetch-home-feed";
import { rankHomeFeedPosts } from "@/server/feed/rank-home-feed";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { fetchCurrentUserProfile, needsPasswordSetup } from "@/server/users/current-user-profile";

// Cache page for 30 seconds - engagement state is fetched client-side
export const revalidate = 30;
const FEED_CANDIDATE_LIMIT = 120;
const FEED_RENDER_LIMIT = 30;

export default async function HomePage() {
  // Fetch session and posts in parallel (first batch)
  const [session, candidates] = await Promise.all([
    getAuthSession(),
    fetchHomeFeedCandidates(FEED_CANDIDATE_LIMIT),
  ]);

  // Redirect new OAuth users to set password
  if (session?.user?.needsPassword && await needsPasswordSetup(session.user.id)) {
    redirect("/complete-signup");
  }

  const currentUserId = session?.user?.id;
  const username = session?.user?.username;

  // Rank a larger candidate set, then trim to the render size.
  const rankedCandidates = candidates.length > 0
    ? (await rankHomeFeedPosts(candidates)).slice(0, FEED_RENDER_LIMIT)
    : [];
  const rankedPosts = await fetchHomeFeedPostDetails(rankedCandidates.map((post) => post.id));

  const [engagementSummary, currentUserProfile] = await Promise.all([
    rankedPosts.length > 0
      ? fetchPostEngagementSummary(
          rankedPosts.map((post) => post.id),
          currentUserId,
          getPostPollIds(rankedPosts)
        )
      : Promise.resolve(null),
    fetchCurrentUserProfile(username),
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
        />
      </div>
    </div>
  );
}
