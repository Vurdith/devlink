"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Post } from "@prisma/client";

interface PostAnalyticsProps {
  post: Post & {
    user: {
      id: string;
      username: string;
      name: string;
      profile: {
        avatarUrl: string | null;
        profileType: string;
        verified: boolean;
        createdAt: Date;
      };
    };
    likes: { userId: string }[];
    reposts: { userId: string }[];
    replies: { id: string; content: string; userId: string }[];
    views: { userId: string }[];
    media: { mediaUrl: string; mediaType: string }[];
    poll: {
      question: string;
      options: { text: string; votes: { userId: string }[] }[];
    } | null;
  };
  postScore: number;
  userEngagement: {
    accountAge: number;
    followerCount: number;
    postsCount: number;
    avgEngagementRate: number;
  };
  currentRank: number;
  totalPosts: number;
  rankedPosts: any[];
  currentUserId: string;
  componentScores: {
    temporal: number;
    engagement: number;
    userDiscovery: number;
    content: number;
    network: number;
    baseScore: number;
    networkAdjustedScore: number;
    verifiedMultiplier: number;
    expectedFinalScore: number;
  };
  contentBreakdown?: {
    media: { points: number; explanation: string };
    poll: { points: number; explanation: string };
    length: { points: number; explanation: string };
    originality: { points: number; explanation: string };
  };
}

