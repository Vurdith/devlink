/**
 * Utility functions for efficiently handling post views
 * Uses aggregation instead of fetching all records
 */

import { prisma } from "@/server/db";

/**
 * Batch fetch view counts for multiple posts using groupBy aggregation
 * Much faster than fetching all view records
 * 
 * @param postIds Array of post IDs
 * @returns Map of postId -> view count
 */
export async function getUniqueViewCounts(postIds: string[]): Promise<Map<string, number>> {
  if (postIds.length === 0) {
    return new Map();
  }

  // Use groupBy with count - much faster than fetching all records
  const viewCounts = await prisma.postView.groupBy({
    by: ['postId'],
    where: { 
      postId: { in: postIds },
      userId: { not: null } // Only count authenticated views
    },
    _count: { userId: true }
  });

  // Convert to Map
  const finalCounts = new Map<string, number>();
  
  // Initialize all postIds with 0
  postIds.forEach(postId => {
    finalCounts.set(postId, 0);
  });
  
  // Set actual counts
  viewCounts.forEach(item => {
    finalCounts.set(item.postId, item._count.userId);
  });

  return finalCounts;
}

