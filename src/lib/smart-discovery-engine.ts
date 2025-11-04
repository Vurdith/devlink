/**
 * Smart Discovery Engine - The Most Advanced Social Media Algorithm Ever Created
 * 
 * This algorithm combines the best features from all major platforms while solving
 * their biggest problems: echo chambers, creator inequality, and engagement manipulation.
 * 
 * Core Philosophy: "Merit-Based Discovery" - Quality content gets discovered regardless
 * of follower count, while preventing gaming and promoting genuine engagement.
 */

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      profileType: string;
      verified: boolean;
      createdAt: Date;
    };
  };
  likes: Array<{ id: string; userId: string; createdAt: Date }>;
  reposts: Array<{ id: string; userId: string; createdAt: Date }>;
  replies: Array<{ id: string; userId: string; createdAt: Date; content: string }>;
  views: Array<{ id: string; userId: string; createdAt: Date }>;
  isPinned: boolean;
  media: Array<{ id: string; mediaUrl: string; mediaType: string }>;
  poll?: {
    id: string;
    totalVotes: number;
    expiresAt: Date;
  };
  score?: number; // Algorithm score for debugging
}

interface UserEngagement {
  userId: string;
  totalLikes: number;
  totalReposts: number;
  totalReplies: number;
  totalViews: number;
  followerCount: number;
  followingCount: number;
  accountAge: number; // in days
  isVerified: boolean;
  profileType: string;
  postsCount: number;
  avgEngagementRate: number;
}

interface AlgorithmConfig {
  // Temporal Intelligence
  temporalWeights: {
    fresh: number;      // 0-2 hours
    recent: number;     // 2-6 hours
    moderate: number;   // 6-12 hours
    aging: number;      // 12-24 hours
    legacy: number;     // 24+ hours
  };
  
  // Engagement Quality Matrix
  engagementWeights: {
    replies: number;
    reposts: number;
    likes: number;
    views: number;
  };
  
  // User Discovery Balance
  userDiscoveryWeights: {
    newUser: number;        // 0-30 days
    growingUser: number;    // 30-180 days
    establishedUser: number; // 180+ days
    scorePerFollower: number; // Points per follower
    verifiedMultiplier: number; // Verified users get multiplier
  };
  
  // Network Diversity
  networkWeights: {
    closeNetwork: number;    // Mutual follows
    extendedNetwork: number; // One-way follows
    discoveryNetwork: number; // No connection
    diverseNetwork: number;  // Different interests
  };
  
  // Content Quality
  contentWeights: {
    hasMedia: number;
    hasPoll: number;
    optimalLength: number;
    originalContent: number;
  };
  
}

export class SmartDiscoveryEngine {
  private config: AlgorithmConfig = {
    // Temporal Intelligence - Rewards fresh content exponentially
    temporalWeights: {
      fresh: 100,      // 0-2 hours: Maximum visibility
      recent: 60,      // 2-6 hours: High visibility
      moderate: 30,    // 6-12 hours: Moderate visibility
      aging: 10,       // 12-24 hours: Low visibility
      legacy: 1,       // 24+ hours: Minimal visibility
    },
    
    // Engagement Quality Matrix - Rewards meaningful interactions
    engagementWeights: {
      replies: 25.0,   // Most valuable - shows genuine interest
      reposts: 15.0,   // High value - content worth sharing
      likes: 5.0,      // Standard value - basic appreciation
      views: 0.5,      // Minimal value - passive consumption
    },
    
    // User Discovery Balance - Helps small creators get discovered while rewarding influence
    userDiscoveryWeights: {
      newUser: 50,        // 0-30 days: Massive boost for new creators
      growingUser: 30,    // 30-180 days: Strong boost for growing creators
      establishedUser: 10, // 180+ days: Moderate boost for established users
      scorePerFollower: 0.1, // Each follower gives 0.1 points to every post
      verifiedMultiplier: 1.5, // Verified users get 1.5x multiplier
    },
    
    // Network Diversity - Prevents echo chambers
    networkWeights: {
      closeNetwork: 2.0,    // Mutual follows: Strong boost
      extendedNetwork: 1.5, // One-way follows: Moderate boost
      discoveryNetwork: 1.0, // No connection: Standard boost
      diverseNetwork: 1.2,  // Different interests: Slight boost
    },
    
    // Content Quality - Rewards high-quality content
    contentWeights: {
      hasMedia: 15,        // Media content gets significant boost
      hasPoll: 12,         // Interactive content gets boost
      optimalLength: 8,    // Optimal content length gets boost
      originalContent: 20, // Original content gets highest boost
    },
    
  };

