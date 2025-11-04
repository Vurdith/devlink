
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  links?: string;
  mediaUrls?: string;
  tags?: string;
  isPublic: boolean;
  createdAt: string;
}

interface PortfolioItemDisplayProps {
  item: PortfolioItem;
  isOwner: boolean;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (itemId: string) => void;
}

export function PortfolioItemDisplay({
  item,
  isOwner,
  onEdit,
  onDelete,
}: PortfolioItemDisplayProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mousePos, setMousePos] = useState({ imageX: 0, imageY: 0 });
  const rafRef = React.useRef<number | null>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(item.id);
      }
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Parse comma-separated URLs
  const parseUrls = (urlString?: string): string[] => {
    if (!urlString) return [];
    return urlString.split(",").map((url) => url.trim()).filter(Boolean);
  };

  // Parse tags
  const parseTags = (tagString?: string): string[] => {
    if (!tagString) return [];
    return tagString.split(",").map((tag) => tag.trim()).filter(Boolean);
  };

  // Capitalize first letter of category
  const capitalizeCategory = (cat?: string): string => {
    if (!cat) return "";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const mediaUrls = parseUrls(item.mediaUrls);
  const links = parseUrls(item.links);
  const tags = parseTags(item.tags);

  const goToPrevious = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? mediaUrls.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentMediaIndex((prev) =>
      prev === mediaUrls.length - 1 ? 0 : prev + 1
    );
  };

  const currentMediaUrl = mediaUrls[currentMediaIndex];

  return (
    <div className="group relative glass rounded-[var(--radius)] border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all">
      {/* Media Gallery */}
      {mediaUrls.length > 0 && (
        <div className="w-full h-[28rem] bg-gradient-to-br from-purple-500/10 to-blue-500/10 overflow-hidden flex items-center justify-center relative group">
          {/* Current Media */}
          <div 
            className="w-full h-full flex items-center justify-center bg-[var(--muted)]/20 cursor-pointer hover:bg-[var(--muted)]/30 transition-colors"
            onClick={() => setShowMediaModal(true)}
            title="Click to expand"
          >
            <img
              src={currentMediaUrl}
              alt={`${item.title} - media ${currentMediaIndex + 1}`}
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          </div>

          {/* Navigation Arrows */}
          {mediaUrls.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {mediaUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentMediaIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    title={`Go to media ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              {item.title}
            </h3>
            {item.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)] rounded-full mb-2">
                {capitalizeCategory(item.category)}
              </span>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-[var(--accent)]/25 hover:text-[var(--accent)] text-[var(--muted-foreground)] rounded-md transition-colors"
                title="Edit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                title="Delete"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h16zM10 11v6M14 11v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-[var(--muted-foreground)] mb-5 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/hashtag/${tag}`)}
                className="px-2 py-1 text-xs bg-[var(--muted)]/30 text-[var(--muted-foreground)] hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {links.map((link, idx) => {
              let displayText = "View";
              if (
                link.includes("github")
              ) {
                displayText = "GitHub";
              } else if (link.includes("demo")) {
                displayText = "Demo";
              } else if (link.includes("live")) {
                displayText = "Live";
              }
              return (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)] rounded-full hover:bg-[var(--accent)]/30 transition-colors"
                >
                  {displayText}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H7m10 0v10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              );
            })}
          </div>
        )}

        {/* Privacy Status */}
        {!item.isPublic && (
          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Private
          </div>
        )}
      </div>

      {/* Media Modal */}
      {showMediaModal && mediaUrls.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMediaModal(false)}
        >
          <div 
            className="relative w-full max-w-full max-h-[95vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media and Navigation Row */}
            <div
              className="flex items-center justify-center w-full flex-1"
              onMouseMove={(e) => {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                const imageRect = imageRef.current?.getBoundingClientRect();
                rafRef.current = requestAnimationFrame(() => {
                  if (imageRect) {
                    setMousePos({ 
                      imageX: e.clientX - imageRect.left, 
                      imageY: e.clientY - imageRect.top,
                      viewportX: e.clientX,
                      viewportY: e.clientY
                    } as any);
                  }
                  setShowMagnifier(true);
                });
              }}
              onMouseLeave={() => {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                setShowMagnifier(false);
              }}
            >
              {/* Media Container */}
              <div className="relative flex items-center justify-center w-full h-full">
                <img
                  src={currentMediaUrl}
                  alt={`${item.title} - media ${currentMediaIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxWidth: '1920px', maxHeight: '1080px' }}
                  ref={imageRef}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />

                {/* Magnifying Glass */}
                {showMagnifier && imageRef.current && (
                  <div
                    className="fixed w-24 h-24 rounded-full border-2 border-yellow-400/70 pointer-events-none overflow-hidden shadow-lg z-[60] bg-black/20"
                    style={{
                      left: `${(mousePos as any).viewportX - 48}px`,
                      top: `${(mousePos as any).viewportY - 48}px`,
                      willChange: 'left, top',
                      contain: 'layout style paint',
                      backgroundImage: `url(${currentMediaUrl})`,
                      backgroundSize: `${imageRef.current.naturalWidth * 1.5}px ${imageRef.current.naturalHeight * 1.5}px`,
                      backgroundPosition: `${-(mousePos.imageX * (imageRef.current.naturalWidth / imageRef.current.width)) * 1.5 + 48}px ${-(mousePos.imageY * (imageRef.current.naturalHeight / imageRef.current.height)) * 1.5 + 48}px`,
                      backgroundRepeat: 'no-repeat',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/50 text-white text-sm rounded-full">
              {/* Previous Button */}
              {mediaUrls.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                  title="Previous"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              {/* Media Counter */}
              {mediaUrls.length > 1 && (
                <div className="px-2">
                  {currentMediaIndex + 1} / {mediaUrls.length}
                </div>
              )}

              {/* Next Button */}
              {mediaUrls.length > 1 && (
                <button
                  onClick={goToNext}
                  className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                  title="Next"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              {/* Close Button */}
              <div className="w-px h-6 bg-white/20" />
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--card)] border border-purple-500/20 rounded-[var(--radius)] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Delete Portfolio Item?</h3>
            <p className="text-[var(--muted-foreground)] mb-6 text-sm">
              This action cannot be undone. The portfolio item "{item.title}"
              will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-md border border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 rounded-md transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
