"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AlgorithmSidebarProps {
  weights?: Record<string, number>;
  metadata?: {
    totalPosts: number;
    rankedPosts: number;
    userEngagements: number;
    followingCount: number;
  };
}

export function AlgorithmSidebar({ weights, metadata }: AlgorithmSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="fixed left-72 top-20 z-40"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg 
          className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute left-16 top-0 w-80 glass rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Feed Algorithm</h3>
                <p className="text-sm text-gray-400">Discovery-focused ranking</p>
              </div>
            </div>

            {/* Algorithm Weights */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-3 text-sm">Engagement Weights</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Likes</span>
                    <span className="text-white font-mono text-sm">{weights?.likes || 0.8}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Reposts</span>
                    <span className="text-white font-mono text-sm">{weights?.reposts || 1.5}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Replies</span>
                    <span className="text-white font-mono text-sm">{weights?.replies || 2.0}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Views</span>
                    <span className="text-white font-mono text-sm">{weights?.views || 0.05}x</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-medium mb-3 text-sm">Discovery Factors</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Recency</span>
                    <span className="text-white font-mono text-sm">{weights?.recency || 3.0}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Verified</span>
                    <span className="text-white font-mono text-sm">{weights?.verified || 0.8}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Followers</span>
                    <span className="text-white font-mono text-sm">{weights?.followerCount || 0.1}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Media</span>
                    <span className="text-white font-mono text-sm">{weights?.hasMedia || 1.0}x</span>
                  </div>
                </div>
              </div>

              {/* Feed Stats */}
              {metadata && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-medium mb-3 text-sm">Feed Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Posts Analyzed</span>
                      <span className="text-white font-mono text-sm">{metadata.totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Ranked Posts</span>
                      <span className="text-white font-mono text-sm">{metadata.rankedPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Following</span>
                      <span className="text-white font-mono text-sm">{metadata.followingCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discovery Info */}
              <div className="border-t border-white/10 pt-4">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <strong>Discovery Focus:</strong> This algorithm helps smaller creators get discovered. 
                    Recent posts get strong boosts while follower count has minimal impact.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
