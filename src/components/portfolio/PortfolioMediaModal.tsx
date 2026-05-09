import React from "react";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface PortfolioMediaModalProps {
  title: string;
  mediaUrls: string[];
  currentMediaIndex: number;
  currentMediaUrl: string;
  zoomLevel: number;
  panPosition: { x: number; y: number };
  isDragging: boolean;
  imageDimensions: { width: number; height: number };
  containerDimensions: { width: number; height: number };
  imageRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onZoomLevelChange: (zoomLevel: number) => void;
  onPanPositionChange: (position: { x: number; y: number }) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (event: React.WheelEvent) => void;
  onImageLoad: () => void;
}

function getClampedPanForZoom({
  zoomLevel,
  panPosition,
  imageDimensions,
  containerDimensions,
}: {
  zoomLevel: number;
  panPosition: { x: number; y: number };
  imageDimensions: { width: number; height: number };
  containerDimensions: { width: number; height: number };
}) {
  if (!imageDimensions.width || !containerDimensions.width) return panPosition;

  const scaledWidth = imageDimensions.width * zoomLevel;
  const scaledHeight = imageDimensions.height * zoomLevel;
  const overflowX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
  const overflowY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);

  return {
    x: Math.max(-overflowX, Math.min(overflowX, panPosition.x)),
    y: Math.max(-overflowY, Math.min(overflowY, panPosition.y)),
  };
}

export function PortfolioMediaModal({
  title,
  mediaUrls,
  currentMediaIndex,
  currentMediaUrl,
  zoomLevel,
  panPosition,
  isDragging,
  imageDimensions,
  containerDimensions,
  imageRef,
  containerRef,
  onClose,
  onPrevious,
  onNext,
  onZoomLevelChange,
  onPanPositionChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onImageLoad,
}: PortfolioMediaModalProps) {
  const setZoomAndClamp = (nextZoom: number) => {
    onZoomLevelChange(nextZoom);
    onPanPositionChange(
      getClampedPanForZoom({
        zoomLevel: nextZoom,
        panPosition,
        imageDimensions,
        containerDimensions,
      })
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" style={{ contain: "layout style paint" }} onClick={onClose}>
      <div className="relative w-full h-full flex flex-col items-center justify-center py-12 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="relative max-w-[90vw] max-h-[75vh] flex items-center justify-center">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className={cn("absolute -right-3 -top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:text-white", ui.active.cyan, ui.motion.lift)}
            title="Close (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border border-white/10"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
          >
            <img
              src={currentMediaUrl}
              alt={`${title} - media ${currentMediaIndex + 1}`}
              className="max-w-[90vw] max-h-[75vh] object-contain select-none block"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                transformOrigin: "center center",
                maxWidth: "1400px",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              ref={imageRef}
              draggable={false}
              onLoad={onImageLoad}
              onClick={() => {
                if (zoomLevel === 1) {
                  onZoomLevelChange(2);
                }
              }}
              onError={(event) => {
                const img = event.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          </div>
        </div>

        <div className={surface("toolbar", "absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center gap-3 px-5 py-3 text-sm text-white")}>
          {mediaUrls.length > 1 && (
            <button onClick={onPrevious} className={cn("p-2.5", ui.control.icon)} title="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {mediaUrls.length > 1 && <div className="min-w-[60px] rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-1 text-center font-medium">{currentMediaIndex + 1} / {mediaUrls.length}</div>}

          {mediaUrls.length > 1 && (
            <button onClick={onNext} className={cn("p-2.5", ui.control.icon)} title="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {mediaUrls.length > 1 && <div className="w-px h-8 bg-white/20" />}

          <button
            onClick={() => setZoomAndClamp(Math.max(zoomLevel - 0.5, 0.5))}
            className={cn("p-2.5", ui.control.icon)}
            disabled={zoomLevel <= 0.5}
            title="Zoom out (-)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="min-w-[60px] rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-1 text-center font-medium">{Math.round(zoomLevel * 100)}%</div>

          <button
            onClick={() => setZoomAndClamp(Math.min(zoomLevel + 0.5, 5))}
            className={cn("p-2.5", ui.control.icon)}
            disabled={zoomLevel >= 5}
            title="Zoom in (+)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            onClick={() => {
              onZoomLevelChange(1);
              onPanPositionChange({ x: 0, y: 0 });
            }}
            className={cn("p-2.5", ui.control.icon)}
            title="Reset zoom (0)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
