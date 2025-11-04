import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { SmartDiscoveryEngine } from "@/lib/smart-discovery-engine";
import { PostAnalytics } from "@/components/analytics/PostAnalytics";
import { notFound, redirect } from "next/navigation";

interface AnalyticsPageProps {
  params: {
    postId: string;
  };
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { postId } = params;

  // Fetch the specific post with all related data
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        include: {
          profile: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      },
      media: true,
      poll: {
        include: {
          options: true,
        },
      },
      views: true,
      likes: true,
      reposts: true,
      replies: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Check if user owns this post
  if (post.userId !== session.user.id) {
    redirect("/");
  }

  // Fetch all posts for ranking context (EXACT same as feed API)
  const allPosts = await prisma.post.findMany({
    where: { 
      replyToId: null, // Only main posts, no replies
      // Exclude scheduled future posts from general feeds
      OR: [
        { isScheduled: false },
        { isScheduled: true, scheduledFor: { lte: new Date() } }
      ]
    },
    include: {
      user: {
        include: {
          profile: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      },
      media: true,
      poll: {
        include: {
          options: true,
        },
      },
      views: true,
      likes: true,
      reposts: true,
      replies: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform post data to match algorithm format
  const transformedPost = {
    ...post,
    accountAge: post.user.profile?.createdAt 
      ? Math.floor((Date.now() - new Date(post.user.profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    isVerified: post.user.profile?.verified || false,
    profileType: post.user.profile?.profileType || "DEVELOPER",
    followerCount: post.user._count.followers,
    followingCount: post.user._count.following,
    engagementCount: post.likes.length + post.reposts.length + post.replies.length + post.views.length,
    viewCount: post.views.length,
    hasMedia: post.media.length > 0,
    hasPoll: !!post.poll,
    isOriginal: true, // Assume all posts are original for now
    contentLength: post.content?.length || 0,
    hashtagCount: (post.content?.match(/#\w+/g) || []).length,
    mentionCount: (post.content?.match(/@\w+/g) || []).length,
    questionCount: (post.content?.match(/\?/g) || []).length,
  };

  // Calculate individual component scores for display
  // Create a mock user engagement object for the current user
  const userEngagement = {
    userId: session.user.id,
    totalLikes: 0,
    totalReposts: 0,
    totalReplies: 0,
    totalViews: 0,
    followerCount: post.user._count.followers,
    followingCount: post.user._count.following,
    accountAge: transformedPost.accountAge,
    isVerified: transformedPost.isVerified,
    profileType: transformedPost.profileType,
    postsCount: 0,
    avgEngagementRate: 0,
  };

  // Calculate post score using the algorithm with same parameters as ranking
  const smartDiscoveryEngine = new SmartDiscoveryEngine();
  
  // Create userEngagement map like the ranking algorithm uses
  const userEngagements = new Map();
  userEngagements.set(post.userId, userEngagement);
  
  // Cast post to Post type for algorithm (profile is guaranteed to exist or we provide default)
  const postForAlgorithm = {
    ...post,
    user: {
      ...post.user,
      profile: post.user.profile || {
        profileType: 'user',
        verified: false,
        createdAt: post.user.createdAt || new Date(),
      }
    }
  } as any;
  
  const postScore = smartDiscoveryEngine.calculatePostScore(postForAlgorithm, session.user.id, userEngagements.get(post.userId));

  // Get detailed breakdowns
  const contentBreakdown = smartDiscoveryEngine.getContentQualityBreakdown(postForAlgorithm);

  // Calculate component scores for display using individual algorithm methods
  const networkMultiplier = transformedPost.userId === session.user.id ? 1.5 : 1.0;
  const verifiedMultiplier = transformedPost.isVerified ? 1.5 : 1.0;

  // Calculate ranking
  const allTransformedPosts = allPosts.map((p: any) => ({
    ...p,
    user: {
      ...p.user,
      profile: p.user.profile || {
        profileType: 'user',
        verified: false,
        createdAt: p.user.createdAt || new Date(),
      }
    },
    accountAge: p.user.profile?.createdAt 
      ? Math.floor((Date.now() - new Date(p.user.profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    isVerified: p.user.profile?.verified || false,
    profileType: p.user.profile?.profileType || "DEVELOPER",
    followerCount: p.user._count.followers,
    followingCount: p.user._count.following,
    engagementCount: p.likes.length + p.reposts.length + p.replies.length + p.views.length,
    viewCount: p.views.length,
    hasMedia: p.media.length > 0,
    hasPoll: !!p.poll,
    isOriginal: true,
    contentLength: p.content?.length || 0,
    hashtagCount: (p.content?.match(/#\w+/g) || []).length,
    mentionCount: (p.content?.match(/@\w+/g) || []).length,
    questionCount: (p.content?.match(/\?/g) || []).length,
  })) as any;

  // Use the EXACT same logic as the feed API
  // Get following list for personalized feed (same as feed API)
  let followingIds: string[] = [];
  if (session.user.id) {
    const following = await prisma.follower.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true }
    });
    followingIds = following.map(f => f.followingId);
  }

  // Get mutual follows for network diversity calculation (same as feed API)
  let mutualFollows: string[] = [];
  if (session.user.id && followingIds.length > 0) {
    const mutualFollowData = await prisma.follower.findMany({
      where: { 
        followerId: { in: followingIds },
        followingId: session.user.id
      },
      select: { followerId: true }
    });
    mutualFollows = mutualFollowData.map(f => f.followerId);
  }

  // Get user engagement data (same as feed API)
  const userIds: string[] = Array.from(new Set(allTransformedPosts.map((post: any) => post.userId as string)));
  const userEngagementsMap = new Map();
  
  if (userIds.length > 0) {
    // Batch fetch all users with their profiles and follower counts
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });

    // Batch fetch all user posts with engagement counts
    const userPosts = await prisma.post.findMany({
      where: { userId: { in: userIds } },
      include: {
        _count: {
          select: {
            likes: true,
            reposts: true,
            replies: true,
            views: true
          }
        }
      }
    });

    // Group posts by userId and calculate totals
    const postsByUser = new Map<string, typeof userPosts>();
    userPosts.forEach(post => {
      if (!postsByUser.has(post.userId)) {
        postsByUser.set(post.userId, []);
      }
      postsByUser.get(post.userId)!.push(post);
    });

    // Calculate engagement for each user (same as feed API)
    users.forEach(user => {
      const userPostsList = postsByUser.get(user.id) || [];
      const totalLikes = userPostsList.reduce((sum, post) => sum + post._count.likes, 0);
      const totalReposts = userPostsList.reduce((sum, post) => sum + post._count.reposts, 0);
      const totalReplies = userPostsList.reduce((sum, post) => sum + post._count.replies, 0);
      const totalViews = userPostsList.reduce((sum, post) => sum + post._count.views, 0);

      const accountAge = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate average engagement rate
      const totalPosts = userPostsList.length;
      const avgEngagementRate = totalPosts > 0 ? (totalLikes + totalReposts + totalReplies) / totalPosts : 0;

      userEngagementsMap.set(user.id, {
        userId: user.id,
        totalLikes,
        totalReposts,
        totalReplies,
        totalViews,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        accountAge,
        isVerified: user.profile?.verified || false,
        profileType: user.profile?.profileType || 'Developer',
        postsCount: totalPosts,
        avgEngagementRate
      });
    });
  }

  // Use the EXACT same personalized feed logic as the feed API
  const rankedPosts = smartDiscoveryEngine.getPersonalizedFeed(
    allTransformedPosts,
    session.user.id,
    userEngagementsMap,
    followingIds,
    mutualFollows
  );
  
  // Debug logging to see what's happening
  console.log('🔍 ANALYTICS DEBUG:');
  console.log('📊 Top 3 posts in analytics:');
  rankedPosts.slice(0, 3).forEach((post, index) => {
    console.log(`${index + 1}. "${post.content}" - Score: ${post.score?.toFixed(2) || 'N/A'}`);
    console.log(`   Post ID: ${post.id}`);
    console.log(`   Current Post ID: ${postId}`);
    console.log(`   Match: ${post.id === postId}`);
  });
  
  const currentRank = rankedPosts.findIndex(p => p.id === postId) + 1;
  const totalPosts = rankedPosts.length;
  
  console.log(`🎯 Current post rank: ${currentRank} of ${totalPosts}`);

  // Calculate component scores using the algorithm's internal methods with the same post object used for the main calculation
  const temporalScore = (smartDiscoveryEngine as any).calculateTemporalScore(post);
  const engagementScore = (smartDiscoveryEngine as any).calculateEngagementQualityScore(post);
  const userDiscoveryScore = (smartDiscoveryEngine as any).calculateUserDiscoveryScore(post.user, userEngagement);
  const contentScore = (smartDiscoveryEngine as any).calculateContentQualityScore(post);
  const networkScore = (smartDiscoveryEngine as any).calculateNetworkDiversityScore(post, session.user.id);

  // Calculate the actual base score from individual components (same as algorithm)
  const actualBaseScore = temporalScore + engagementScore + userDiscoveryScore + contentScore;
  const networkAdjustedScore = actualBaseScore * networkScore;
  const expectedFinalScore = networkAdjustedScore * verifiedMultiplier;
  
  // Debug: Log the actual algorithm calculation
  console.log('Debug - Algorithm calculation:');
  console.log('Base score:', actualBaseScore);
  console.log('Network score:', networkScore);
  console.log('Network adjusted:', networkAdjustedScore);
  console.log('Verified multiplier:', verifiedMultiplier);
  console.log('Expected final:', expectedFinalScore);
  console.log('Actual postScore:', postScore);

  const componentScores = {
    temporal: temporalScore,
    engagement: engagementScore,
    userDiscovery: userDiscoveryScore,
    content: contentScore,
    network: networkScore,
    baseScore: actualBaseScore,
    networkAdjustedScore,
    verifiedMultiplier,
    expectedFinalScore,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-white">Loading analytics...</div>}>
          <PostAnalytics
            post={transformedPost as any}
            postScore={postScore}
            userEngagement={userEngagement}
            currentRank={currentRank}
            totalPosts={totalPosts}
            rankedPosts={rankedPosts}
            currentUserId={session.user.id}
            componentScores={componentScores}
            contentBreakdown={contentBreakdown}
          />
        </Suspense>
      </div>
    </div>
  );
}
