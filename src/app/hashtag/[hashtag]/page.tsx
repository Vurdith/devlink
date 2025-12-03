import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { PostFeed } from "@/components/feed/PostFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { getUniqueViewCounts } from "@/lib/view-utils";

export default async function HashtagPage(props: { params: Promise<{ hashtag: string }> }) {
  const session = await getServerSession(authOptions);
  const { hashtag } = await props.params;
  const currentUserId = (session?.user as any)?.id;

  // Find the hashtag directly from database
  const hashtagRecord = await prisma.hashtag.findUnique({
    where: { name: hashtag.toLowerCase() }
  });

  if (!hashtagRecord) {
    notFound();
  }

  // Fetch posts with OPTIMIZED query - use _count, not full arrays
  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({
      where: {
        replyToId: null,
        hashtags: { some: { hashtagId: hashtagRecord.id } },
      },
    }),
    prisma.post.findMany({
      where: {
        replyToId: null,
        hashtags: { some: { hashtagId: hashtagRecord.id } }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
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
            _count: { select: { followers: true, following: true } }
          }
        },
        // Use _count - NOT full arrays
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
        }
      }
    })
  ]);

  // Batch fetch all engagement data in ONE query round
  const postIds = posts.map(p => p.id);
  
  const [viewCountMap, userLikes, userReposts, userSaves, currentUserProfile] = await Promise.all([
    getUniqueViewCounts(postIds),
    currentUserId ? prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    currentUserId ? prisma.postRepost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    currentUserId ? prisma.savedPost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }) : [],
    session?.user?.username ? prisma.user.findUnique({
      where: { username: session.user.username },
      select: { id: true, username: true, name: true }
    }) : null
  ]);
  
  const likedPostIds = new Set(userLikes.map(l => l.postId));
  const repostedPostIds = new Set(userReposts.map(r => r.postId));
  const savedPostIds = new Set(userSaves.map(s => s.postId));

  // Transform posts
  const finalPosts = posts.map(post => ({
    ...post,
    views: viewCountMap.get(post.id) || 0,
    isLiked: likedPostIds.has(post.id),
    isReposted: repostedPostIds.has(post.id),
    isSaved: savedPostIds.has(post.id),
    likes: [],
    reposts: [],
    savedBy: [],
    replies: Array(post._count.replies).fill(null),
    poll: post.poll ? {
      ...post.poll,
      totalVotes: post.poll.options.reduce((sum, opt) => sum + opt._count.votes, 0),
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt._count.votes
      }))
    } : undefined
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--color-accent-hover)]/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hashtag Header */}
        <div className="bg-[#0d0d12] rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent-hover)] to-[var(--color-accent)] rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">#</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">#{hashtagRecord.name}</h1>
              <p className="text-gray-400 mt-1">
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
          <p className="text-gray-300">
            Explore posts tagged with #{hashtagRecord.name}
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
              No posts have been tagged with #{hashtagRecord.name} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
