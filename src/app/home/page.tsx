import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { getUniqueViewCounts } from "@/lib/view-utils";
import { rankPosts, type RankablePost, type RankingBreakdown } from "@/lib/ranking/devlink-ranking";
import { buildRankablePost } from "@/lib/ranking/ranking-transforms";
import { fetchHomeFeedPosts } from "@/server/feed/fetch-home-feed";

// Enable ISR - revalidate every 30 seconds for fresh content
export const revalidate = 30;

export default async function HomePage() {
  // REMOVED: processScheduledPosts() - should be a cron job, not on every page load
  
  // Run session and posts fetch in parallel
  const [session, posts] = await Promise.all([
    getServerSession(authOptions),
    fetchHomeFeedPosts(30) // Reduced from 100 to 30 for faster initial load
  ]);

  // Redirect new OAuth users to set password
  if ((session?.user as any)?.needsPassword) {
    redirect("/complete-signup");
  }

  // Fetch user profile only if logged in (non-blocking for anonymous users)
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
              profileType: true,
              verified: true,
            } 
          },
        }
      }) 
    : null;

  // Quick transform - minimal processing
  const transformedPosts = posts.map(post => ({
    ...post,
    views: 0, // Will be hydrated client-side or in batch below
    poll: post.poll ? {
      id: post.poll.id,
      question: post.poll.question,
      options: post.poll.options?.map(opt => ({
        ...opt,
        votes: opt.votes?.length || 0,
        isSelected: false // Will be set below if user is logged in
      })) || [],
      totalVotes: post.poll.options?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0,
      isMultiple: post.poll.isMultiple,
      expiresAt: post.poll.expiresAt
    } : undefined
  }));

  // Build rankable posts and rank them
  const rankablePosts: RankablePost[] = posts.map(buildRankablePost);
  const rankingResult = rankPosts(rankablePosts);
  
  // Create ranked posts array
  const transformedMap = new Map(transformedPosts.map(post => [post.id, post]));
  const rankedPosts = rankingResult.orderedPostIds
    .slice(0, 30) // Only take top 30
    .map(id => {
      const basePost = transformedMap.get(id);
      if (!basePost) return null;
      return {
        ...basePost,
        rankingBreakdown: rankingResult.breakdownById[id],
      };
    })
    .filter(Boolean) as Array<(typeof transformedPosts)[number] & { rankingBreakdown: RankingBreakdown }>;

  // Batch fetch view counts, likes, reposts, saves, and poll votes in parallel
  const postIds = rankedPosts.map(post => post.id);
  const pollIds = rankedPosts
    .filter(post => post.poll)
    .map(post => post.poll?.id)
    .filter((id): id is string => !!id);

  const currentUserId = (session?.user as any)?.id;

  const [viewCountMap, userLikes, userReposts, userSaves, userVotes] = await Promise.all([
    getUniqueViewCounts(postIds),
    // User's likes
    currentUserId 
      ? prisma.postLike.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true }
        })
      : Promise.resolve([]),
    // User's reposts
    currentUserId
      ? prisma.postRepost.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true }
        })
      : Promise.resolve([]),
    // User's saves
    currentUserId
      ? prisma.savedPost.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true }
        })
      : Promise.resolve([]),
    // User's poll votes
    currentUserId && pollIds.length > 0
      ? prisma.pollVote.findMany({
          where: {
            pollId: { in: pollIds },
            userId: currentUserId
          },
          select: { pollId: true, optionId: true }
        })
      : Promise.resolve([])
  ]);

  // Build lookup maps
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

  // Final transform with view counts, user interactions, and vote status
  const postsWithViewCounts = rankedPosts.map(post => {
    const viewCount = viewCountMap.get(post.id) || 0;
    
    let transformedPoll = post.poll;
    if (post.poll) {
      const userVotedOptionIds = userVotesMap.get(post.poll.id) || [];
      transformedPoll = {
        ...post.poll,
        options: post.poll.options.map((option: any) => ({
          ...option,
          isSelected: userVotedOptionIds.includes(option.id)
        }))
      };
    }
    
    return {
      ...post,
      views: viewCount,
      poll: transformedPoll,
      // User interaction flags
      isLiked: likedPostIds.has(post.id),
      isReposted: repostedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
    } as any;
  });

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
