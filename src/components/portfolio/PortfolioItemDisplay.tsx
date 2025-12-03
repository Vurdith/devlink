
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);
  const router = useRouter();

  // Reset zoom when modal opens/closes or image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [showMediaModal, currentMediaIndex]);

  // Handle keyboard shortcuts for zoom modal
  useEffect(() => {
    if (!showMediaModal) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMediaModal(false);
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel(prev => Math.min(prev + 0.5, 5));
      } else if (e.key === "-") {
        setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
      } else if (e.key === "0") {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMediaModal]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoomLevel, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  }, []);

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
    <div className="group relative bg-[#0d0d12] rounded-[var(--radius)] border border-[var(--color-accent)]/20 overflow-hidden hover:border-[var(--color-accent)]/40 transition-all">
      {/* Media Gallery */}
      {mediaUrls.length > 0 && (
        <div className="w-full h-[28rem] bg-gradient-to-br from-[var(--color-accent)]/10 to-blue-500/10 overflow-hidden flex items-center justify-center relative group">
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)] rounded-full mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {capitalizeCategory(item.category)}
              </span>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="p-2.5 text-[var(--muted-foreground)] rounded-lg border border-transparent transition-all duration-200 hover:bg-[var(--accent)]/30 hover:text-[var(--accent)] hover:scale-110 hover:border-[var(--accent)] hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95"
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
                className="p-2.5 text-[var(--muted-foreground)] rounded-lg transition-all duration-200 hover:bg-[var(--color-accent)]/20 hover:text-red-400 hover:scale-110 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 active:scale-95"
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
                className="px-3 py-1.5 text-xs font-medium bg-[var(--muted)]/30 text-[var(--muted-foreground)] rounded-full border border-[var(--border)] cursor-pointer transition-all duration-200 hover:bg-[var(--accent)]/25 hover:text-[var(--accent)] hover:border-[var(--accent)]/60 hover:scale-105 hover:shadow-md hover:shadow-[var(--accent)]/15 active:scale-95"
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

      {/* Media Modal with Zoom */}
      {showMediaModal && mediaUrls.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          style={{ contain: 'layout style paint' }}
          onClick={() => setShowMediaModal(false)}
        >
          <div 
            className="relative w-full h-full flex flex-col items-center justify-center py-12 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image viewport container - fixed size, clips overflow when zoomed */}
            <div className="relative max-w-[90vw] max-h-[75vh] flex items-center justify-center">
              {/* Close button - top right of viewport */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMediaModal(false);
                }}
                className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center bg-black/90 hover:bg-[var(--color-accent)] text-white/80 hover:text-white rounded-full z-30 border border-white/30 hover:border-red-400 shadow-xl transition-all duration-200 hover:scale-110"
                title="Close (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Clipping viewport - this maintains the 100% size and clips zoomed content */}
              <div
                className="relative overflow-hidden rounded-lg shadow-2xl border border-white/10"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              >
                <img
                  src={currentMediaUrl}
                  alt={`${item.title} - media ${currentMediaIndex + 1}`}
                  className="max-w-[90vw] max-h-[75vh] object-contain select-none block"
                  style={{ 
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center',
                    maxWidth: '1400px',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                  }}
                  ref={imageRef}
                  draggable={false}
                  onClick={() => {
                    if (zoomLevel === 1) {
                      setZoomLevel(2);
                    }
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-5 py-3 bg-black/60 backdrop-blur-md text-white text-sm rounded-2xl border border-white/10 shadow-xl">
              {/* Previous Button */}
              {mediaUrls.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
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
                <div className="px-3 py-1 bg-white/10 rounded-lg font-medium min-w-[60px] text-center">
                  {currentMediaIndex + 1} / {mediaUrls.length}
                </div>
              )}

              {/* Next Button */}
              {mediaUrls.length > 1 && (
                <button
                  onClick={goToNext}
                  className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
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

              {/* Divider */}
              {mediaUrls.length > 1 && <div className="w-px h-8 bg-white/20" />}

              {/* Zoom Out */}
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                disabled={zoomLevel <= 0.5}
                title="Zoom out (-)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Zoom Level Indicator */}
              <div className="px-3 py-1 bg-white/10 rounded-lg font-medium min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </div>

              {/* Zoom In */}
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 5))}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                disabled={zoomLevel >= 5}
                title="Zoom in (+)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Reset Zoom */}
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
                title="Reset zoom (0)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-in fade-in duration-200"
          style={{ contain: 'layout style paint' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-[var(--card)] border border-[var(--color-accent)]/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-[var(--color-accent)]/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-400">
                  <path
                    d="M12 9v4M12 17h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-center mb-2 text-[var(--foreground)]">
              Delete Portfolio Item?
            </h3>

            {/* Description */}
            <p className="text-[var(--muted-foreground)] mb-6 text-sm text-center leading-relaxed">
              This action cannot be undone. The portfolio item{" "}
              <span className="font-medium text-[var(--foreground)]">"{item.title}"</span>{" "}
              will be permanently deleted.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
                className="flex-1"
                size="sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

