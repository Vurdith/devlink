import { prisma } from "@/server/db";

// SUPER MINIMAL select for maximum speed
const feedPostSelect = {
  id: true,
  content: true,
  createdAt: true,
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
          profileType: true,
          verified: true,
        },
      },
    },
  },
  _count: {
    select: {
      likes: true,
      reposts: true,
      replies: true,
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
    take: 4, // Limit media items
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

  // Minimal transform
  return posts.map(post => ({
    ...post,
    likes: [],
    reposts: [],
    savedBy: [],
    hashtags: [],
    replies: Array(post._count?.replies || 0).fill(null),
    views: 0,
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
