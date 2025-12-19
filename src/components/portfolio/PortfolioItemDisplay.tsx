
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/BaseModal";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  links?: string;
  mediaUrls?: string;
  tags?: string;
  skills?: Array<{ skill?: { id: string; name: string; category: string; icon?: string | null } }>;
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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Reset zoom when modal opens/closes or image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setContainerDimensions({ width: 0, height: 0 });
  }, [showMediaModal, currentMediaIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showMediaModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showMediaModal]);

  // Calculate pan boundaries based on zoom level and image/container dimensions
  const calculatePanBounds = useCallback(() => {
    if (!imageDimensions.width || !containerDimensions.width) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    // The scaled image size
    const scaledWidth = imageDimensions.width * zoomLevel;
    const scaledHeight = imageDimensions.height * zoomLevel;

    // How much the image overflows the container on each axis
    const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
    const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);

    // Pan bounds (in screen pixels, before dividing by zoom for transform)
    return {
      minX: -overflowX,
      maxX: overflowX,
      minY: -overflowY,
      maxY: overflowY,
    };
  }, [imageDimensions, containerDimensions, zoomLevel]);

  // Clamp pan position to boundaries
  const clampPanPosition = useCallback((x: number, y: number) => {
    const bounds = calculatePanBounds();
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    };
  }, [calculatePanBounds]);

  // Update dimensions when image loads
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      // Get the displayed size of the image (after object-contain scaling)
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setImageDimensions({ width: imgRect.width, height: imgRect.height });
      setContainerDimensions({ width: containerRect.width, height: containerRect.height });
    }
  }, []);

  // Handle keyboard shortcuts for zoom modal
  useEffect(() => {
    if (!showMediaModal) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMediaModal(false);
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel(prev => {
          const newZoom = Math.min(prev + 0.5, 5);
          // Re-clamp position for new zoom
          if (imageDimensions.width && containerDimensions.width) {
            const scaledWidth = imageDimensions.width * newZoom;
            const scaledHeight = imageDimensions.height * newZoom;
            const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
            const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
            setPanPosition(pos => ({
              x: Math.max(-overflowX, Math.min(overflowX, pos.x)),
              y: Math.max(-overflowY, Math.min(overflowY, pos.y)),
            }));
          }
          return newZoom;
        });
      } else if (e.key === "-") {
        setZoomLevel(prev => {
          const newZoom = Math.max(prev - 0.5, 0.5);
          // Re-clamp position for new zoom
          if (imageDimensions.width && containerDimensions.width) {
            const scaledWidth = imageDimensions.width * newZoom;
            const scaledHeight = imageDimensions.height * newZoom;
            const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
            const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
            setPanPosition(pos => ({
              x: Math.max(-overflowX, Math.min(overflowX, pos.x)),
              y: Math.max(-overflowY, Math.min(overflowY, pos.y)),
            }));
          }
          return newZoom;
        });
      } else if (e.key === "0") {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMediaModal, imageDimensions, containerDimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const clamped = clampPanPosition(newX, newY);
      setPanPosition(clamped);
    }
  }, [isDragging, zoomLevel, dragStart, clampPanPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 5);
    setZoomLevel(newZoom);
    
    // Re-clamp pan position for new zoom level
    // Need to recalculate bounds with new zoom
    if (imageDimensions.width && containerDimensions.width) {
      const scaledWidth = imageDimensions.width * newZoom;
      const scaledHeight = imageDimensions.height * newZoom;
      const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
      const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
      
      setPanPosition(prev => ({
        x: Math.max(-overflowX, Math.min(overflowX, prev.x)),
        y: Math.max(-overflowY, Math.min(overflowY, prev.y)),
      }));
    }
  }, [zoomLevel, imageDimensions, containerDimensions]);

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
  const linkedSkills =
    item.skills?.map((s) => s.skill).filter(Boolean) as Array<{ id: string; name: string; category: string; icon?: string | null }> | undefined;

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
    <div className="group relative glass-soft rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
      {/* Media Gallery */}
      {mediaUrls.length > 0 && (
        <div className="w-full h-72 sm:h-[32rem] bg-gradient-to-br from-white/5 to-transparent overflow-hidden flex items-center justify-center relative group/media">
          {/* Current Media */}
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer relative"
            onClick={() => setShowMediaModal(true)}
          >
            <img
              src={currentMediaUrl}
              alt={`${item.title} - media ${currentMediaIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
            
            {/* Cinematic Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transform scale-90 group-hover/media:scale-100 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {mediaUrls.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover/media:opacity-100 border border-white/10 backdrop-blur-sm z-10"
                title="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover/media:opacity-100 border border-white/10 backdrop-blur-sm z-10"
                title="Next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {mediaUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentMediaIndex
                        ? "bg-white w-8"
                        : "bg-white/30 hover:bg-white/50 w-1.5"
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
      <div className="p-5 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {item.title}
              </h3>
              {item.category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[rgba(var(--color-accent-rgb),0.1)] text-[var(--color-accent)] border border-[rgba(var(--color-accent-rgb),0.2)] rounded-lg">
                  {capitalizeCategory(item.category)}
                </span>
              )}
            </div>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-white/40 rounded-xl hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10"
                title="Edit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-white/40 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                title="Delete"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-6 leading-relaxed max-w-3xl">
            {item.description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/10 mt-6">
          <div className="flex flex-wrap gap-2">
            {/* Tags */}
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/hashtag/${tag}`)}
                className="px-3 py-1.5 text-[11px] font-medium bg-white/[0.03] text-white/50 rounded-lg border border-white/5 hover:bg-white/[0.06] hover:text-white hover:border-white/10 transition-all"
              >
                #{tag}
              </button>
            ))}
            
            {/* Linked Skills */}
            {linkedSkills?.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1.5 text-[11px] font-medium bg-[rgba(var(--color-accent-rgb),0.05)] text-[var(--color-accent)] rounded-lg border border-[rgba(var(--color-accent-rgb),0.1)]"
              >
                {s.name}
              </span>
            ))}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              {links.map((link, idx) => {
                let displayText = "View Project";
                let Icon = (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                );

                if (link.toLowerCase().includes("github")) {
                  displayText = "GitHub";
                  Icon = (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 4.338 9.63 10.334 10.811.601.11.821-.258.821-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.44-1.305.806-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.218.694.825.576 10.001-1.186 14.336-5.51 14.336-10.81 0-6.627-5.374-12-12-12z" />
                    </svg>
                  );
                }

                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-black rounded-xl hover:bg-white/90 transition-all active:scale-95"
                  >
                    {Icon}
                    {displayText}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Privacy Status */}
        {!item.isPublic && (
          <div className="mt-4 text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Private Item
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
                className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center bg-black/90 hover:bg-[var(--color-accent)] text-white/80 hover:text-white rounded-full z-30 border border-white/30 hover:border-[var(--color-accent)] shadow-xl transition-all duration-200 hover:scale-110"
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
                ref={containerRef}
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
                  onLoad={handleImageLoad}
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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-5 py-3 bg-black/60 text-white text-sm rounded-2xl border border-white/10 shadow-xl">
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
                onClick={() => {
                  const newZoom = Math.max(zoomLevel - 0.5, 0.5);
                  setZoomLevel(newZoom);
                  // Re-clamp pan for new zoom
                  if (imageDimensions.width && containerDimensions.width) {
                    const scaledWidth = imageDimensions.width * newZoom;
                    const scaledHeight = imageDimensions.height * newZoom;
                    const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
                    const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
                    setPanPosition(prev => ({
                      x: Math.max(-overflowX, Math.min(overflowX, prev.x)),
                      y: Math.max(-overflowY, Math.min(overflowY, prev.y)),
                    }));
                  }
                }}
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
                onClick={() => {
                  const newZoom = Math.min(zoomLevel + 0.5, 5);
                  setZoomLevel(newZoom);
                  // Re-clamp pan for new zoom
                  if (imageDimensions.width && containerDimensions.width) {
                    const scaledWidth = imageDimensions.width * newZoom;
                    const scaledHeight = imageDimensions.height * newZoom;
                    const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
                    const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
                    setPanPosition(prev => ({
                      x: Math.max(-overflowX, Math.min(overflowX, prev.x)),
                      y: Math.max(-overflowY, Math.min(overflowY, prev.y)),
                    }));
                  }
                }}
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
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Portfolio Item?"
        message={`This action cannot be undone. The portfolio item "${item.title}" will be permanently deleted.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}

