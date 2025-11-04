import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { smartDiscoveryEngine } from "@/lib/smart-discovery-engine";
import { processScheduledPosts } from "@/app/api/posts/process-scheduled/route";

export default async function HomePage() {
  // Process scheduled posts automatically when home page is loaded
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Processing scheduled posts in home page...');
  }
  const processed = await processScheduledPosts();
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Processed ${processed} scheduled posts`);
  }
  
  const session = await getServerSession(authOptions);
  const currentUserProfile = session?.user?.username ? await prisma.user.findUnique({
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
          location: true
        } 
      },
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  }) : null;

  // Fetch posts and apply algorithm directly
  const posts = await prisma.post.findMany({
    where: { replyToId: null },
    include: {
      user: {
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
              createdAt: true
            }
          },
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        }
      },
      likes: true,
      reposts: true,
      savedBy: true,
      media: {
        orderBy: { order: 'asc' }
      },
      poll: {
        include: {
          options: {
            include: {
              votes: true
            }
          }
        }
      },
      replies: {
        include: {
          user: {
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
                  location: true
                }
              },
              _count: {
                select: {
                  followers: true,
                  following: true
                }
              }
            }
          }
        }
      },
      views: {
        select: {
          id: true,
          userId: true,
          viewedAt: true
        }
      },
      _count: {
        select: {
          views: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Get more posts for algorithm to work with
  });

  // Transform posts for algorithm
  const transformedPosts = posts.map(post => ({
    ...post,
    views: post.views.map(view => ({
      ...view,
      createdAt: view.viewedAt
    })),
    poll: post.poll ? {
      id: post.poll.id,
      question: post.poll.question,
      options: post.poll.options || [],
      totalVotes: post.poll.options?.reduce((sum, option) => sum + (option.votes?.length || 0), 0) || 0,
      isMultiple: post.poll.isMultiple,
      expiresAt: post.poll.expiresAt
    } : undefined
  }));
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Transformed ${transformedPosts.length} posts`);
  }

  // Apply algorithm if user is logged in
  let rankedPosts = transformedPosts;
  if (session?.user?.id) {
    try {
      // Get user's following list
      const following = await prisma.follower.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      });
      const followingIds = following.map(f => f.followingId);

      // Get mutual follows
      const mutualFollowData = await prisma.follower.findMany({
        where: {
          followerId: { in: followingIds },
          followingId: session.user.id
        },
        select: { followerId: true }
      });
      const mutualFollows = mutualFollowData.map(f => f.followerId);

      // Get user engagement data - OPTIMIZED: Batch fetch all user data
      const userIds = [...new Set(posts.map(post => post.userId))];
      const userEngagements = new Map();
      
      if (userIds.length > 0) {
        // Batch fetch all users with their engagement data
        const usersWithEngagement = await prisma.user.findMany({
          where: { id: { in: userIds } },
          include: {
            profile: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true
              }
            },
            posts: {
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
            }
          }
        });

        // Calculate engagement for each user
        usersWithEngagement.forEach(user => {
          const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
          const totalReposts = user.posts.reduce((sum, post) => sum + post._count.reposts, 0);
          const totalReplies = user.posts.reduce((sum, post) => sum + post._count.replies, 0);
          const totalViews = user.posts.reduce((sum, post) => sum + post._count.views, 0);

          const accountAge = user.profile ? Math.floor((Date.now() - new Date(user.profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
            profileType: user.profile?.profileType || null,
            postsCount: user._count.posts,
            avgEngagementRate: user._count.posts > 0 ? (totalLikes + totalReposts + totalReplies) / user._count.posts : 0
          });
        });
      }

      // Apply algorithm (limit to 20 posts for performance)
      const postsToRank = posts.slice(0, 20);
      
      try {
        const rankedOriginalPosts = smartDiscoveryEngine.getPersonalizedFeed(
          postsToRank as any,
          session.user.id,
          userEngagements,
          followingIds,
          mutualFollows
        );
        
        // Map ranked posts back to transformed posts
        const rankedPostIds = rankedOriginalPosts.map(p => p.id);
        rankedPosts = transformedPosts
          .filter(p => rankedPostIds.includes(p.id))
          .sort((a, b) => rankedPostIds.indexOf(a.id) - rankedPostIds.indexOf(b.id));
      } catch (error) {
        console.error('Algorithm error, using chronological fallback:', error);
        // Fallback to chronological order if algorithm fails
        rankedPosts = transformedPosts.slice(0, 20);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 ALGORITHM DEBUG:');
        console.log('📊 Current weights:', smartDiscoveryEngine.getConfig().engagementWeights);
        console.log('📈 Top 3 posts:');
        rankedPosts.slice(0, 3).forEach((post, index) => {
          console.log(`${index + 1}. "${post.content}"`);
          console.log(`   Engagement: ${post.likes.length} likes, ${post.reposts.length} reposts, ${post.replies?.length || 0} replies`);
        });
      }
      
      // Algorithm performance logged above

    } catch (error) {
      console.error('Algorithm error:', error);
      // Fallback to chronological order
      rankedPosts = transformedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } else {
    // For non-logged-in users, use chronological order
    rankedPosts = transformedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Transform posts to include view counts and poll data for frontend - OPTIMIZED
  const postIds = rankedPosts.slice(0, 50).map(post => post.id);
  
  // Batch fetch view counts for all posts
  const viewCounts = await prisma.postView.groupBy({
    by: ['postId'],
    where: { postId: { in: postIds } },
    _count: { postId: true }
  });
  
  const viewCountMap = new Map(viewCounts.map(vc => [vc.postId, vc._count.postId]));
  
  // Batch fetch user votes for polls if user is logged in
  const pollIds = rankedPosts.slice(0, 50).filter(post => post.poll).map(post => post.poll?.id).filter((id): id is string => id !== undefined);
  let userVotes: any[] = [];
  if (session?.user?.id && pollIds.length > 0) {
    userVotes = await prisma.pollVote.findMany({
      where: {
        pollId: { in: pollIds },
        userId: (session.user as any).id
      },
      select: { pollId: true, optionId: true }
    });
  }
  
  const userVotesMap = new Map();
  userVotes.forEach(vote => {
    if (!userVotesMap.has(vote.pollId)) {
      userVotesMap.set(vote.pollId, []);
    }
    userVotesMap.get(vote.pollId).push(vote.optionId);
  });

  const postsWithViewCounts = rankedPosts.slice(0, 50).map(post => {
    const viewCount = viewCountMap.get(post.id) || 0;

    // Transform poll data to include user vote status and vote counts
    let transformedPoll = null;
    if (post.poll && post.poll.options) {
      const userVotedOptionIds = userVotesMap.get(post.poll.id) || [];

      transformedPoll = {
        ...post.poll,
        options: post.poll.options.map(option => ({
          ...option,
          voteCount: option.votes?.length || 0,
          userVoted: userVotedOptionIds.includes(option.id)
        }))
      };
    }
    
    const transformedPost = {
      ...post,
      views: viewCount,
      poll: transformedPoll
    };
    
    return transformedPost as any;
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