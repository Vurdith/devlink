import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { smartDiscoveryEngine } from "@/lib/smart-discovery-engine";
import { responseCache } from "@/lib/cache";
import { processScheduledPosts } from "@/app/api/posts/process-scheduled/route";

export async function GET(request: NextRequest) {
  try {
    // Process scheduled posts automatically when feed is loaded
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Processing scheduled posts in feed API...');
    }
    const processed = await processScheduledPosts();
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Processed ${processed} scheduled posts`);
    }
    
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Cap at 50
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate cache key for this pagination
    const cacheKey = `feed:posts:${limit}:${offset}`;

    // Fetch posts with pagination - OPTIMIZED: Use cache to avoid repeated DB hits
    const posts = await responseCache.getOrSet(cacheKey, async () => {
      return await prisma.post.findMany({
        where: { 
          replyToId: null, // Only main posts, no replies
          // Exclude scheduled future posts from general feeds
          OR: [
            { isScheduled: false },
            { isScheduled: true, scheduledFor: { lte: new Date() } }
          ]
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: {
              profile: true
            }
          },
          media: {
            select: {
              id: true,
              mediaUrl: true,
              mediaType: true,
              order: true
            }
          },
          poll: {
            include: {
              options: {
                include: {
                  votes: {
                    select: { id: true }
                  }
                }
              }
            }
          },
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
    });

    // Get user engagement data for algorithm - OPTIMIZED: Single query instead of N+1
    const userIds = [...new Set(posts.map(post => post.userId))];
    const userEngagements = new Map();
    
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

      // Calculate engagement for each user
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

        userEngagements.set(user.id, {
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

    // Get following list for personalized feed
    let followingIds: string[] = [];
    if (currentUserId) {
      const following = await prisma.follower.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
      });
      followingIds = following.map(f => f.followingId);
    }

    // Transform posts to match algorithm interface
    const transformedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.userId,
      location: post.location,
      embedUrls: post.embedUrls ? (typeof post.embedUrls === 'string' ? JSON.parse(post.embedUrls) : post.embedUrls) : null,
      isScheduled: post.isScheduled,
      scheduledFor: post.scheduledFor,
      user: {
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        profile: {
          avatarUrl: post.user.profile?.avatarUrl,
          bannerUrl: post.user.profile?.bannerUrl,
          profileType: post.user.profile?.profileType || 'Developer',
          verified: post.user.profile?.verified || false,
          bio: post.user.profile?.bio,
          website: post.user.profile?.website,
          location: post.user.profile?.location,
          createdAt: post.user.profile?.createdAt || post.user.createdAt
        },
        _count: {
          followers: userEngagements.get(post.userId)?.followerCount || 0,
          following: userEngagements.get(post.userId)?.followingCount || 0
        }
      },
      likes: post.likes,
      reposts: post.reposts,
      replies: post.replies,
      views: post.views.map(view => ({
        id: view.id,
        userId: view.userId || '',
        createdAt: view.viewedAt
      })), // Transform views to match algorithm interface
      isPinned: post.isPinned,
      isSlideshow: post.isSlideshow,
      media: post.media,
      poll: post.poll ? {
        id: post.poll.id,
        totalVotes: post.poll.options.reduce((sum, option) => sum + option.votes.length, 0),
        expiresAt: post.poll.expiresAt || new Date()
      } : undefined
    }));

    // Get mutual follows for network diversity calculation
    let mutualFollows: string[] = [];
    if (currentUserId && followingIds.length > 0) {
      const mutualFollowData = await prisma.follower.findMany({
        where: { 
          followerId: { in: followingIds },
          followingId: currentUserId
        },
        select: { followerId: true }
      });
      mutualFollows = mutualFollowData.map(f => f.followerId);
    }

    // Apply Smart Discovery Engine algorithm
    const rankedPosts = smartDiscoveryEngine.getPersonalizedFeed(
      transformedPosts,
      currentUserId || '',
      userEngagements,
      followingIds,
      mutualFollows
    );

    // Debug logging to see scores (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ALGORITHM DEBUG:');
      console.log('📊 Current weights:', smartDiscoveryEngine.getConfig().engagementWeights);
      console.log('📈 Top 3 posts with scores:');
      rankedPosts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. "${post.content}" - Score: ${post.score?.toFixed(2) || 'N/A'}`);
        console.log(`   Engagement: ${post.likes?.length || 0} likes, ${post.reposts?.length || 0} reposts, ${post.replies?.length || 0} replies, ${post.views?.length || 0} views`);
      });
    }

    // Apply pagination to globally ranked posts (like Twitter)
    const finalPosts = rankedPosts.slice(offset, offset + limit).map(post => ({
      ...post,
      views: post.views.length // Convert array back to count for frontend
    }));

    // Calculate algorithm metadata
    const algorithmMetadata = {
      algorithm: 'personalized',
      totalPosts: posts.length,
      rankedPosts: finalPosts.length,
      weights: smartDiscoveryEngine.getConfig(),
      userEngagements: userEngagements.size,
      followingCount: followingIds.length
    };

    return NextResponse.json({
      posts: finalPosts,
      metadata: algorithmMetadata,
      pagination: {
        limit,
        offset,
        hasMore: posts.length > limit
      }
    });

  } catch (error) {
    console.error('Error in feed algorithm API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch algorithmic feed' },
      { status: 500 }
    );
  }
}

// POST endpoint to update algorithm weights (for A/B testing)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weights } = body;

    if (!weights || typeof weights !== 'object') {
      return NextResponse.json(
        { error: 'Invalid weights provided' },
        { status: 400 }
      );
    }

    // Update algorithm weights
    smartDiscoveryEngine.updateConfig(weights);

    return NextResponse.json({
      message: 'Algorithm weights updated successfully',
      newWeights: smartDiscoveryEngine.getConfig()
    });

  } catch (error) {
    console.error('Error updating algorithm weights:', error);
    return NextResponse.json(
      { error: 'Failed to update algorithm weights' },
      { status: 500 }
    );
  }
}
