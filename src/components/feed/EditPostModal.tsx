"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

interface EditPostModalProps {
  post: {
    id: string;
    content: string;
    media: Array<{
      id: string;
      mediaUrl: string;
      mediaType: string;
      order: number;
    }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: string, content: string, mediaUrls: string[]) => void;
}

export function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setMediaUrls(post.media?.map(m => m.mediaUrl) || []);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrls: mediaUrls.filter(url => url.trim()),
        }),
      });

      if (response.ok) {
        setToastMessage("Post updated successfully");
        setToastType("success");
        setShowToast(true);
        onSave(post.id, content.trim(), mediaUrls.filter(url => url.trim()));
        onClose();
      } else {
        const error = await response.json();
        setToastMessage(error.error || "Failed to update post");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage("Failed to update post");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-black/90 border border-white/20 rounded-lg w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Post</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in the Roblox dev world?"
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder:text-[var(--muted-foreground)] resize-none min-h-[100px] outline-none focus:border-[var(--accent)]"
                maxLength={500}
              />
              <div className="text-right text-xs text-[var(--muted-foreground)] mt-1">
                {content.length}/500
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Media URLs (one per line)</label>
              <textarea
                value={mediaUrls.join('\n')}
                onChange={(e) => setMediaUrls(e.target.value.split('\n').filter(url => url.trim()))}
                placeholder="Enter media URLs, one per line (optional)"
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder:text-[var(--muted-foreground)] resize-none min-h-[80px] outline-none focus:border-[var(--accent)]"
              />
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                {mediaUrls.filter(url => url.trim()).length} media items
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
