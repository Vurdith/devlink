"use client";
import PostDetail from "@/components/feed/PostDetail";
import { CreatePost } from "@/components/feed/CreatePost";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handlePostCreated = () => {
    // Refresh server data without a full reload (keeps the app feeling snappy)
    router.refresh();
  };

  // Handle reply anchors for direct links to specific replies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#reply-')) {
        const replyId = hash.replace('#reply-', '');
        
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Original post */}
      <PostDetail post={post} isOnPostPage={true} />

      {/* Reply form */}
      {currentUserId && currentUserProfile && (
        <div className="mt-3">
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
        <section className="mt-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-white/80 tracking-wide">
              Replies <span className="text-white/40 font-medium">({replies.length})</span>
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          </div>

          {/* Thread rail + replies */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent"
            />
            <div className="space-y-0">
              {replies.map((reply) => (
                <div key={reply.id} id={`reply-${reply.id}`} className="relative pl-4">
                  <PostDetail post={reply} isOnPostPage={false} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
