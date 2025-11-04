"use client";
import PostDetail from "@/components/feed/PostDetail";
import { CreatePost } from "@/components/feed/CreatePost";
import { useEffect, useState } from "react";

interface PostPageContentProps {
  post: any;
  replies: any[];
  currentUserId?: string;
  currentUserProfile?: {
    avatarUrl: string | null;
    name: string;
    username: string;
  } | null;
}

export function PostPageContent({ post, replies, currentUserId, currentUserProfile }: PostPageContentProps) {
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handlePostCreated = () => {
    // Refresh the page to show new replies
    window.location.reload();
  };

  // Handle reply anchors for direct links to specific replies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#reply-')) {
        const replyId = hash.replace('#reply-', '');
        setExpandedReplies(prev => new Set([...prev, replyId]));
        
        const replyElement = document.getElementById(`reply-${replyId}`);
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          replyElement.classList.add('ring-2', 'ring-[var(--accent)]', 'ring-opacity-50');
          setTimeout(() => {
            replyElement.classList.remove('ring-2', 'ring-[var(--accent)]', 'ring-opacity-50');
          }, 3000);
        }
      }
    }
  }, []);

  const toggleReplyExpansion = (replyId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  const renderReplies = (replyList: any[], level: number = 0) => {
    if (!replyList || replyList.length === 0) return null;

    return (
      <div className={`space-y-3 ${level > 0 ? 'ml-6' : ''}`}>
        {replyList.map((reply) => {
          const hasReplies = reply.replies && reply.replies.length > 0;
          const isExpanded = expandedReplies.has(reply.id);
          
          return (
            <div key={reply.id} id={`reply-${reply.id}`} className="relative">
              {/* Reply content */}
              <PostDetail post={reply} isOnPostPage={false} />
              
              {/* Show nested replies if expanded */}
              {hasReplies && isExpanded && (
                <div className="mt-3">
                  {renderReplies(reply.replies, level + 1)}
                </div>
              )}
              
              {/* Expand/collapse button for replies with nested replies */}
              {hasReplies && (
                <button
                  onClick={() => toggleReplyExpansion(reply.id)}
                  className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Hide {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Show {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Always show the original post at the top */}
      <div className="mb-6">
        <PostDetail post={post} isOnPostPage={true} />
      </div>

      {/* Reply form */}
      {currentUserId && currentUserProfile && (
        <div className="mb-6">
          <CreatePost 
            replyToId={post.id}
            placeholder="Post your reply..."
            buttonText="Reply"
            onPostCreated={handlePostCreated}
            currentUserProfile={currentUserProfile}
          />
        </div>
      )}

      {/* All replies */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--accent)]/60"></div>
            Replies ({replies.length})
          </h3>
          
          {renderReplies(replies)}
        </div>
      )}
    </main>
  );
}