export function PostAnalytics({
  post,
  postScore,
  userEngagement,
  currentRank,
  totalPosts,
  rankedPosts,
  currentUserId,
  componentScores,
  contentBreakdown
}: PostAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate real metrics from the post data
  const likes = post.likes.length;
  const reposts = post.reposts.length;
  const replies = post.replies.length;
  const views = post.views.length;
  const totalEngagement = likes + reposts + replies + views;
  
  // Calculate time metrics
  const now = new Date();
  const postTime = new Date(post.createdAt);
  const minutesAgo = (now.getTime() - postTime.getTime()) / (1000 * 60);
  const hoursAgo = minutesAgo / 60;
  const daysAgo = hoursAgo / 24;
  
  // Calculate engagement velocity
  const engagementVelocity = hoursAgo > 0 ? totalEngagement / hoursAgo : 0;
  
  // Calculate unique engagers (including views)
  // For views, we need to handle both authenticated and anonymous views
  const authenticatedViewers = post.views.filter(v => v.userId).map(v => v.userId);
  const anonymousViews = post.views.filter(v => !v.userId).length;
  
  const uniqueEngagers = new Set([
    ...post.likes.map(l => l.userId),
    ...post.reposts.map(r => r.userId),
    ...post.replies.map(r => r.userId),
    ...authenticatedViewers
  ]).size + anonymousViews; // Add anonymous views as separate unique engagers
  
  // Calculate reply ratio
  const replyRatio = totalEngagement > 0 ? (replies / totalEngagement) * 100 : 0;
  
  // Calculate network multiplier
  const networkMultiplier = post.userId === currentUserId ? 1.5 : 1.0;
  
  // Calculate base score (before network multiplier)
  const baseScore = (postScore || 0) / networkMultiplier;
  
  // Calculate verified multiplier
  const verifiedMultiplier = post.user.profile.verified ? 1.5 : 1.0;
  
  // Calculate final expected score
  const expectedFinalScore = baseScore * verifiedMultiplier;

  const tabs = [
    { id: "overview", label: "Overview", icon: "chart" },
    { id: "temporal", label: "Time & Recency", icon: "clock" },
    { id: "engagement", label: "Engagement", icon: "heart" },
    { id: "user", label: "User Profile", icon: "user" },
    { id: "content", label: "Content Quality", icon: "document" },
    { id: "network", label: "Network", icon: "globe" }
  ];

  // Icon rendering function
  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
    const icons: { [key: string]: React.ReactElement } = {
      chart: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      clock: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      heart: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      user: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      document: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      globe: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      shield: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      target: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      lightbulb: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      calculator: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      check: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      warning: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      eye: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      users: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      link: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      trending: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      image: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      tag: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      zap: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      search: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      trophy: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      calendar: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      message: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      repeat: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };
    
    return icons[iconName] || null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Post Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Complete breakdown of how your post is ranked by the Smart Discovery Engine
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{(postScore || 0).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Final Score</div>
          </div>
        </div>
        
        {/* Post Preview */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <img 
              src={post.user.profile.avatarUrl || "/default-avatar.png"} 
              alt={post.user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{post.user.username}</span>
                {post.user.profile.verified && (
                  <span className="text-blue-500">✓</span>
                )}
                <span className="text-muted-foreground text-sm">
                  {Math.floor(minutesAgo)} minutes ago
                </span>
              </div>
              <p className="mt-1 text-sm">{post.content}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span>{likes} likes</span>
                <span>{reposts} reposts</span>
                <span>{replies} replies</span>
                <span>{views} views</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              {renderIcon(tab.icon, "w-4 h-4")}
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("target", "w-6 h-6")}
              Overall Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{(postScore || 0).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Final Algorithm Score</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ranked #{currentRank} of {totalPosts} posts
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{((totalPosts - currentRank + 1) / totalPosts * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Percentile Rank</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Higher is better
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalEngagement}</div>
                <div className="text-sm text-muted-foreground">Total Engagement</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {likes} likes, {reposts} reposts, {replies} replies
                </div>
              </div>
            </div>
          </Card>

          {/* Score Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("chart", "w-6 h-6")}
              Score Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderIcon("clock", "w-6 h-6")}
                  <div>
                    <div className="font-medium">Temporal Intelligence</div>
                    <div className="text-sm text-muted-foreground">Time-based scoring and recency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{componentScores.temporal.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">pts</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderIcon("message", "w-6 h-6")}
                  <div>
                    <div className="font-medium">Engagement Quality</div>
                    <div className="text-sm text-muted-foreground">Meaningful interactions and depth</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{componentScores.engagement.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">pts</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderIcon("user", "w-6 h-6")}
                  <div>
                    <div className="font-medium">User Discovery</div>
                    <div className="text-sm text-muted-foreground">Account age, followers, and influence</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{componentScores.userDiscovery.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">pts</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderIcon("document", "w-6 h-6")}
                  <div>
                    <div className="font-medium">Content Quality</div>
                    <div className="text-sm text-muted-foreground">Media, polls, and content value</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{componentScores.content.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">pts</div>
                </div>
              </div>
              
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderIcon("globe", "w-6 h-6")}
                  <div>
                    <div className="font-medium">Network Multiplier</div>
                    <div className="text-sm text-muted-foreground">Relationship and discovery boost</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">×{networkMultiplier.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">multiplier</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Insights */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("lightbulb", "w-6 h-6")}
              Performance Insights
            </h3>
            <div className="space-y-3">
              {currentRank <= 5 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {renderIcon("trophy", "w-5 h-5 text-green-600")}
                    <span className="font-medium text-green-900 dark:text-green-100">Top Performer</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your post is in the top 5! This means it's performing exceptionally well across all algorithm factors.
                  </p>
                </div>
              )}
              
              {replyRatio > 20 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {renderIcon("message", "w-5 h-5 text-blue-600")}
                    <span className="font-medium text-blue-900 dark:text-blue-100">High Engagement Quality</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {replyRatio.toFixed(1)}% of your engagement is replies, showing genuine conversation and interest.
                  </p>
                </div>
              )}
              
              {uniqueEngagers >= 5 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {renderIcon("users", "w-5 h-5 text-purple-600")}
                    <span className="font-medium text-purple-900 dark:text-purple-100">Diverse Engagement</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {uniqueEngagers} different users engaged with your post, showing broad appeal.
                  </p>
                </div>
              )}
              
              {post.user.profile.verified && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600">✓</span>
                    <span className="font-medium text-yellow-900 dark:text-yellow-100">Verified Boost</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your verified status gives you a 1.5x multiplier on your final score.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Complete Calculation Flow */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("calculator", "w-6 h-6")}
              Complete Calculation Flow
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Step 1: Component Scores</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Temporal Intelligence:</span>
                    <span className="font-mono">{componentScores.temporal.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Quality:</span>
                    <span className="font-mono">{componentScores.engagement.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Discovery:</span>
                    <span className="font-mono">{componentScores.userDiscovery.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Quality:</span>
                    <span className="font-mono">{componentScores.content.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Base Score:</span>
                    <span className="font-mono">{componentScores.baseScore.toFixed(1)} pts</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Step 2: Network Adjustment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Network Multiplier:</span>
                    <span className="font-mono">{componentScores.network.toFixed(2)}x</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {(() => {
                      const networkScore = componentScores.network;
                      if (networkScore >= 2.0) {
                        return "Mutual Follow: Strong boost (2.0x) - You follow each other";
                      } else if (networkScore >= 1.5 && networkScore < 2.0) {
                        return "Your Own Post: Standard boost (1.5x) - Self-promotion";
                      } else if (networkScore >= 1.3) {
                        return "Discovery Content: Boosted (1.3x) - New content discovery";
                      } else if (networkScore >= 1.2) {
                        return "Diverse Network: Slight boost (1.2x) - Different interests";
                      } else if (networkScore >= 1.0) {
                        return "One-way Follow: Moderate boost (1.5x) - You follow them";
                      } else {
                        return "Discovery Network: Standard (1.0x) - No connection";
                      }
                    })()}
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Network Adjusted Score:</span>
                    <span className="font-mono">{componentScores.networkAdjustedScore.toFixed(1)} pts</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Step 3: Verified Multiplier</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Verified Status:</span>
                    <span className="font-mono">{post.user.profile.verified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Multiplier:</span>
                    <span className="font-mono">{componentScores.verifiedMultiplier.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 text-primary">
                    <span>Final Algorithm Score:</span>
                    <span className="font-mono">{componentScores.expectedFinalScore.toFixed(1)} pts</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  {renderIcon("check", "w-5 h-5")}
                  Verification
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div>Expected Score: {componentScores.expectedFinalScore.toFixed(1)} pts</div>
                  <div>Actual Score: {(postScore || 0).toFixed(1)} pts</div>
                  <div className="font-bold">
                    {Math.abs((postScore || 0) - componentScores.expectedFinalScore) < 0.1 
                      ? (
                          <span className="flex items-center gap-1">
                            {renderIcon("check", "w-4 h-4 text-green-600")}
                            Perfect Match!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {renderIcon("warning", "w-4 h-4 text-red-600")}
                            Mismatch Detected
                          </span>
                        )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "temporal" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">⏰ Temporal Intelligence</h3>
            <p className="text-muted-foreground mb-6">
              The algorithm rewards fresh content exponentially. Newer posts get massive boosts, while older posts decay naturally.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("calendar", "w-5 h-5")}
                  Your Post's Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Posted:</span>
                    <span className="font-mono">{Math.floor(daysAgo)} days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours ago:</span>
                    <span className="font-mono">{hoursAgo.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minutes ago:</span>
                    <span className="font-mono">{Math.floor(minutesAgo)} minutes</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("target", "w-5 h-5")}
                  Temporal Score
                </h4>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{componentScores.temporal.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Temporal Points</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {renderIcon("chart", "w-5 h-5")}
                How Temporal Scoring Works
              </h4>
              <div className="text-sm space-y-1">
                <div>• <strong>0-10 minutes:</strong> 100 points (maximum boost)</div>
                <div>• <strong>10-30 minutes:</strong> 80 points (high boost)</div>
                <div>• <strong>30-60 minutes:</strong> 60 points (good boost)</div>
                <div>• <strong>1-2 hours:</strong> 40 points (moderate boost)</div>
                <div>• <strong>2-6 hours:</strong> 20 points (low boost)</div>
                <div>• <strong>6-12 hours:</strong> 10 points (minimal boost)</div>
                <div>• <strong>12-24 hours:</strong> 5 points (very low boost)</div>
                <div>• <strong>24+ hours:</strong> 1 point (almost no boost)</div>
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="font-medium text-[var(--accent)] flex items-center gap-1">
                    {renderIcon("zap", "w-4 h-4")}
                    Engagement Velocity Bonus:
                  </div>
                  <div>Posts that gain engagement quickly get up to 3x multiplier</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("lightbulb", "w-5 h-5")}
                Pro Tips
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div>• Post during peak hours for maximum temporal boost</div>
                <div>• Fresh content gets 100x more visibility than old content</div>
                <div>• The algorithm heavily favors recent posts in the feed</div>
                <div>• Timing is crucial for viral potential</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "engagement" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("message", "w-6 h-6")}
              Engagement Quality
            </h3>
            <p className="text-muted-foreground mb-6">
              The algorithm analyzes not just how many interactions you get, but the quality and depth of those interactions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("chart", "w-5 h-5")}
                  Your Engagement Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("heart", "w-5 h-5")}
                      <span>Likes</span>
                    </div>
                    <span className="font-bold">{likes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("repeat", "w-4 h-4")}
                      <span>Reposts</span>
                    </div>
                    <span className="font-bold">{reposts}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("message", "w-5 h-5")}
                      <span>Replies</span>
                    </div>
                    <span className="font-bold">{replies}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("eye", "w-5 h-5")}
                      <span>Views</span>
                    </div>
                    <span className="font-bold">{views}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("target", "w-5 h-5")}
                  Engagement Score
                </h4>
                <div className="text-center p-4 bg-primary/10 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-primary">{componentScores.engagement.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Engagement Points</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Engagement:</span>
                    <span className="font-mono">{totalEngagement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Engagers:</span>
                    <span className="font-mono">{uniqueEngagers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reply Ratio:</span>
                    <span className="font-mono">{replyRatio.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Velocity:</span>
                    <span className="font-mono">{engagementVelocity.toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {renderIcon("chart", "w-5 h-5")}
                Engagement Value Weights
              </h4>
              <div className="text-sm space-y-1">
                <div>• <strong>Replies:</strong> 25.0 points each (most valuable - shows genuine interest)</div>
                <div>• <strong>Reposts:</strong> 15.0 points each (high value - content worth sharing)</div>
                <div>• <strong>Likes:</strong> 5.0 points each (standard value - basic appreciation)</div>
                <div>• <strong>Views:</strong> 0.5 points each (minimal value - passive consumption)</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("search", "w-5 h-5")}
                How Your Engagement Score is Calculated
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <div><strong>Basic Engagement Score:</strong></div>
                <div className="ml-4">• Likes: {likes} × 5.0 = {(likes * 5.0).toFixed(1)} points</div>
                <div className="ml-4">• Reposts: {reposts} × 15.0 = {(reposts * 15.0).toFixed(1)} points</div>
                <div className="ml-4">• Replies: {replies} × 25.0 = {(replies * 25.0).toFixed(1)} points</div>
                <div className="ml-4">• Views: {views} × 0.5 = {(views * 0.5).toFixed(1)} points</div>
                <div className="ml-4 font-bold">• Subtotal: {((likes * 5.0) + (reposts * 15.0) + (replies * 25.0) + (views * 0.5)).toFixed(1)} points</div>
                
                <div className="mt-3"><strong>Authenticity Multiplier:</strong></div>
                <div className="ml-4">• Unique Engagers: {uniqueEngagers} users</div>
                <div className="ml-4">• Multiplier: {(1.0 + (uniqueEngagers * 0.05)).toFixed(2)}x (1.0x base + 0.05x per engager)</div>
                <div className="ml-4 font-bold">• Final Score: {(((likes * 5.0) + (reposts * 15.0) + (replies * 25.0) + (views * 0.5)) * (1.0 + (uniqueEngagers * 0.05))).toFixed(1)} points</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-green-900 dark:text-green-100 flex items-center gap-2">
                {renderIcon("lightbulb", "w-5 h-5")}
                Pro Tips
              </h4>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <div>• Ask questions to encourage replies (5x more valuable than likes)</div>
                <div>• Create shareable content to get reposts (3x more valuable than likes)</div>
                <div>• Focus on quality over quantity - meaningful interactions matter more</div>
                <div>• Diverse engagement types (likes + reposts + replies) get authenticity bonuses</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "user" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("user", "w-6 h-6")}
              User Profile Analysis
            </h3>
            <p className="text-muted-foreground mb-6">
              The algorithm balances helping new creators get discovered while rewarding established users for their influence.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("chart", "w-5 h-5")}
                  Your Profile Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("calendar", "w-5 h-5")}
                      <span>Account Age</span>
                    </div>
                    <span className="font-bold">{userEngagement.accountAge} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("users", "w-5 h-5")}
                      <span>Followers</span>
                    </div>
                    <span className="font-bold">{userEngagement.followerCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("document", "w-5 h-5")}
                      <span>Posts</span>
                    </div>
                    <span className="font-bold">{userEngagement.postsCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("chart", "w-5 h-5")}
                      <span>Avg Engagement Rate</span>
                    </div>
                    <span className="font-bold">{userEngagement.avgEngagementRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("target", "w-5 h-5")}
                  User Discovery Score
                </h4>
                <div className="text-center p-4 bg-primary/10 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-primary">{componentScores.userDiscovery.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">User Points</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Profile Type:</span>
                    <span className="font-mono">{post.user.profile.profileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified:</span>
                    <span className="font-mono">{post.user.profile.verified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Follower Boost:</span>
                    <span className="font-mono">+{(userEngagement.followerCount * 0.1).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {renderIcon("chart", "w-5 h-5")}
                User Discovery Weights
              </h4>
              <div className="text-sm space-y-1">
                <div>• <strong>New User (0-30 days):</strong> 50 points (massive boost for new creators)</div>
                <div>• <strong>Growing User (30-180 days):</strong> 30 points (strong boost for growing creators)</div>
                <div>• <strong>Established User (180+ days):</strong> 10 points (moderate boost for established users)</div>
                <div>• <strong>Follower Count:</strong> 0.1 points per follower (linear relationship)</div>
                <div>• <strong>Verified Users:</strong> 1.5x multiplier on final score</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("lightbulb", "w-5 h-5")}
                Pro Tips
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div>• New creators get massive boosts to help them get discovered</div>
                <div>• Each follower adds 0.1 points to every post you make</div>
                <div>• Verified users get a 1.5x multiplier on their final score</div>
                <div>• The algorithm ensures small creators can compete with big accounts</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("document", "w-6 h-6")}
              Content Quality
            </h3>
            <p className="text-muted-foreground mb-6">
              The algorithm rewards high-quality content including media, interactive elements, and optimal content length.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("chart", "w-5 h-5")}
                  Your Content Analysis
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("document", "w-5 h-5")}
                      <span>Content Length</span>
                    </div>
                    <span className="font-bold">{post.content.length} chars</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("image", "w-5 h-5")}
                      <span>Media Files</span>
                    </div>
                    <span className="font-bold">{post.media.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("chart", "w-5 h-5")}
                      <span>Poll</span>
                    </div>
                    <span className="font-bold">{post.poll ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("tag", "w-5 h-5")}
                      <span>Hashtags</span>
                    </div>
                    <span className="font-bold">{post.content.match(/#\w+/g)?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("target", "w-5 h-5")}
                  Content Score
                </h4>
                <div className="text-center p-4 bg-primary/10 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-primary">{componentScores.content.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Content Points</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Has Media:</span>
                    <span className="font-mono">{post.media.length > 0 ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Has Poll:</span>
                    <span className="font-mono">{post.poll ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimal Length:</span>
                    <span className="font-mono">{post.content.length >= 50 && post.content.length <= 500 ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Quality:</span>
                    <span className="font-mono">Algorithm Score</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("chart", "w-5 h-5")}
                Content Quality Breakdown
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
                {contentBreakdown && contentBreakdown.media ? (
                  <>
                    <div><strong>Media: {contentBreakdown.media.points.toFixed(1)} points</strong></div>
                    <div className="ml-4 text-xs">{contentBreakdown.media.explanation}</div>
                    
                    <div><strong>Poll: {contentBreakdown.poll.points.toFixed(1)} points</strong></div>
                    <div className="ml-4 text-xs">{contentBreakdown.poll.explanation}</div>
                    
                    <div><strong>Length: {contentBreakdown.length.points.toFixed(1)} points</strong></div>
                    <div className="ml-4 text-xs">{contentBreakdown.length.explanation}</div>
                    
                    <div><strong>Originality: {contentBreakdown.originality.points.toFixed(1)} points</strong></div>
                    <div className="ml-4 text-xs">{contentBreakdown.originality.explanation}</div>
                    
                    <div className="mt-3 font-bold border-t pt-2"><strong>Total Content Score: {componentScores.content.toFixed(1)} points</strong></div>
                  </>
                ) : (
                  <div>Content breakdown not available</div>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("search", "w-5 h-5")}
                Content Score Analysis
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <div><strong>What We Can See:</strong></div>
                <div className="ml-4">• Media Content: {post.media.length > 0 ? "Yes (+15)" : "No (0)"} points</div>
                <div className="ml-4">• Interactive Poll: {post.poll ? "Yes (+12)" : "No (0)"} points</div>
                <div className="ml-4">• Optimal Length: {post.content.length >= 50 && post.content.length <= 500 ? "Yes (+8)" : "No (0)"} points</div>
                
                <div className="mt-3"><strong>Real Algorithm Score:</strong></div>
                <div className="ml-4 font-bold">• Total: {componentScores.content.toFixed(1)} points (from actual algorithm)</div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  <div><strong>Note:</strong> The algorithm's content scoring includes complex heuristics for:</div>
                  <div>• Content originality and uniqueness detection</div>
                  <div>• Spam pattern analysis</div>
                  <div>• Content quality assessment</div>
                  <div>• Other factors not visible in the simple breakdown above</div>
                  <div className="mt-2 font-medium">The {componentScores.content.toFixed(1)} points shown is the real score from the algorithm.</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-green-900 dark:text-green-100 flex items-center gap-2">
                {renderIcon("lightbulb", "w-5 h-5")}
                Pro Tips
              </h4>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <div>• Add media to your posts for a 15-point boost</div>
                <div>• Create polls to encourage interaction (+12 points)</div>
                <div>• Keep content between 50-500 characters for optimal length bonus</div>
                <div>• Original, unique content gets the highest rewards</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "network" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {renderIcon("globe", "w-6 h-6")}
              Network Analysis
            </h3>
            <p className="text-muted-foreground mb-6">
              The algorithm uses network relationships to prevent echo chambers and promote diverse content discovery.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("chart", "w-5 h-5")}
                  Your Network Status
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("user", "w-5 h-5")}
                      <span>Post Owner</span>
                    </div>
                    <span className="font-bold">{post.user.username}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("link", "w-5 h-5")}
                      <span>Relationship</span>
                    </div>
                    <span className="font-bold">{post.userId === currentUserId ? "Your Post" : "Other User"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {renderIcon("trending", "w-5 h-5")}
                      <span>Network Multiplier</span>
                    </div>
                    <span className="font-bold">×{networkMultiplier.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {renderIcon("target", "w-5 h-5")}
                  Network Score
                </h4>
                <div className="text-center p-4 bg-primary/10 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-primary">{networkMultiplier.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Network Multiplier</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Score:</span>
                    <span className="font-mono">{baseScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Boost:</span>
                    <span className="font-mono">×{networkMultiplier.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Score:</span>
                    <span className="font-mono">{(baseScore * networkMultiplier).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {renderIcon("chart", "w-5 h-5")}
                Network Multipliers
              </h4>
              <div className="text-sm space-y-1">
                <div>• <strong>Your Own Posts:</strong> 1.5x multiplier (encourages personal content)</div>
                <div>• <strong>Mutual Follows:</strong> 2.0x multiplier (strong boost for close connections)</div>
                <div>• <strong>One-way Follows:</strong> 1.5x multiplier (moderate boost for followed users)</div>
                <div>• <strong>Discovery Network:</strong> 1.0x multiplier (standard boost for new content)</div>
                <div>• <strong>Diverse Network:</strong> 1.2x multiplier (slight boost for different interests)</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                {renderIcon("lightbulb", "w-5 h-5")}
                Pro Tips
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div>• Your own posts get a 1.5x boost to encourage personal content</div>
                <div>• The algorithm forces 30% of feed to be discovery content</div>
                <div>• Network diversity prevents echo chambers</div>
                <div>• Mutual follows get the strongest network boost</div>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}