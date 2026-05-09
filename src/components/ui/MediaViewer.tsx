"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "./useBodyScrollLock";
import { MediaViewerPreview } from "./MediaViewerPreview";
import type { MediaItem } from "./media-viewer-types";

interface MediaViewerProps {
  media: MediaItem[];
  isSlideshow?: boolean;
  className?: string;
  alt?: string;
}

export function MediaViewer({
  media = [],
  isSlideshow = false,
  className = "",
  alt = "Media",
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  const currentMedia = media?.[currentIndex];

  // Reset zoom when modal opens/closes or image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setContainerDimensions({ width: 0, height: 0 });
  }, [showModal, currentIndex]);

  useBodyScrollLock(showModal, true);


  // Calculate pan boundaries
  const clampPanPosition = useCallback((x: number, y: number, zoom: number = zoomLevel) => {
    if (!imageDimensions.width || !containerDimensions.width) {
      return { x: 0, y: 0 };
    }
    const scaledWidth = imageDimensions.width * zoom;
    const scaledHeight = imageDimensions.height * zoom;
    const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
    const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
    return {
      x: Math.max(-overflowX, Math.min(overflowX, x)),
      y: Math.max(-overflowY, Math.min(overflowY, y)),
    };
  }, [imageDimensions, containerDimensions, zoomLevel]);

  // Handle zoom with pan clamping
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom);
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
  }, [imageDimensions, containerDimensions]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setImageDimensions({ width: imgRect.width, height: imgRect.height });
      setContainerDimensions({ width: containerRect.width, height: containerRect.height });
    }
  }, []);

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
      setPanPosition(clampPanPosition(newX, newY));
    }
  }, [isDragging, zoomLevel, dragStart, clampPanPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 5);
    handleZoomChange(newZoom);
  }, [zoomLevel, handleZoomChange]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? (media.length || 1) - 1 : prev - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === (media.length || 1) - 1 ? 0 : prev + 1));
  }, [media.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!showModal) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomChange(Math.min(zoomLevel + 0.5, 5));
      } else if (e.key === "-") {
        handleZoomChange(Math.max(zoomLevel - 0.5, 0.5));
      } else if (e.key === "0") {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, zoomLevel, goToPrevious, goToNext, handleZoomChange]);

  const openModal = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
  }, []);

  // Modal portal
  const renderModal = () => {
    if (!showModal || typeof window === 'undefined') return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999]"
        style={{ contain: 'layout style paint' }}
        onClick={() => setShowModal(false)}
      >
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center py-12 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image viewport container */}
          <div className="relative max-w-[90vw] max-h-[75vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
              className={cn("absolute -right-3 -top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:text-white", ui.active.cyan, ui.motion.lift)}
              title="Close (Esc)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Clipping viewport */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg border border-white/10"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: currentMedia.type === 'video' ? 'default' : (zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in') }}
            >
              {currentMedia.type === "video" ? (
                <video
                  src={currentMedia.url}
                  className="max-w-[90vw] max-h-[75vh] object-contain select-none block"
                  style={{ maxWidth: '1400px' }}
                  controls
                  autoPlay
                />
              ) : (
                <Image
                  src={currentMedia.url}
                  alt={`${alt} - ${currentIndex + 1}`}
                  width={0}
                  height={0}
                  sizes="90vw"
                  unoptimized
                  className="max-w-[90vw] max-h-[75vh] object-contain select-none block w-auto h-auto"
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
                      handleZoomChange(2);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className={surface("toolbar", "absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center gap-3 px-5 py-3 text-sm text-white")}>
            {/* Previous Button */}
            {media.length > 1 && (
              <button
                onClick={goToPrevious}
                className={cn("p-2.5", ui.control.icon)}
                title="Previous (←)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Media Counter */}
            {media.length > 1 && (
              <div className="min-w-[60px] rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-1 text-center font-medium">
                {currentIndex + 1} / {media.length}
              </div>
            )}

            {/* Next Button */}
            {media.length > 1 && (
              <button
                onClick={goToNext}
                className={cn("p-2.5", ui.control.icon)}
                title="Next (→)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Divider */}
            {media.length > 1 && currentMedia.type !== 'video' && <div className="w-px h-8 bg-white/20" />}

            {/* Zoom controls (only for images) */}
            {currentMedia.type !== 'video' && (
              <>
                <button
                  onClick={() => handleZoomChange(Math.max(zoomLevel - 0.5, 0.5))}
                  className={cn("p-2.5", ui.control.icon)}
                  disabled={zoomLevel <= 0.5}
                  title="Zoom out (-)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <div className="min-w-[60px] rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-1 text-center font-medium">
                  {Math.round(zoomLevel * 100)}%
                </div>

                <button
                  onClick={() => handleZoomChange(Math.min(zoomLevel + 0.5, 5))}
                  className={cn("p-2.5", ui.control.icon)}
                  disabled={zoomLevel >= 5}
                  title="Zoom in (+)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <button
                  onClick={() => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                  className={cn("p-2.5", ui.control.icon)}
                  title="Reset zoom (0)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (!media || media.length === 0) return null;

  return (
    <>
      <MediaViewerPreview
        media={media}
        currentIndex={currentIndex}
        currentMedia={currentMedia}
        isSlideshow={isSlideshow}
        className={className}
        alt={alt}
        onOpen={openModal}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSelect={setCurrentIndex}
      />
      {renderModal()}
    </>
  );
}

