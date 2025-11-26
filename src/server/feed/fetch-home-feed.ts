import { prisma } from "@/server/db";

// OPTIMIZED: Minimal includes for feed display
const feedPostSelect = {
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
      createdAt: true,
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
      savedBy: true,
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
          _count: {
            select: { votes: true }
          }
        }
      }
    }
  },
};

// Full include for when we need all data (e.g., analytics)
const feedPostIncludeFull = {
  user: {
    select: {
      id: true,
      createdAt: true,
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
          createdAt: true,
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
  likes: {
    take: 50,
    select: { userId: true },
  },
  reposts: {
    take: 20,
    select: { userId: true },
  },
  savedBy: {
    take: 20,
    select: { userId: true },
  },
  hashtags: {
    include: {
      hashtag: {
        select: { name: true },
      },
    },
  },
  media: {
    orderBy: { order: "asc" as const },
  },
  poll: {
    include: {
      options: {
        include: {
          votes: true,
        },
      },
    },
  },
  replies: {
    take: 20,
    include: {
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
    },
  },
  views: {
    take: 50,
    select: {
      id: true,
      userId: true,
      viewedAt: true,
    },
  },
  _count: {
    select: {
      likes: true,
      reposts: true,
      savedBy: true,
      replies: true,
      views: true,
    },
  },
} as const;

export async function fetchHomeFeedPosts(limit = 30) {
  const posts = await prisma.post.findMany({
    where: { 
      replyToId: null,
      OR: [
        { isScheduled: false },
        { isScheduled: true, scheduledFor: { lte: new Date() } }
      ]
    },
    select: feedPostSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Transform poll options to match expected format
  return posts.map(post => ({
    ...post,
    likes: [],
    reposts: [],
    savedBy: [],
    hashtags: [],
    replies: [],
    views: [],
    poll: post.poll ? {
      ...post.poll,
      options: post.poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: Array(opt._count.votes).fill({ id: '' }), // Fake array for count
      }))
    } : null
  }));
}

export async function fetchPostForRanking(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: feedPostIncludeFull,
  });
}
