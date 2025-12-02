import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { PostPageContent } from "./PostPageContent";

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);

  // Fetch current user's profile if authenticated
  let currentUserProfile = null;
  if (session?.user?.id) {
    const userWithProfile = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        username: true,
        name: true,
        profile: {
          select: {
            avatarUrl: true
          }
        }
      }
    });
    
    if (userWithProfile) {
      currentUserProfile = {
        avatarUrl: userWithProfile.profile?.avatarUrl || null,
        name: userWithProfile.name || userWithProfile.username || "User", // Ensure name is never null
        username: userWithProfile.username
      };
    }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
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
          },
          likes: true,
          reposts: true,
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
              },
              likes: true,
              reposts: true,
              savedBy: true,
              media: {
                orderBy: { order: 'asc' }
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
                  },
                  likes: true,
                  reposts: true,
                  savedBy: true,
                  media: {
                    orderBy: { order: 'asc' }
                  },
                  replies: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      replyTo: {
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
          },
          likes: true,
          reposts: true,
          savedBy: true,
          media: {
            orderBy: { order: 'asc' }
          },
          replies: true,
        },
      }
    },
  });

  if (!post) {
    notFound();
  }

  // Get unique account view count for the post and current user's engagement
  const currentUserId = (session?.user as any)?.id;
  
  const [allViews, userLike, userRepost, userSave] = await Promise.all([
    prisma.postView.findMany({
      where: { postId: post.id },
      select: { userId: true }
    }),
    currentUserId ? prisma.postLike.findFirst({
      where: { postId: post.id, userId: currentUserId }
    }) : Promise.resolve(null),
    currentUserId ? prisma.postRepost.findFirst({
      where: { postId: post.id, userId: currentUserId }
    }) : Promise.resolve(null),
    currentUserId ? prisma.savedPost.findFirst({
      where: { postId: post.id, userId: currentUserId }
    }) : Promise.resolve(null)
  ]);
  
  const uniqueAccountViewCount = new Set(
    allViews.filter(v => v.userId).map(v => v.userId)
  ).size;

  // Transform poll data to include user's vote status and vote counts
  let transformedPost = { 
    ...post, 
    views: uniqueAccountViewCount,
    isLiked: !!userLike,
    isReposted: !!userRepost,
    isSaved: !!userSave
  };
  if (post.poll && session?.user?.id) {
    const totalVotes = post.poll.options.reduce((sum: number, option: any) => sum + option.votes.length, 0);
    
    // Check if current user has voted on this poll
    const userVotes = await prisma.pollVote.findMany({
      where: {
        pollId: post.poll.id,
        userId: session.user.id
      },
      select: { optionId: true }
    });
    const userVotedOptions = userVotes.map(vote => vote.optionId);
    
    transformedPost = {
      ...transformedPost,
      poll: {
        ...post.poll,
        totalVotes,
        options: post.poll.options.map((option: any) => ({
          id: option.id,
          text: option.text,
          votes: option.votes.length,
          isSelected: userVotedOptions.includes(option.id)
        }))
      }
    } as any;
  }

  // Add unique account view counts and engagement flags to replies
  const replyIds = transformedPost.replies.map((reply: any) => reply.id);
  
  const [replyViewCounts, replyUserLikes, replyUserReposts, replyUserSaves] = await Promise.all([
    // Get view counts for all replies
    prisma.postView.groupBy({
      by: ['postId'],
      where: { postId: { in: replyIds } },
      _count: { userId: true }
    }),
    // Get current user's likes on replies
    currentUserId ? prisma.postLike.findMany({
      where: { postId: { in: replyIds }, userId: currentUserId },
      select: { postId: true }
    }) : Promise.resolve([]),
    // Get current user's reposts on replies
    currentUserId ? prisma.postRepost.findMany({
      where: { postId: { in: replyIds }, userId: currentUserId },
      select: { postId: true }
    }) : Promise.resolve([]),
    // Get current user's saves on replies
    currentUserId ? prisma.savedPost.findMany({
      where: { postId: { in: replyIds }, userId: currentUserId },
      select: { postId: true }
    }) : Promise.resolve([])
  ]);
  
  const replyViewMap = new Map(replyViewCounts.map(r => [r.postId, r._count.userId]));
  const likedReplyIds = new Set(replyUserLikes.map(l => l.postId));
  const repostedReplyIds = new Set(replyUserReposts.map(r => r.postId));
  const savedReplyIds = new Set(replyUserSaves.map(s => s.postId));
  
  const repliesWithViewCounts = transformedPost.replies.map((reply: any) => ({
    ...reply,
    views: replyViewMap.get(reply.id) || 0,
    isLiked: likedReplyIds.has(reply.id),
    isReposted: repostedReplyIds.has(reply.id),
    isSaved: savedReplyIds.has(reply.id)
  }));

  return (
    <PostPageContent 
      post={transformedPost} 
      replies={repliesWithViewCounts} 
      currentUserId={session?.user?.id} 
      currentUserProfile={currentUserProfile}
    />
  );
}
