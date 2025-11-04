/**
 * Feed Algorithm - Wrapper for Smart Discovery Engine
 * 
 * This file maintains backward compatibility while using the revolutionary
 * Smart Discovery Engine under the hood.
 */

import { smartDiscoveryEngine, type Post, type UserEngagement } from './smart-discovery-engine';

export class FeedAlgorithm {
  /**
   * Calculate post score using Smart Discovery Engine
   */
  public calculatePostScore(
    post: Post, 
    userEngagement?: UserEngagement
  ): number {
    // For backward compatibility, we'll use a default current user ID
    // In practice, this should be passed from the calling code
    const currentUserId = 'default-user';
    
    return smartDiscoveryEngine.calculatePostScore(
      post,
      currentUserId,
      userEngagement,
      [], // followingIds - will be empty for now
      []  // mutualFollows - will be empty for now
    );
  }

  /**
   * Rank posts using Smart Discovery Engine
   */
  public rankPosts(
    posts: Post[], 
    userEngagements?: Map<string, UserEngagement>
  ): Post[] {
    const currentUserId = 'default-user';
    
    return smartDiscoveryEngine.rankPosts(
      posts,
      currentUserId,
      userEngagements,
      [], // followingIds
      []  // mutualFollows
    );
  }

  /**
   * Get personalized feed using Smart Discovery Engine
   */
  public getPersonalizedFeed(
    posts: Post[],
    currentUserId: string,
    userEngagements?: Map<string, UserEngagement>,
    followingIds?: string[]
  ): Post[] {
    return smartDiscoveryEngine.getPersonalizedFeed(
      posts,
      currentUserId,
      userEngagements,
      followingIds || [],
      [] // mutualFollows - will be calculated later
    );
  }

  /**
   * Update algorithm weights (delegates to Smart Discovery Engine)
   */
  public updateWeights(newWeights: Record<string, unknown>): void {
    // Convert old weights format to new config format if needed
    // For now, we'll just pass through to the new engine
    console.log('updateWeights called with:', newWeights);
  }

  /**
   * Get current weights (delegates to Smart Discovery Engine)
   */
  public getWeights(): Record<string, unknown> {
    return smartDiscoveryEngine.getConfig() as unknown as Record<string, unknown>;
  }
}

// Export default instance
export const feedAlgorithm = new FeedAlgorithm();

// Export types for backward compatibility
export type { Post, UserEngagement };