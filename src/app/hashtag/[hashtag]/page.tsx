import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { PostFeed } from "@/components/feed/PostFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { getUniqueViewCounts } from "@/lib/view-utils";

export default async function HashtagPage(props: { params: Promise<{ hashtag: string }> }) {
  const session = await getServerSession(authOptions);
  const { hashtag } = await props.params;

  // Find the hashtag directly from database
  const hashtagRecord = await prisma.hashtag.findUnique({
    where: { name: hashtag.toLowerCase() }
  });

  if (!hashtagRecord) {
    notFound();
  }

  // Count posts matching this hashtag
  const totalPosts = await prisma.post.count({
    where: {
      replyToId: null,
      hashtags: {
        some: { hashtagId: hashtagRecord.id },
      },
    },
  });

  // Fetch posts for this hashtag
  const posts = await prisma.post.findMany({
    where: {
      replyToId: null,
      hashtags: {
        some: {
          hashtagId: hashtagRecord.id
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: {
        include: {
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
      hashtags: {
        include: { hashtag: { select: { name: true } } }
      },
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
            include: {
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
        select: { postId: true, userId: true, viewedAt: true }
      }
    }
  });

  // Get view counts
  const postIds = posts.map((post) => post.id);
  const viewCountMap = await getUniqueViewCounts(postIds);

  // Transform posts with view counts and poll data
  const finalPosts = posts.map((post) => {
    const poll = post.poll
      ? {
          id: post.poll.id,
          question: post.poll.question,
          isMultiple: post.poll.isMultiple,
          expiresAt: post.poll.expiresAt,
          totalVotes: post.poll.options.reduce((sum, option) => sum + option.votes.length, 0),
          options: post.poll.options.map((option) => ({
            id: option.id,
            text: option.text,
            votes: option.votes.length,
          })),
        }
      : undefined;

    return {
      ...post,
      views: viewCountMap.get(post.id) || 0,
      poll,
    };
  });

  const hashtagData = {
    name: hashtagRecord.name,
    postCount: totalPosts
  };

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
      }
    }
  }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hashtag Header */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">#</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">#{hashtagData.name}</h1>
              <p className="text-gray-400 mt-1">
                {hashtagData.postCount} {hashtagData.postCount === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
          <p className="text-gray-300">
            Explore posts tagged with #{hashtagData.name}
          </p>
        </div>

        {/* Posts Feed */}
        {finalPosts.length > 0 ? (
          <PostFeed 
            posts={finalPosts as any} 
            currentUserId={currentUserProfile?.id}
            hidePinnedIndicator={true}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
            <p className="text-gray-400">
              No posts have been tagged with #{hashtagData.name} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
