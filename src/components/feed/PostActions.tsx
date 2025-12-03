"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

interface PostActionsProps {
  post: {
    id: string;
    userId: string;
    content: string;
    media: Array<{
      id: string;
      mediaUrl: string;
      mediaType: string;
      order: number;
    }>;
    isPinned?: boolean;
    replyToId?: string | null;
  };
  currentUserId?: string;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onPinToggle?: (postId: string, pin: boolean) => void;
}

export function PostActions({ post, currentUserId, onEdit, onDelete, onPinToggle }: PostActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwnPost = currentUserId === post.userId;
  const isOriginalPost = !post.replyToId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        setToastMessage("Post deleted successfully");
        setToastType("success");
        setShowToast(true);
        onDelete?.(post.id);
        setIsOpen(false);
      } else {
        const error = await response.json();
        setToastMessage(error.error || "Failed to delete post");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage("Failed to delete post");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handlePinToggle = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: !post.isPinned }),
      });

      if (response.ok) {
        const data = await response.json();
        setToastMessage(data.isPinned ? "Post pinned successfully" : "Post unpinned successfully");
        setToastType("success");
        setShowToast(true);
        onPinToggle?.(post.id, data.isPinned);
        setIsOpen(false);
      } else {
        const error = await response.json();
        setToastMessage(error.error || "Failed to pin post");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage("Failed to pin post");
      setToastType("error");
      setShowToast(true);
    }
  };

  // Show actions for all users, but different options based on ownership

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          aria-label="Post options menu"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-[var(--muted-foreground)] hover:text-white"
          title="More options"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="19" cy="12" r="1" fill="currentColor"/>
            <circle cx="5" cy="12" r="1" fill="currentColor"/>
          </svg>
        </button>

        {isOpen && (
          <div 
            role="menu"
            aria-label="Post actions"
            className="absolute right-0 top-full mt-2 w-48 bg-[#0d0d12] border border-white/10 rounded-xl shadow-xl z-50"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div 
              className="py-2"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
                              {isOwnPost && onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(post.id);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </button>
              )}

                              {isOwnPost && isOriginalPost && onPinToggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinToggle();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {post.isPinned ? "Unpin" : "Pin"}
                </button>
              )}

                              {isOwnPost && onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[var(--color-accent)]/20 transition-colors flex items-center gap-2"
                  >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete
                </button>
              )}

              {/* Report button for non-owners */}
              {!isOwnPost && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open report form
                    window.location.href = `/report?postId=${post.id}`;
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[var(--color-accent)]/20 transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Report
                </button>
              )}
            </div>
          </div>
        )}
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
