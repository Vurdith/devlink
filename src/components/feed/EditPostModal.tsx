"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { BaseModal, ModalTextarea, Tooltip } from "@/components/ui/BaseModal";
import { cn } from "@/lib/cn";

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

  if (!post) return null;

  const footer = (
    <div className="flex gap-3">
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
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        isLoading={isSubmitting}
        className="flex-1"
      >
        Save Changes
      </Button>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Post"
        size="md"
        footer={footer}
        contentClassName="px-5 py-4"
      >
        <div className="space-y-4">
          <div>
            <ModalTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the Roblox dev world?"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={cn(
                "text-xs",
                content.length > 450 ? "text-amber-400" : content.length > 480 ? "text-red-400" : "text-[var(--muted-foreground)]"
              )}>
                {content.length}/500
              </span>
              
              {/* Progress ring */}
              <Tooltip content={`${500 - content.length} characters remaining`}>
                <div className="relative w-5 h-5">
                  <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-white/10"
                    />
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray={`${(content.length / 500) * 62.83} 62.83`}
                      className={cn(
                        "transition-all",
                        content.length > 480 ? "text-red-400" : content.length > 450 ? "text-amber-400" : "text-purple-400"
                      )}
                    />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/70">Media URLs (one per line)</label>
            <ModalTextarea
              value={mediaUrls.join('\n')}
              onChange={(e) => setMediaUrls(e.target.value.split('\n').filter(url => url.trim()))}
              placeholder="Enter media URLs, one per line (optional)"
              rows={3}
            />
            <div className="text-xs text-[var(--muted-foreground)] mt-1.5">
              {mediaUrls.filter(url => url.trim()).length} media items
            </div>
          </div>
        </div>
      </BaseModal>

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
