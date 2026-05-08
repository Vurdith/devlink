import { getAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchHomeFeedPosts } from "@/server/feed/fetch-home-feed";
import { rankHomeFeedPosts } from "@/server/feed/rank-home-feed";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";

// Cache page for 30 seconds - engagement state is fetched client-side
export const revalidate = 30;
const FEED_CANDIDATE_LIMIT = 120;
const FEED_RENDER_LIMIT = 30;

export default async function HomePage() {
  
  // Fetch session and posts in parallel (first batch)
  const [session, posts] = await Promise.all([
    getAuthSession(),
    fetchHomeFeedPosts(FEED_CANDIDATE_LIMIT)
  ]);

  // Redirect new OAuth users to set password
  if (session?.user?.needsPassword) {
    const userId = session?.user?.id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });
      if (!user?.password) {
        redirect("/complete-signup");
      }
    }
  }

  const currentUserId = session?.user?.id;
  const username = session?.user?.username;
  
  // Early return for no posts - skip all the processing
  if (posts.length === 0) {
    // Fetch just the user profile if logged in
    const currentUserProfile = username 
      ? await prisma.user.findUnique({
          where: { username },
          select: { 
            id: true, username: true, name: true,
            profile: { select: { avatarUrl: true, bannerUrl: true, profileType: true, verified: true, bio: true, website: true, location: true } },
            _count: { select: { followers: true, following: true } }
          }
        }) 
      : null;
    
    return (
      <div className="min-h-screen pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedHomeContent 
            session={session}
          currentUserProfile={currentUserProfile}
          postsWithViewCounts={[]}
        />
        </div>
      </div>
    );
  }

  // Rank a larger candidate set, then trim to the render size.
  const rankedPosts = (await rankHomeFeedPosts(posts)).slice(0, FEED_RENDER_LIMIT);
  const [engagementSummary, currentUserProfile] = await Promise.all([
    fetchPostEngagementSummary(
      rankedPosts.map((post) => post.id),
      currentUserId,
      getPostPollIds(rankedPosts)
    ),
    username ? prisma.user.findUnique({
      where: { username },
      select: { 
        id: true, username: true, name: true,
        profile: { select: { avatarUrl: true, bannerUrl: true, profileType: true, verified: true, bio: true, website: true, location: true } },
        _count: { select: { followers: true, following: true } }
      }
    }) : Promise.resolve(null)
  ]);

  const postsWithViewCounts = rankedPosts.map((post) =>
    attachPostEngagement(post, engagementSummary)
  );

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
