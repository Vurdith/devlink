import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { PostPageContent } from "./PostPageContent";
import { getUniqueViewCounts } from "@/lib/view-utils";

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;

  // Fetch post with OPTIMIZED includes - use _count instead of full arrays
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      isPinned: true,
      isSlideshow: true,
      location: true,
      embedUrls: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          createdAt: true,
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
            select: { followers: true, following: true }
          }
        }
      },
      // Use _count for engagement - NOT full arrays
      _count: {
        select: {
          likes: true,
          reposts: true,
          savedBy: true,
          replies: true
        }
      },
      media: {
        select: { id: true, mediaUrl: true, mediaType: true, order: true },
        orderBy: { order: 'asc' }
      },
      poll: {
        select: {
          id: true,
          question: true,
          expiresAt: true,
          isMultiple: true,
          options: {
            select: {
              id: true,
              text: true,
              _count: { select: { votes: true } }
            }
          }
        }
      },
      // Only get first-level replies with _count
      replies: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  profileType: true,
                  verified: true
                }
              },
              _count: { select: { followers: true, following: true } }
            }
          },
          _count: {
            select: { likes: true, reposts: true, replies: true }
          },
          media: {
            select: { id: true, mediaUrl: true, mediaType: true, order: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: "asc" },
        take: 50 // Limit replies
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: { select: { avatarUrl: true, verified: true } }
            }
          }
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  // Batch fetch ALL engagement data in parallel - single round trip
  const replyIds = post.replies.map(r => r.id);
  const allPostIds = [post.id, ...replyIds];
  
  const [
    viewCountMap,
    currentUserProfile,
    userLikes,
    userReposts,
    userSaves,
    userPollVotes
  ] = await Promise.all([
    // View counts for main post + replies
    getUniqueViewCounts(allPostIds),
    // Current user profile (for reply form)
    currentUserId ? prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        username: true,
        name: true,
        profile: { select: { avatarUrl: true } }
      }
    }) : null,
    // Current user's likes on main post + replies
    currentUserId ? prisma.postLike.findMany({
      where: { postId: { in: allPostIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    // Current user's reposts
    currentUserId ? prisma.postRepost.findMany({
      where: { postId: { in: allPostIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    // Current user's saves
    currentUserId ? prisma.savedPost.findMany({
      where: { postId: { in: allPostIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    // Current user's poll votes (if poll exists)
    currentUserId && post.poll ? prisma.pollVote.findMany({
      where: { pollId: post.poll.id, userId: currentUserId },
      select: { optionId: true }
    }) : []
  ]);

  const likedPostIds = new Set(userLikes.map(l => l.postId));
  const repostedPostIds = new Set(userReposts.map(r => r.postId));
  const savedPostIds = new Set(userSaves.map(s => s.postId));
  const votedOptionIds = new Set(userPollVotes.map(v => v.optionId));

  // Transform post
  const transformedPost = {
    ...post,
    views: viewCountMap.get(post.id) || 0,
    isLiked: likedPostIds.has(post.id),
    isReposted: repostedPostIds.has(post.id),
    isSaved: savedPostIds.has(post.id),
    // Empty arrays for compatibility
    likes: [],
    reposts: [],
    savedBy: [],
    poll: post.poll ? {
      ...post.poll,
      totalVotes: post.poll.options.reduce((sum, opt) => sum + opt._count.votes, 0),
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt._count.votes,
        isSelected: votedOptionIds.has(opt.id)
      }))
    } : null
  };

  // Transform replies
  const transformedReplies = post.replies.map(reply => ({
    ...reply,
    views: viewCountMap.get(reply.id) || 0,
    isLiked: likedPostIds.has(reply.id),
    isReposted: repostedPostIds.has(reply.id),
    isSaved: savedPostIds.has(reply.id),
    likes: [],
    reposts: [],
    savedBy: [],
    replies: Array(reply._count.replies).fill(null)
  }));

  const userProfileData = currentUserProfile ? {
    avatarUrl: currentUserProfile.profile?.avatarUrl || null,
    name: currentUserProfile.name || currentUserProfile.username || "User",
    username: currentUserProfile.username
  } : null;

  return (
    <PostPageContent 
      post={transformedPost} 
      replies={transformedReplies} 
      currentUserId={currentUserId} 
      currentUserProfile={userProfileData}
    />
  );
}