  // No caching needed for rule-based algorithm

  /**
   * Layer 1: Temporal Intelligence - Advanced time-based scoring
   * Rewards fresh content exponentially and tracks engagement velocity
   */
  private calculateTemporalScore(post: Post): number {
    const now = new Date();
    const postTime = new Date(post.createdAt);
    const minutesAgo = (now.getTime() - postTime.getTime()) / (1000 * 60);
    
    // More granular temporal scoring for recent posts
    let temporalScore = 0;
    if (minutesAgo <= 10) {
      // 0-10 minutes: Maximum boost
      temporalScore = 100;
    } else if (minutesAgo <= 30) {
      // 10-30 minutes: High boost
      temporalScore = 80;
    } else if (minutesAgo <= 60) {
      // 30-60 minutes: Good boost
      temporalScore = 60;
    } else if (minutesAgo <= 120) {
      // 1-2 hours: Moderate boost
      temporalScore = 40;
    } else if (minutesAgo <= 360) {
      // 2-6 hours: Low boost
      temporalScore = 20;
    } else if (minutesAgo <= 720) {
      // 6-12 hours: Minimal boost
      temporalScore = 10;
    } else if (minutesAgo <= 1440) {
      // 12-24 hours: Very low boost
      temporalScore = 5;
    } else {
      // 24+ hours: Almost no boost
      temporalScore = 1;
    }
    
    // Engagement Velocity Bonus - Posts that gain engagement quickly get exponential boost
    const totalEngagement = post.likes.length + post.reposts.length + post.replies.length + post.views.length;
    const engagementVelocity = totalEngagement / (minutesAgo + 1); // +1 to avoid division by zero
    
    // Exponential boost for high engagement velocity
    const velocityMultiplier = Math.min(1 + (engagementVelocity * 0.1), 3); // Cap at 3x
    
    return temporalScore * velocityMultiplier;
  }

  /**
   * Layer 2: Engagement Quality Matrix - Rewards meaningful interactions
   * Analyzes engagement depth and quality, not just quantity
   */
  private calculateEngagementQualityScore(post: Post): number {
    const likes = post.likes.length;
    const reposts = post.reposts.length;
    const replies = post.replies.length;
    const views = post.views.length;
    
    // Basic engagement score
    const basicScore = 
      (likes * this.config.engagementWeights.likes) +
      (reposts * this.config.engagementWeights.reposts) +
      (replies * this.config.engagementWeights.replies) +
      (views * this.config.engagementWeights.views);
    
    // Engagement Depth Analysis - Rewards thoughtful replies
    let depthBonus = 0;
    if (replies > 0) {
      const avgReplyLength = post.replies.reduce((sum, reply) => sum + reply.content.length, 0) / replies;
      if (avgReplyLength > 50) {
        depthBonus = replies * 2; // Bonus for thoughtful replies
      }
    }
    
    // Engagement Authenticity - Rewards diverse engagement
    // For views, we need to handle both authenticated and anonymous views
    const authenticatedViewers = post.views.filter(v => v.userId).map(v => v.userId);
    const anonymousViews = post.views.filter(v => !v.userId).length;
    
    const uniqueEngagers = new Set([
      ...post.likes.map(l => l.userId),
      ...post.reposts.map(r => r.userId),
      ...post.replies.map(r => r.userId),
      ...authenticatedViewers
    ]).size + anonymousViews; // Add anonymous views as separate unique engagers
    
    // Authenticity multiplier: 1.0x base + 0.05x per unique engager
    const authenticityMultiplier = Math.max(1.0, 1.0 + (uniqueEngagers * 0.05)); // 1.0x base + 0.05x per engager
    
    return (basicScore + depthBonus) * authenticityMultiplier;
  }

