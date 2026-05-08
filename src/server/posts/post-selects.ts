import type { Prisma } from "@prisma/client";

export const postListSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isPinned: true,
  isSlideshow: true,
  location: true,
  embedUrls: true,
  userId: true,
  replyToId: true,
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
    orderBy: { order: "asc" },
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
          _count: { select: { votes: true } },
        },
      },
    },
  },
} satisfies Prisma.PostSelect;

export const repliedPostListSelect = {
  ...postListSelect,
  replyTo: {
    select: {
      id: true,
      content: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { avatarUrl: true, verified: true } },
        },
      },
    },
  },
} satisfies Prisma.PostSelect;
