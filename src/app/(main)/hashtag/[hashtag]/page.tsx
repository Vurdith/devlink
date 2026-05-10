import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { PostFeed } from "@/components/feed/PostFeed";
import { Hash } from "lucide-react";
import { iconBox, surface } from "@/components/ui/design-system";
import { getAuthSession } from "@/server/auth";
import { getUniqueViewCounts } from "@/lib/view-utils";

export default async function HashtagPage(props: { params: Promise<{ hashtag: string }> }) {
  const session = await getAuthSession();
  const { hashtag } = await props.params;
  const currentUserId = session?.user?.id;

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
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        
        {/* Hashtag Header */}
        <div className={surface("panel", "noise-overlay mb-6 overflow-hidden p-5 sm:mb-8 sm:p-7")}>
          <div className="mb-4 flex items-center gap-4">
            <div className={iconBox("cyan", "h-14 w-14 sm:h-16 sm:w-16")}>
              <Hash className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">#{hashtagRecord.name}</h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
          <p className="text-white/70">
            Posts where builders mention #{hashtagRecord.name}.
          </p>
        </div>

        {/* Posts Feed */}
        {finalPosts.length > 0 ? (
          <PostFeed 
            posts={finalPosts} 
            currentUserId={currentUserProfile?.id}
            hidePinnedIndicator={true}
            session={session}
          />
        ) : (
          <div className={surface("empty", "py-12 text-center")}>
            <div className={iconBox("muted", "mx-auto mb-4 h-20 w-20")}>
              <Hash className="h-10 w-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
            <p className="text-[var(--muted-foreground)]">
              Nobody has tagged a post with #{hashtagRecord.name} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