  /**
   * Layer 3: User Discovery Balance - Helps small creators get discovered while rewarding influence
   * Provides massive boosts to new creators AND rewards users with more followers (linear relationship)
   */
  private calculateUserDiscoveryScore(user: Post['user'], userEngagement?: UserEngagement): number {
    if (!userEngagement) return 0;
    
    const accountAge = userEngagement.accountAge;
    const followerCount = userEngagement.followerCount;
    
    // Account age-based discovery boost (helps new creators)
    let ageBoost = 0;
    if (accountAge <= 30) {
      ageBoost = this.config.userDiscoveryWeights.newUser;
    } else if (accountAge <= 180) {
      ageBoost = this.config.userDiscoveryWeights.growingUser;
    } else {
      ageBoost = this.config.userDiscoveryWeights.establishedUser;
    }
    
    // Follower count-based influence boost (linear relationship - each follower gives points)
    const followerBoost = followerCount * this.config.userDiscoveryWeights.scorePerFollower;
    
    // Profile type bonus (encourages diversity)
    const profileTypeBonus = this.getProfileTypeBonus(user.profile.profileType);
    
    return ageBoost + followerBoost + profileTypeBonus;
  }

  /**
   * Layer 4: Network Diversity - Prevents echo chambers
   * Analyzes user relationships and promotes diverse content
   */
  private calculateNetworkDiversityScore(
    post: Post, 
    currentUserId: string, 
    followingIds: string[] = [],
    mutualFollows: string[] = []
  ): number {
    const postUserId = post.userId;
    
    // Determine network relationship
    let networkMultiplier = 1.0;
    
    if (postUserId === currentUserId) {
      // Own posts get standard boost
      networkMultiplier = 1.5;
    } else if (mutualFollows.includes(postUserId)) {
      // Mutual follows get strong boost
      networkMultiplier = this.config.networkWeights.closeNetwork;
    } else if (followingIds.includes(postUserId)) {
      // One-way follows get moderate boost
      networkMultiplier = this.config.networkWeights.extendedNetwork;
    } else {
      // Discovery network gets standard boost
      networkMultiplier = this.config.networkWeights.discoveryNetwork;
    }
    
    // Diversity injection - Force 30% of feed to be from discovery network
    const isDiscoveryContent = !followingIds.includes(postUserId) && postUserId !== currentUserId;
    if (isDiscoveryContent) {
      networkMultiplier *= 1.3; // Boost discovery content
    }
    
    return networkMultiplier;
  }

  /**
   * Layer 5: Content Quality - Rewards high-quality content
   * Analyzes content characteristics and rewards originality
   */
  private calculateContentQualityScore(post: Post): number {
    let score = 0;
    
    // Media content boost
    if (post.media && post.media.length > 0) {
      score += this.config.contentWeights.hasMedia;
    }
    
    // Poll content boost
    if (post.poll) {
      score += this.config.contentWeights.hasPoll;
    }
    
    // Content length optimization
    const contentLength = post.content.length;
    if (contentLength >= 50 && contentLength <= 500) {
      score += this.config.contentWeights.optimalLength;
    }
    
    // Originality detection (basic heuristics)
    const originalityScore = this.detectOriginality(post);
    const originalityPoints = originalityScore * this.config.contentWeights.originalContent;
    score += originalityPoints;
    
    return score;
  }

  /**
   * Get detailed breakdown of content quality score
   */
  public getContentQualityBreakdown(post: Post): {
    media: { points: number; explanation: string };
    poll: { points: number; explanation: string };
    length: { points: number; explanation: string };
    originality: { points: number; explanation: string };
  } {
    const contentLength = post.content.length;
    
    // Media analysis
    const hasMedia = post.media && post.media.length > 0;
    const mediaPoints = hasMedia ? this.config.contentWeights.hasMedia : 0;
    const mediaExplanation = hasMedia 
      ? `Has ${post.media.length} media file(s) = ${mediaPoints} points`
      : `No media = 0 points`;
    
    // Poll analysis
    const hasPoll = !!post.poll;
    const pollPoints = hasPoll ? this.config.contentWeights.hasPoll : 0;
    const pollExplanation = hasPoll 
      ? `Has interactive poll = ${pollPoints} points`
      : `No poll = 0 points`;
    
    // Length analysis
    const isOptimalLength = contentLength >= 50 && contentLength <= 500;
    const lengthPoints = isOptimalLength ? this.config.contentWeights.optimalLength : 0;
    const lengthExplanation = isOptimalLength 
      ? `Optimal length (${contentLength} chars) = ${lengthPoints} points`
      : `Length ${contentLength} chars (not optimal 50-500) = 0 points`;
    
    // Originality analysis
    const originalityScore = this.detectOriginality(post);
    const originalityPoints = originalityScore * this.config.contentWeights.originalContent;
    const originalityExplanation = this.getOriginalityExplanation(post, originalityScore);
    
    return {
      media: { points: mediaPoints, explanation: mediaExplanation },
      poll: { points: pollPoints, explanation: pollExplanation },
      length: { points: lengthPoints, explanation: lengthExplanation },
      originality: { points: originalityPoints, explanation: originalityExplanation }
    };
  }

