"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "video";
}

interface MediaViewerProps {
  media: MediaItem[];
  isSlideshow?: boolean;
  className?: string;
  alt?: string;
}

export function MediaViewer({
  media,
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

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  // Reset zoom when modal opens/closes or image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setContainerDimensions({ width: 0, height: 0 });
  }, [showModal, currentIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

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
  }, [showModal, zoomLevel, imageDimensions, containerDimensions]);

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
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  const openModal = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
  }, []);

  // Grid media item component (for multi-image layouts with fixed aspect ratios)
  const GridMediaItem = ({ item, index, aspectClass = "" }: { 
    item: MediaItem; 
    index: number; 
    aspectClass?: string;
  }) => (
    <div
      className={`relative cursor-pointer group overflow-hidden bg-[#0a0a0f] flex items-center justify-center ${aspectClass}`}
      onClick={() => openModal(index)}
    >
      {item.type === "video" ? (
        <>
          <video
            src={item.url}
            className="w-full h-full object-contain"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <img
          src={item.url}
          alt={`${alt} - ${index + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
    </div>
  );

  // Render preview with X.com-style layouts
  const renderPreview = () => {
    const count = media.length;
    
    // Slideshow mode - single image with navigation arrows
    if (isSlideshow && count > 1) {
      return (
        <div className={`flex justify-center ${className}`}>
          <div 
            className="relative rounded-2xl overflow-hidden group cursor-pointer inline-block"
            onClick={() => openModal(currentIndex)}
          >
            {currentMedia.type === "video" ? (
              <video
                src={currentMedia.url}
                className="max-w-full max-h-[380px] block"
                preload="metadata"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={`${alt} - ${currentIndex + 1}`}
                className="max-w-full max-h-[380px] block"
                loading="lazy"
              />
            )}
            
            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              title="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              title="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60 w-1.5"
                  }`}
                />
              ))}
            </div>
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-150 pointer-events-none" />
          </div>
        </div>
      );
    }

    // Single image - container fits the image tightly
    if (count === 1) {
      const item = media[0];
      return (
        <div className={`flex justify-center ${className}`}>
          <div 
            className="relative rounded-2xl overflow-hidden cursor-pointer group inline-block"
            onClick={() => openModal(0)}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.url}
                  className="max-w-full max-h-[380px] block"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={item.url}
                alt={`${alt} - 1`}
                className="max-w-full max-h-[380px] block"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-150 pointer-events-none" />
          </div>
        </div>
      );
    }

    // 2 images - side by side, equal height (cropped to fill)
    if (count === 2) {
      return (
        <div className={`grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden ${className}`}>
          <GridMediaItem item={media[0]} index={0} aspectClass="aspect-[4/5]" />
          <GridMediaItem item={media[1]} index={1} aspectClass="aspect-[4/5]" />
        </div>
      );
    }

    // 3 images - one large left, two stacked right
    if (count === 3) {
      return (
        <div className={`grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden ${className}`}>
          <GridMediaItem item={media[0]} index={0} aspectClass="aspect-[3/4] row-span-2" />
          <div className="flex flex-col gap-0.5">
            <GridMediaItem item={media[1]} index={1} aspectClass="aspect-[4/3]" />
            <GridMediaItem item={media[2]} index={2} aspectClass="aspect-[4/3]" />
          </div>
        </div>
      );
    }

    // 4 images - 2x2 grid
    if (count === 4) {
      return (
        <div className={`grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden ${className}`}>
          <GridMediaItem item={media[0]} index={0} aspectClass="aspect-square" />
          <GridMediaItem item={media[1]} index={1} aspectClass="aspect-square" />
          <GridMediaItem item={media[2]} index={2} aspectClass="aspect-square" />
          <GridMediaItem item={media[3]} index={3} aspectClass="aspect-square" />
        </div>
      );
    }

    // 5+ images - 2x2 grid with +N overlay on last
    return (
      <div className={`grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden ${className}`}>
        <GridMediaItem item={media[0]} index={0} aspectClass="aspect-square" />
        <GridMediaItem item={media[1]} index={1} aspectClass="aspect-square" />
        <GridMediaItem item={media[2]} index={2} aspectClass="aspect-square" />
        <div
          className="relative cursor-pointer group overflow-hidden aspect-square bg-[#0a0a0f]"
          onClick={() => openModal(3)}
        >
          <img
            src={media[3].url}
            alt={`${alt} - 4`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {count > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-2xl font-bold">+{count - 4}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
        </div>
      </div>
    );
  };

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
              className="absolute -top-3 -right-3 w-9 h-9 flex items-center justify-center bg-black/90 hover:bg-[var(--color-accent)] text-white/80 hover:text-white rounded-full z-30 border border-white/30 hover:border-[var(--color-accent)] shadow-xl transition-all duration-200 hover:scale-110"
              title="Close (Esc)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Clipping viewport */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg shadow-2xl border border-white/10"
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
                <img
                  src={currentMedia.url}
                  alt={`${alt} - ${currentIndex + 1}`}
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
                      handleZoomChange(2);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-5 py-3 bg-black/60 backdrop-blur-md text-white text-sm rounded-2xl border border-white/10 shadow-xl">
            {/* Previous Button */}
            {media.length > 1 && (
              <button
                onClick={goToPrevious}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
                title="Previous (←)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Media Counter */}
            {media.length > 1 && (
              <div className="px-3 py-1 bg-white/10 rounded-lg font-medium min-w-[60px] text-center">
                {currentIndex + 1} / {media.length}
              </div>
            )}

            {/* Next Button */}
            {media.length > 1 && (
              <button
                onClick={goToNext}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
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

                <div className="px-3 py-1 bg-white/10 rounded-lg font-medium min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </div>

                <button
                  onClick={() => handleZoomChange(Math.min(zoomLevel + 0.5, 5))}
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

                <button
                  onClick={() => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 hover:scale-105"
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

  return (
    <>
      {renderPreview()}
      {renderModal()}
    </>
  );
}

