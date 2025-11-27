import { prisma } from "@/server/db";
import { getUniqueViewCounts } from "@/lib/view-utils";

// Full select for feed display AND ranking
const feedPostSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isPinned: true,
  isSlideshow: true,
  location: true,
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
          location: true,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  },
  _count: {
    select: {
      likes: true,
      reposts: true,
      replies: true,
      savedBy: true,
    },
  },
  media: {
    select: {
      id: true,
      mediaUrl: true,
      mediaType: true,
      order: true,
    },
    orderBy: { order: "asc" as const },
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
};

export async function fetchHomeFeedPosts(limit = 30) {
  const posts = await prisma.post.findMany({
    where: { 
      replyToId: null,
      isScheduled: false,
    },
    select: feedPostSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Get unique view counts for all posts (consistent with other endpoints)
  const postIds = posts.map(p => p.id);
  const uniqueViewCounts = await getUniqueViewCounts(postIds);

  // Transform to expected format with consistent view counting
  return posts.map(post => ({
    ...post,
    likes: [],
    reposts: [],
    savedBy: [],
    hashtags: [],
    replies: Array(post._count?.replies || 0).fill(null),
    views: uniqueViewCounts.get(post.id) || 0,
    poll: post.poll ? {
      ...post.poll,
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: Array(opt._count.votes).fill({ id: '' }),
      }))
    } : null
  }));
}

export async function fetchPostForRanking(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    select: feedPostSelect,
  });
}
