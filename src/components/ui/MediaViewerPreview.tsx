import Image from "next/image";
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

export function MediaViewerPreview({
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
        className={`group/media relative w-full cursor-pointer overflow-hidden rounded-xl bg-black/40 ${className}`}
        style={{ maxHeight: "400px" }}
        onClick={() => onOpen(currentIndex)}
      >
        <LargeMedia item={currentMedia} alt={`${alt} - ${currentIndex + 1}`} />
        <PreviewArrow direction="previous" onClick={onPrevious} />
        <PreviewArrow direction="next" onClick={onNext} />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-3 py-1.5 rounded-full">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60 w-1.5"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (count === 1) {
    return (
      <div
        className={`group/media relative w-full cursor-pointer overflow-hidden rounded-xl bg-black/40 ${className}`}
        style={{ maxHeight: "400px" }}
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
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
              <span className="text-white text-2xl font-bold">+{count - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LargeMedia({ item, alt, hover = false }: { item: MediaItem; alt: string; hover?: boolean }) {
  if (item.type === "video") {
    return (
      <>
        <video
          src={item.url}
          className={`w-full h-full object-contain ${hover ? "transition-transform duration-500 ease-out group-hover/media:scale-105" : ""}`}
          style={{ maxHeight: "400px" }}
          preload="metadata"
        />
        {hover && <PlayOverlay size="lg" />}
      </>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: "400px" }}>
      <Image
        src={item.url}
        alt={alt}
        fill
        sizes="100vw"
        className={`object-contain ${hover ? "transition-transform duration-500 ease-out group-hover/media:scale-105" : ""}`}
        unoptimized
      />
    </div>
  );
}

function GridMediaItem({ item, index, alt, onOpen }: { item: MediaItem; index: number; alt: string; onOpen: (index: number) => void }) {
  return (
    <div className="relative cursor-pointer overflow-hidden rounded-xl bg-black/20 group/media" onClick={() => onOpen(index)}>
      {item.type === "video" ? (
        <>
          <video src={item.url} className="w-full h-auto rounded-xl transition-transform duration-500 ease-out group-hover/media:scale-105" preload="metadata" />
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
            unoptimized
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
      className={`absolute ${isPrevious ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[rgba(12,16,23,0.74)] p-2.5 text-white opacity-0 transition-all hover:border-[rgba(var(--color-accent-2-rgb),0.32)] hover:bg-[rgba(var(--color-accent-2-rgb),0.12)] group-hover/media:opacity-100`}
      title={isPrevious ? "Previous" : "Next"}
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
      <div className={`rounded-xl border border-white/10 bg-[rgba(12,16,23,0.7)] ${size === "lg" ? "p-4" : "p-3"} transition-transform duration-300 group-hover/media:scale-110`}>
        <svg className={size === "lg" ? "w-10 h-10 text-white" : "w-8 h-8 text-white"} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
