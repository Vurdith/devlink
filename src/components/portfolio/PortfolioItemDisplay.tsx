
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/BaseModal";
import type { PortfolioItem } from "@/types/api";
import { PortfolioItemContent } from "./PortfolioItemContent";
import { PortfolioMediaModal } from "./PortfolioMediaModal";
import { parseCommaSeparated } from "./portfolio-display-utils";

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

  const mediaUrls = parseCommaSeparated(item.mediaUrls);
  const links = parseCommaSeparated(item.links);
  const tags = parseCommaSeparated(item.tags);
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

      <PortfolioItemContent
        item={item}
        isOwner={isOwner}
        links={links}
        tags={tags}
        linkedSkills={linkedSkills}
        onEdit={() => onEdit(item)}
        onDelete={() => setShowDeleteConfirm(true)}
        onTagClick={(tag) => router.push(`/hashtag/${tag}`)}
      />

      {showMediaModal && mediaUrls.length > 0 && currentMediaUrl && (
        <PortfolioMediaModal
          title={item.title}
          mediaUrls={mediaUrls}
          currentMediaIndex={currentMediaIndex}
          currentMediaUrl={currentMediaUrl}
          zoomLevel={zoomLevel}
          panPosition={panPosition}
          isDragging={isDragging}
          imageDimensions={imageDimensions}
          containerDimensions={containerDimensions}
          imageRef={imageRef}
          containerRef={containerRef}
          onClose={() => setShowMediaModal(false)}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onZoomLevelChange={setZoomLevel}
          onPanPositionChange={setPanPosition}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onImageLoad={handleImageLoad}
        />
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
