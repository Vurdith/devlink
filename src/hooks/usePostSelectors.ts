/**
 * Memoized selectors for expensive post computations
 * Prevents unnecessary recalculations on re-renders
 */

import { useMemo } from 'react';

interface Post {
  id: string;
  likes?: Array<{ id: string; userId: string }>;
  reposts?: Array<{ id: string; userId: string }>;
  savedBy?: Array<{ id: string; userId: string }>;
  media?: Array<any>;
  poll?: any;
  replies?: Array<any>;
  views?: number;
  [key: string]: any;
}

/**
 * Memoized selector for engagement counts
 * Prevents recalculation when only non-engagement data changes
 */
export function useEngagementCounts(post: Post) {
  return useMemo(
    () => ({
      likeCount: post.likes?.length || 0,
      repostCount: post.reposts?.length || 0,
      saveCount: post.savedBy?.length || 0,
      replyCount: post.replies?.length || 0,
      viewCount: post.views || 0,
    }),
    [post.likes?.length, post.reposts?.length, post.savedBy?.length, post.replies?.length, post.views]
  );
}

/**
 * Memoized selector for user engagement in a post
 * Prevents recalculation when only non-engagement data changes
 */
export function useUserEngagement(post: Post, userId?: string) {
  return useMemo(
    () => {
      if (!userId) {
        return { isLiked: false, isReposted: false, isSaved: false };
      }
      return {
        isLiked: post.likes?.some(like => like.userId === userId) || false,
        isReposted: post.reposts?.some(repost => repost.userId === userId) || false,
        isSaved: post.savedBy?.some(saved => saved.userId === userId) || false,
      };
    },
    [post.likes?.length, post.reposts?.length, post.savedBy?.length, userId]
  );
}

/**
 * Memoized selector for media information
 * Prevents recalculation when other post data changes
 */
export function usePostMedia(post: Post) {
  return useMemo(
    () => ({
      hasMedia: (post.media?.length || 0) > 0,
      mediaCount: post.media?.length || 0,
      hasPoll: !!post.poll,
      media: post.media || [],
    }),
    [post.media?.length, post.poll?.id]
  );
}

/**
 * Memoized selector for post engagement totals
 * Useful for calculating total engagement for ranking
 */
export function useEngagementTotal(post: Post) {
  return useMemo(
    () => {
      const likes = post.likes?.length || 0;
      const reposts = post.reposts?.length || 0;
      const replies = post.replies?.length || 0;
      const views = post.views || 0;
      return likes + reposts + replies + views;
    },
    [post.likes?.length, post.reposts?.length, post.replies?.length, post.views]
  );
}

/**
 * Memoized selector for engagement by type
 * Prevents recalculation and provides weighted engagement scores
 */
export function useEngagementQuality(post: Post) {
  return useMemo(
    () => {
      const likes = post.likes?.length || 0;
      const reposts = post.reposts?.length || 0;
      const replies = post.replies?.length || 0;
      const views = post.views || 0;

      // Weighted engagement score (replies are most valuable)
      return {
        weightedScore: replies * 5 + reposts * 3 + likes * 1 + views * 0.1,
        engagement: { likes, reposts, replies, views },
        totalEngagement: likes + reposts + replies + views,
      };
    },
    [post.likes?.length, post.reposts?.length, post.replies?.length, post.views]
  );
}

/**
 * Memoized selector for text content metrics
 * Useful for content quality analysis
 */
export function useContentMetrics(content: string) {
  return useMemo(
    () => ({
      length: content.length,
      wordCount: content.trim().split(/\s+/).length,
      hasHashtags: /#[a-zA-Z0-9_]+/.test(content),
      hasMentions: /@[a-zA-Z0-9_]+/.test(content),
      hasQuestions: /\?/.test(content),
    }),
    [content]
  );
}

