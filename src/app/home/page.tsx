import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchHomeFeedPosts } from "@/server/feed/fetch-home-feed";
import { rankPosts, type RankablePost } from "@/lib/ranking/devlink-ranking";
import { buildRankablePost } from "@/lib/ranking/ranking-transforms";

// Cache for 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  // Fetch session and posts in parallel
  const [session, posts] = await Promise.all([
    getServerSession(authOptions),
    fetchHomeFeedPosts(30)
  ]);

  // Redirect new OAuth users to set password - but verify against DB first
  // (JWT token might be stale if user already set password)
  if ((session?.user as any)?.needsPassword) {
    const userId = (session?.user as any)?.id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });
      // Only redirect if they actually don't have a password
      if (!user?.password) {
        redirect("/complete-signup");
      }
    }
  }

  const currentUserId = (session?.user as any)?.id;
  const postIds = posts.map(p => p.id);
  
  // Get poll IDs for vote fetching
  const pollIds = posts
    .filter(p => p.poll)
    .map(p => p.poll?.id)
    .filter((id): id is string => !!id);

  // Fetch ALL user interaction data in parallel (only if logged in)
  const [userLikes, userReposts, userSaves, userVotes] = currentUserId ? await Promise.all([
    prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }),
    prisma.postRepost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }),
    prisma.savedPost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }),
    pollIds.length > 0 ? prisma.pollVote.findMany({
      where: { pollId: { in: pollIds }, userId: currentUserId },
      select: { pollId: true, optionId: true }
    }) : Promise.resolve([])
  ]) : [[], [], [], []];

  // Build lookup sets/maps
  const likedPostIds = new Set(userLikes.map(l => l.postId));
  const repostedPostIds = new Set(userReposts.map(r => r.postId));
  const savedPostIds = new Set(userSaves.map(s => s.postId));
  
  const userVotesMap = new Map<string, string[]>();
  userVotes.forEach(vote => {
    if (!userVotesMap.has(vote.pollId)) {
      userVotesMap.set(vote.pollId, []);
    }
    userVotesMap.get(vote.pollId)!.push(vote.optionId);
  });

  // RANK POSTS like X.com
  const rankablePosts: RankablePost[] = posts.map(buildRankablePost);
  const rankingResult = rankPosts(rankablePosts);
  
  // Create post lookup map
  const postMap = new Map(posts.map(post => [post.id, post]));
  
  // Get ranked posts in order
  const rankedPosts = rankingResult.orderedPostIds
    .map(id => postMap.get(id))
    .filter(Boolean) as typeof posts;

  // Transform posts with engagement data and poll votes
  const postsWithViewCounts = rankedPosts.map(post => {
    // Transform poll with user's vote selections
    let transformedPoll = undefined;
    if (post.poll) {
      const userVotedOptionIds = userVotesMap.get(post.poll.id) || [];
      transformedPoll = {
        id: post.poll.id,
        question: post.poll.question,
        options: post.poll.options?.map((opt: { id: string; text: string; votes?: unknown[] }) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes?.length || 0,
          isSelected: userVotedOptionIds.includes(opt.id)
        })) || [],
        totalVotes: post.poll.options?.reduce((sum: number, opt: { votes?: unknown[] }) => sum + (opt.votes?.length || 0), 0) || 0,
        isMultiple: post.poll.isMultiple,
        expiresAt: post.poll.expiresAt
      };
    }

    return {
      ...post,
      views: post.views || 0,
      isLiked: likedPostIds.has(post.id),
      isReposted: repostedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
      poll: transformedPoll
    };
  });

  // Get user profile if logged in
  const currentUserProfile = session?.user?.username 
    ? await prisma.user.findUnique({
        where: { username: session.user.username },
        select: { 
          id: true,
          username: true,
          name: true,
          profile: { 
            select: { 
              avatarUrl: true,
              bannerUrl: true,
              profileType: true,
              verified: true,
              bio: true,
              website: true,
              location: true,
            } 
          },
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      }) 
    : null;

  return (
    <div className="min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedHomeContent 
          session={session}
          currentUserProfile={currentUserProfile as any}
          postsWithViewCounts={postsWithViewCounts as any}
        />
      </div>
    </div>
  );
}
