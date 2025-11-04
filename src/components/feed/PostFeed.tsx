"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostDetail from "./PostDetail";
import { memo } from "react";
import { FeedSkeleton } from "@/components/ui/LoadingSpinner";

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      avatarUrl: string | null;
      profileType: string;
      verified: boolean;
    };
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    order: number;
  }>;
  isSlideshow: boolean;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      isSelected?: boolean;
    }>;
    isMultiple: boolean;
    expiresAt: Date;
    totalVotes: number;
  };
  likes: Array<{ id: string; userId: string }>;
  reposts: Array<{ id: string; userId: string }>;
  replies: Array<any>;
  views: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isPinned: boolean;
  userVote?: {
    optionIds: string[];
  };
}

interface PostFeedProps {
  posts: Post[];
  currentUserId?: string;
  hidePinnedIndicator?: boolean;
  showNavigationArrow?: boolean;
  isLoading?: boolean;
}

export const PostFeed = memo(function PostFeed({ posts, currentUserId, hidePinnedIndicator = false, showNavigationArrow = true, isLoading = false }: PostFeedProps) {
  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
        <p className="text-gray-400">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              delay: Math.min(index * 0.05, 0.3), // Reduced delay and capped
              ease: "easeOut"
            }}
            layout={false} // Disable layout animations for better performance
          >
            <PostDetail
              post={post}
              showPinnedTag={!hidePinnedIndicator}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
