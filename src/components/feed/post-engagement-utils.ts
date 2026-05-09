import type { FeedPost } from "@/types/post";

export type PostCountKey = "likes" | "reposts";

const countCollections = {
  likes: "likes",
  reposts: "reposts",
} as const;

export function getPostCount(post: FeedPost, key: PostCountKey) {
  const collectionKey = countCollections[key];
  return post._count?.[key] ?? post[collectionKey]?.length ?? 0;
}

export function getReplyCount(post: FeedPost) {
  return post._count?.replies ?? post.replies?.length ?? 0;
}

export function withPostCount(post: FeedPost, key: PostCountKey, count: number): FeedPost {
  return {
    ...post,
    _count: {
      likes: key === "likes" ? count : getPostCount(post, "likes"),
      reposts: key === "reposts" ? count : getPostCount(post, "reposts"),
      replies: getReplyCount(post),
      savedBy: post._count?.savedBy ?? post.savedBy?.length,
    },
  };
}
