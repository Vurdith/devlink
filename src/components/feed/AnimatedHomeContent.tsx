"use client";
import { motion } from "framer-motion";
import { CreatePost } from "./CreatePost";
import { PostFeed } from "./PostFeed";
// import { AlgorithmSidebar } from "./AlgorithmSidebar";
// import { useAlgorithmicFeed } from "@/hooks/useAlgorithmicFeed";

interface AnimatedHomeContentProps {
  session: any;
  currentUserProfile: any;
  postsWithViewCounts: any[];
}

export function AnimatedHomeContent({ session, currentUserProfile, postsWithViewCounts }: AnimatedHomeContentProps) {
  // Use the posts that were already processed by the server-side algorithm
  const algorithmicPosts = postsWithViewCounts || [];
  const loading = false;
  const error = null;
  const metadata = null;
  const hasMore = false;
  
  const refresh = () => {
    window.location.reload();
  };
  
  const loadMore = () => {
    // Load more functionality can be added later
  };
  return (
    <>
      {!session && (
        <motion.div 
          className="pt-20 pb-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="glass rounded-3xl p-12 max-w-6xl mx-auto border border-white/10 hover:border-purple-500/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-center gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.img
                src="/logo/logo.png"
                alt="DevLink"
                className="w-20 h-20 object-contain"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.7, type: "spring", stiffness: 150 }}
              />
              <motion.h1 
                className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                DevLink
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              The pulse of the Roblox development community
            </motion.p>
            
            <motion.p 
              className="text-xl text-gray-300 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Join thousands of developers, clients, and influencers building the future of Roblox
            </motion.p>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {[
                { icon: "monitor", title: "Developers", desc: "Showcase your work", color: "blue" },
                { icon: "briefcase", title: "Clients", desc: "Find talent", color: "green" },
                { icon: "bell", title: "Influencers", desc: "Promote projects", color: "purple" }
              ].map((item, index) => (
                <motion.div 
                  key={item.title}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-${item.color}-500/30`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={`text-${item.color}-400`}>
                      {item.icon === "monitor" && (
                        <>
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      )}
                      {item.icon === "briefcase" && (
                        <>
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      )}
                      {item.icon === "bell" && (
                        <>
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      )}
                    </svg>
                  </motion.div>
                  <div className="text-2xl font-semibold mb-3 text-white">{item.title}</div>
                  <div className="text-gray-400">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Post Section - Enhanced */}
      {session && currentUserProfile && (
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="relative">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
            
            {/* Enhanced create post container */}
            <div className="relative glass rounded-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 glow shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-300">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create Post</h2>
                </div>
              </div>
              
              <CreatePost currentUserProfile={{
                avatarUrl: currentUserProfile.profile?.avatarUrl,
                name: currentUserProfile.name,
                username: currentUserProfile.username
              }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Feed Section */}
      <motion.div 
        className="mb-32 pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        
        {/* Algorithm Sidebar - Hidden */}
        {/* <AlgorithmSidebar
          weights={metadata?.weights}
          metadata={metadata}
        /> */}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-2">Loading algorithmic feed...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Error loading feed: {error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Posts Feed */}
        {!loading && !error && (
          <PostFeed 
            posts={algorithmicPosts} 
            currentUserId={currentUserProfile?.id}
            hidePinnedIndicator={true}
            showNavigationArrow={false}
          />
        )}
        
        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
