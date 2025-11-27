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

