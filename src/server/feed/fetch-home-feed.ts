import { prisma } from "@/server/db";

// Optimized select - includes all display data but skips user interaction checks
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
      profile: {
        select: {
          avatarUrl: true,
          bannerUrl: true,
          profileType: true,
          verified: true,
          bio: true,
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
      views: true,
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

export async function fetchHomeFeedPosts(limit = 20) {
  const posts = await prisma.post.findMany({
    where: { 
      replyToId: null,
      isScheduled: false,
    },
    select: feedPostSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Transform to expected format
  return posts.map(post => ({
    ...post,
    likes: [],
    reposts: [],
    savedBy: [],
    hashtags: [],
    replies: Array(post._count?.replies || 0).fill(null),
    views: post._count?.views || 0,
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