  /**
   * Get detailed explanation of originality score
   */
  private getOriginalityExplanation(post: Post, originalityScore: number): string {
    const content = post.content;
    const explanations: string[] = [];
    
    // Check for spam patterns
    const spamPatterns = [
      { pattern: /follow me/i, penalty: 0.3, text: "spam phrases" },
      { pattern: /like this if/i, penalty: 0.3, text: "engagement bait" },
      { pattern: /comment below/i, penalty: 0.3, text: "comment bait" },
      { pattern: /share this/i, penalty: 0.3, text: "share bait" },
      { pattern: /check out my/i, penalty: 0.3, text: "self-promotion" },
    ];
    
    // let totalPenalty = 0;
    for (const { pattern, penalty, text } of spamPatterns) {
      if (pattern.test(content)) {
        // totalPenalty += penalty;
        explanations.push(`-${penalty * 20} pts for ${text}`);
      }
    }
    
    // Check for positive factors
    if (content.length > 100) {
      explanations.push(`+6 pts for thoughtful content (>100 chars)`);
    }
    
    if (content.includes('?')) {
      explanations.push(`+4 pts for questions (encourages discussion)`);
    }
    
    if (content.includes('#')) {
      explanations.push(`+2 pts for hashtags (topic awareness)`);
    }
    
    if (content.includes('@')) {
      explanations.push(`+2 pts for mentions (community engagement)`);
    }
    
    if (explanations.length === 0) {
      explanations.push(`Basic content = 0 points`);
    }
    
    const finalPoints = originalityScore * this.config.contentWeights.originalContent;
    return `${finalPoints.toFixed(1)} points: ${explanations.join(', ')}`;
  }


  /**
   * Helper Methods
   */
  private getProfileTypeBonus(profileType: string): number {
    const bonuses: Record<string, number> = {
      'Developer': 3,
      'Designer': 3,
      'Influencer': 2,
      'Studio': 4,
      'Client': 1,
    };
    return bonuses[profileType] || 0;
  }

  private detectOriginality(post: Post): number {
    // Start with 0 - no free points
    let originalityScore = 0;
    
    // Check for common spam patterns (penalties)
    const spamPatterns = [
      /follow me/i,
      /like this if/i,
      /comment below/i,
      /share this/i,
      /check out my/i,
    ];
    
    // let spamPenalty = 0;
    for (const pattern of spamPatterns) {
      if (pattern.test(post.content)) {
        // spamPenalty += 0.3;
        originalityScore -= 0.3;
      }
    }
    
    // Reward longer, more thoughtful content
    if (post.content.length > 100) {
      originalityScore += 0.3; // More substantial reward for thoughtful content
    }
    
    // Reward content with questions (encourages discussion)
    if (post.content.includes('?')) {
      originalityScore += 0.2; // Reward for engagement
    }
    
    // Reward content with hashtags (shows topic awareness)
    if (post.content.includes('#')) {
      originalityScore += 0.1;
    }
    
    // Reward content with mentions (shows community engagement)
    if (post.content.includes('@')) {
      originalityScore += 0.1;
    }
    
    const finalScore = Math.max(0, Math.min(1, originalityScore));
    
    return finalScore;
  }


