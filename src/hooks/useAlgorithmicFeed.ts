"use client";
import { useState, useEffect, useCallback } from "react";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      profileType: string;
      verified: boolean;
    };
  };
  likes: Array<{ id: string; userId: string }>;
  reposts: Array<{ id: string; userId: string }>;
  replies: Array<{ id: string; userId: string }>;
  views: Array<{ id: string; userId: string }>;
  isPinned: boolean;
  isSlideshow: boolean;
  media: Array<{ id: string; mediaUrl: string; mediaType: string }>;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      isSelected?: boolean;
    }>;
    totalVotes: number;
    expiresAt: string;
    isMultiple: boolean;
  };
}

interface FeedMetadata {
  algorithm: string;
  totalPosts: number;
  rankedPosts: number;
  weights: Record<string, number>;
  userEngagements: number;
  followingCount: number;
}

interface UseAlgorithmicFeedReturn {
  posts: Post[];
  metadata: FeedMetadata | null;
  loading: boolean;
  error: string | null;
  algorithm: string;
  setAlgorithm: (algorithm: string) => void;
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useAlgorithmicFeed(
  initialAlgorithm: string = 'personalized',
  limit: number = 20
): UseAlgorithmicFeedReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [metadata, setMetadata] = useState<FeedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState(initialAlgorithm);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (
    algorithmType: string, 
    currentOffset: number = 0, 
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        algorithm: algorithmType,
        limit: limit.toString(),
        offset: currentOffset.toString()
      });

      const response = await fetch(`/api/feed/algorithm?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setMetadata(data.metadata);
      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + data.posts.length);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      console.error('Error fetching algorithmic feed:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const handleAlgorithmChange = useCallback((newAlgorithm: string) => {
    setAlgorithm(newAlgorithm);
    setOffset(0);
    setHasMore(true);
    fetchPosts(newAlgorithm, 0, false);
  }, [fetchPosts]);

  const refresh = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchPosts(algorithm, 0, false);
  }, [algorithm, fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(algorithm, offset, true);
    }
  }, [loading, hasMore, algorithm, offset, fetchPosts]);

  // Initial load
  useEffect(() => {
    fetchPosts(algorithm, 0, false);
  }, [algorithm, fetchPosts]);

  // Handle algorithm changes
  useEffect(() => {
    if (algorithm !== initialAlgorithm) {
      handleAlgorithmChange(algorithm);
    }
  }, [algorithm, initialAlgorithm, handleAlgorithmChange]);

  return {
    posts,
    metadata,
    loading,
    error,
    algorithm,
    setAlgorithm: handleAlgorithmChange,
    refresh,
    loadMore,
    hasMore
  };
}

