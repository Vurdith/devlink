/**
 * Reusable Prisma select fragments
 * Eliminates code duplication and ensures consistency across queries
 * Reduces maintenance burden significantly
 */

/**
 * User profile selection with all necessary fields
 */
export const userProfileSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      avatarUrl: true,
      bannerUrl: true,
      bio: true,
      website: true,
      location: true,
      profileType: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      followers: true,
      following: true,
      posts: true,
      likes: true,
    },
  },
};

/**
 * Minimal user profile (for embedding in posts)
 * Includes banner and stats for ProfileTooltip
 */
export const userProfileMinimalSelect = {
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
    },
  },
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
};

/**
 * Post user info (for post displays)
 */
export const postUserSelect = {
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
    },
  },
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
};

/**
 * Post engagement selects (all engagement types)
 */
export const postEngagementSelect = {
  likes: {
    select: {
      id: true,
      userId: true,
      createdAt: true,
    },
  },
  reposts: {
    select: {
      id: true,
      userId: true,
      createdAt: true,
    },
  },
  savedBy: {
    select: {
      id: true,
      userId: true,
      createdAt: true,
    },
  },
};

/**
 * Post media selection
 */
export const postMediaSelect = {
  media: {
    select: {
      id: true,
      mediaUrl: true,
      mediaType: true,
      order: true,
      width: true,
      height: true,
    },
    orderBy: { order: 'asc' as const },
  },
};

/**
 * Post poll selection
 */
export const postPollSelect = {
  poll: {
    select: {
      id: true,
      question: true,
      createdAt: true,
      endsAt: true,
      options: {
        select: {
          id: true,
          text: true,
          votes: {
            select: { id: true, userId: true },
          },
        },
      },
    },
  },
};

/**
 * Complete post selection (use sparingly, consider breaking up for performance)
 */
export const postCompleteSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isPinned: true,
  isScheduled: true,
  scheduledFor: true,
  userId: true,
  replyToId: true,
  
  user: {
    select: postUserSelect,
  },
  
  ...postEngagementSelect,
  ...postMediaSelect,
  ...postPollSelect,

  replies: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      user: {
        select: postUserSelect,
      },
      media: {
        select: {
          mediaUrl: true,
          mediaType: true,
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
};

/**
 * Post view selection helper
 */
export const postViewSelect = {
  id: true,
  userId: true,
  viewedAt: true,
};

/**
 * Hashtag selection
 */
export const hashtagSelect = {
  id: true,
  name: true,
  createdAt: true,
  _count: {
    select: {
      posts: true,
    },
  },
};

/**
 * Follower selection
 */
export const followerSelect = {
  id: true,
  followerId: true,
  followingId: true,
  createdAt: true,
};

/**
 * Export all selects as a single object for easy importing
 */
export const prismaSelects = {
  userProfileSelect,
  userProfileMinimalSelect,
  postUserSelect,
  postEngagementSelect,
  postMediaSelect,
  postPollSelect,
  postCompleteSelect,
  postViewSelect,
  hashtagSelect,
  followerSelect,
};