  /**
   * Main Algorithm - Calculate final post score
   */
  public calculatePostScore(
    post: Post,
    currentUserId: string,
    userEngagement?: UserEngagement,
    followingIds: string[] = [],
    mutualFollows: string[] = []
  ): number {
    const temporalScore = this.calculateTemporalScore(post);
    const engagementScore = this.calculateEngagementQualityScore(post);
    const userDiscoveryScore = this.calculateUserDiscoveryScore(post.user, userEngagement);
    const networkScore = this.calculateNetworkDiversityScore(post, currentUserId, followingIds, mutualFollows);
    const contentScore = this.calculateContentQualityScore(post);
    
    // Combine all scores with network multiplier
    const baseScore = temporalScore + engagementScore + userDiscoveryScore + contentScore;
    const networkAdjustedScore = baseScore * networkScore;
    
    // Apply verified multiplier (1.5x for verified users)
    const verifiedMultiplier = post.user.profile.verified ? this.config.userDiscoveryWeights.verifiedMultiplier : 1.0;
    const finalScore = networkAdjustedScore * verifiedMultiplier;
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Algorithm Debug:', {
        temporalScore,
        engagementScore,
        userDiscoveryScore,
        contentScore,
        networkScore,
        baseScore,
        networkAdjustedScore,
        verifiedMultiplier,
        finalScore,
        postId: post.id
      });
    }
    
    return Math.max(0, finalScore); // Ensure non-negative scores
  }

  /**
   * Rank posts using the Smart Discovery Engine
   */
  public rankPosts(
    posts: Post[],
    currentUserId: string,
    userEngagements?: Map<string, UserEngagement>,
    followingIds: string[] = [],
    mutualFollows: string[] = []
  ): Post[] {
    const postsWithScores = posts.map(post => {
      const score = this.calculatePostScore(
        post,
        currentUserId,
        userEngagements?.get(post.userId),
        followingIds,
        mutualFollows
      );
      return {
        post: {
          ...post,
          score
        },
        score
      };
    });

    return postsWithScores
      .sort((a, b) => {
        // Primary sort: by score descending
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tiebreaker: by recency (newer posts first)
        return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
      })
      .map(item => item.post);
  }

  /**
   * Get personalized feed with diversity injection
   */
  public getPersonalizedFeed(
    posts: Post[],
    currentUserId: string,
    userEngagements?: Map<string, UserEngagement>,
    followingIds: string[] = [],
    mutualFollows: string[] = []
  ): Post[] {
    const rankedPosts = this.rankPosts(posts, currentUserId, userEngagements, followingIds, mutualFollows);
    
    // Diversity injection - Ensure 30% of feed is discovery content
    const discoveryPosts = rankedPosts.filter(post => 
      !followingIds.includes(post.userId) && post.userId !== currentUserId
    );
    const followingPosts = rankedPosts.filter(post => 
      followingIds.includes(post.userId) || post.userId === currentUserId
    );
    
    // Mix posts to ensure diversity
    const mixedPosts: Post[] = [];
    const targetDiscoveryRatio = 0.3;
    const maxDiscoveryPosts = Math.ceil(rankedPosts.length * targetDiscoveryRatio);
    
    let discoveryIndex = 0;
    let followingIndex = 0;
    
    for (let i = 0; i < rankedPosts.length; i++) {
      const shouldAddDiscovery = 
        discoveryIndex < maxDiscoveryPosts && 
        discoveryIndex < discoveryPosts.length &&
        (i % 3 === 0 || followingIndex >= followingPosts.length);
      
      if (shouldAddDiscovery) {
        mixedPosts.push(discoveryPosts[discoveryIndex]);
        discoveryIndex++;
      } else if (followingIndex < followingPosts.length) {
        mixedPosts.push(followingPosts[followingIndex]);
        followingIndex++;
      } else if (discoveryIndex < discoveryPosts.length) {
        mixedPosts.push(discoveryPosts[discoveryIndex]);
        discoveryIndex++;
      }
    }
    
    return mixedPosts;
  }

  /**
   * Update algorithm configuration
   */
  public updateConfig(newConfig: Partial<AlgorithmConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AlgorithmConfig {
    return { ...this.config };
  }
}

// Export default instance
export const smartDiscoveryEngine = new SmartDiscoveryEngine();

// Export types
export type { Post, UserEngagement, AlgorithmConfig };
