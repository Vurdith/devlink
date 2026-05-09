import { memo } from "react";
import Image from "next/image";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import type { MediaItem } from "./media-viewer-types";

interface MediaViewerPreviewProps {
  media: MediaItem[];
  currentIndex: number;
  currentMedia: MediaItem;
  isSlideshow: boolean;
  className: string;
  alt: string;
  onOpen: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

const LARGE_MEDIA_STYLE = { height: "400px" };
const LARGE_PREVIEW_STYLE = { maxHeight: "400px" };

export const MediaViewerPreview = memo(function MediaViewerPreview({
  media,
  currentIndex,
  currentMedia,
  isSlideshow,
  className,
  alt,
  onOpen,
  onPrevious,
  onNext,
  onSelect,
}: MediaViewerPreviewProps) {
  const count = media.length;

  if (isSlideshow && count > 1) {
    return (
      <div
        className={cn("group/media relative w-full cursor-pointer overflow-hidden rounded-xl bg-[rgba(8,11,16,0.72)]", className)}
        style={LARGE_PREVIEW_STYLE}
        onClick={() => onOpen(currentIndex)}
      >
        <LargeMedia item={currentMedia} alt={`${alt} - ${currentIndex + 1}`} />
        <PreviewArrow direction="previous" onClick={onPrevious} />
        <PreviewArrow direction="next" onClick={onNext} />
        <div className={surface("toolbar", "absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full px-3 py-1.5")}>
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-4 bg-[var(--color-accent-2)]" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
              aria-label={`View media ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (count === 1) {
    return (
      <div
        className={cn("group/media relative w-full cursor-pointer overflow-hidden rounded-xl bg-[rgba(8,11,16,0.72)]", className)}
        style={LARGE_PREVIEW_STYLE}
        onClick={() => onOpen(0)}
      >
        <LargeMedia item={media[0]} alt={`${alt} - 1`} hover />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 transition-colors duration-200 group-hover/media:bg-black/5" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        <GridMediaItem item={media[0]} index={0} alt={alt} onOpen={onOpen} />
        <GridMediaItem item={media[1]} index={1} alt={alt} onOpen={onOpen} />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {media.slice(0, 4).map((item, index) => (
        <div key={item.id || index} className="relative">
          <GridMediaItem item={item} index={index} alt={alt} onOpen={onOpen} />
          {index === 3 && count > 4 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(5,8,12,0.68)]">
              <span className="text-white text-2xl font-bold">+{count - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

function LargeMedia({ item, alt, hover = false }: { item: MediaItem; alt: string; hover?: boolean }) {
  if (item.type === "video") {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
        <video
          src={item.url}
          className={`h-full w-full object-contain ${hover ? "transition-transform duration-500 ease-out group-hover/media:scale-105" : ""}`}
          preload="metadata"
          playsInline
        />
        {hover && <PlayOverlay size="lg" />}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={LARGE_MEDIA_STYLE}>
      <Image
        src={item.url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 680px"
        className={`object-contain ${hover ? "transition-transform duration-500 ease-out group-hover/media:scale-105" : ""}`}
        quality={72}
        draggable={false}
        decoding="async"
      />
    </div>
  );
}

function GridMediaItem({ item, index, alt, onOpen }: { item: MediaItem; index: number; alt: string; onOpen: (index: number) => void }) {
  return (
    <div className="group/media relative cursor-pointer overflow-hidden rounded-xl bg-[rgba(8,11,16,0.58)]" onClick={() => onOpen(index)}>
      {item.type === "video" ? (
        <>
          <video
            src={item.url}
            className="aspect-video w-full rounded-xl object-cover transition-transform duration-500 ease-out group-hover/media:scale-105"
            preload="none"
            playsInline
          />
          <PlayOverlay size="sm" />
        </>
      ) : (
        <div className="relative w-full aspect-video overflow-hidden rounded-xl">
          <Image
            src={item.url}
            alt={`${alt} - ${index + 1}`}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="rounded-xl object-cover transition-transform duration-500 ease-out group-hover/media:scale-105"
            quality={70}
            draggable={false}
            decoding="async"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors duration-200 rounded-xl pointer-events-none" />
    </div>
  );
}

function PreviewArrow({ direction, onClick }: { direction: "previous" | "next"; onClick: () => void }) {
  const isPrevious = direction === "previous";
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(`absolute ${isPrevious ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-2.5 text-white opacity-0 transition-all group-hover/media:opacity-100`, ui.control.icon)}
      title={isPrevious ? "Previous" : "Next"}
      aria-label={isPrevious ? "Previous media" : "Next media"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d={isPrevious ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function PlayOverlay({ size }: { size: "sm" | "lg" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className={surface("panelMuted", `${size === "lg" ? "p-4" : "p-3"} transition-transform duration-300 group-hover/media:scale-110`)}>
        <svg className={size === "lg" ? "w-10 h-10 text-white" : "w-8 h-8 text-white"} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
