/**
 * Utility functions for efficiently handling post views
 * Prevents N+1 queries by batch fetching all views at once
 */

import { prisma } from "@/server/db";

/**
 * Batch fetch unique account view counts for multiple posts
 * Much more efficient than fetching views per-post
 * 
 * @param postIds Array of post IDs
 * @returns Map of postId -> unique view count
 */
export async function getUniqueViewCounts(postIds: string[]): Promise<Map<string, number>> {
  if (postIds.length === 0) {
    return new Map();
  }

  // Single query to fetch all views for these posts
  const allViews = await prisma.postView.findMany({
    where: { postId: { in: postIds } },
    select: { postId: true, userId: true }
  });

  // Group by postId and count unique userIds
  const viewCountMap = new Map<string, Set<string>>();
  
  allViews.forEach(view => {
    if (!viewCountMap.has(view.postId)) {
      viewCountMap.set(view.postId, new Set());
    }
    // Only count authenticated views
    if (view.userId) {
      viewCountMap.get(view.postId)!.add(view.userId);
    }
  });

  // Convert Sets to counts
  const finalCounts = new Map<string, number>();
  postIds.forEach(postId => {
    finalCounts.set(postId, viewCountMap.get(postId)?.size || 0);
  });

  return finalCounts;
}

/**
 * Batch fetch unique engagers (accounts that engaged in any way) for multiple posts
 * Combines likes, reposts, replies, and authenticated views
 * 
 * @param postIds Array of post IDs
 * @returns Map of postId -> unique engager count
 */
export async function getUniqueEngagerCounts(
  postIds: string[]
): Promise<Map<string, number>> {
  if (postIds.length === 0) {
    return new Map();
  }

  // Batch fetch all engagement data
  const [allLikes, allReposts, allReplies, allViews] = await Promise.all([
    prisma.postLike.findMany({
      where: { post: { id: { in: postIds } } },
      select: { postId: true, userId: true }
    }),
    prisma.postRepost.findMany({
      where: { post: { id: { in: postIds } } },
      select: { postId: true, userId: true }
    }),
    prisma.post.findMany({
      where: { replyToId: { in: postIds } },
      select: { replyToId: true, userId: true }
    }),
    prisma.postView.findMany({
      where: { postId: { in: postIds } },
      select: { postId: true, userId: true }
    })
  ]);

  // Group unique engagers per post
  const engagerCountMap = new Map<string, Set<string>>();

  postIds.forEach(postId => {
    engagerCountMap.set(postId, new Set());
  });

  // Add all engagers
  allLikes.forEach(like => {
    engagerCountMap.get(like.postId)?.add(like.userId);
  });

  allReposts.forEach(repost => {
    engagerCountMap.get(repost.postId)?.add(repost.userId);
  });

  allReplies.forEach(reply => {
    if (reply.replyToId) {
      engagerCountMap.get(reply.replyToId)?.add(reply.userId);
    }
  });

  allViews.forEach(view => {
    if (view.userId) {
      engagerCountMap.get(view.postId)?.add(view.userId);
    }
  });

  // Convert Sets to counts
  const finalCounts = new Map<string, number>();
  postIds.forEach(postId => {
    finalCounts.set(postId, engagerCountMap.get(postId)?.size || 0);
  });

  return finalCounts;
}

/**
 * Transform posts to include unique view counts
 * Used to convert the view array to a count for frontend
 * 
 * @param posts Array of posts with views array
 * @returns Array of posts with views count
 */
export function transformPostsWithUniqueViewCounts(posts: any[]): any[] {
  return posts.map(post => {
    const uniqueViewCount = new Set(
      post.views.filter((v: any) => v.userId).map((v: any) => v.userId)
    ).size;
    
    return {
      ...post,
      views: uniqueViewCount
    };
  });
}

