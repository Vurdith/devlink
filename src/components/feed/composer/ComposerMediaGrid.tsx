import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/design-system";
import { memo, useCallback } from "react";

interface ComposerMediaGridProps {
  mediaUrls: string[];
  onRemove: (index: number) => void;
  compact?: boolean;
}

interface ComposerMediaItemProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  compact: boolean;
}

const ComposerMediaItem = memo(function ComposerMediaItem({ url, index, onRemove, compact }: ComposerMediaItemProps) {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className={cn("relative group animate-pop-in", compact && "aspect-video")} style={{ animationDelay: `${index * 0.05}s` }}>
      <img
        src={url}
        alt={`Media ${index + 1}`}
        decoding="async"
        loading="lazy"
        className={cn(
          "w-full object-cover rounded-lg border border-white/[0.08] transition-colors",
          compact ? "h-full rounded-xl" : "h-24 group-hover:border-[rgba(var(--color-accent-rgb),0.5)]"
        )}
      />
      <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors group-hover:bg-black/20" />
      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          "absolute right-2 top-2 p-1.5 opacity-0 transition-all group-hover:opacity-100",
          ui.control.icon,
          compact ? "bg-[rgba(8,11,16,0.82)]" : "scale-90 group-hover:scale-100"
        )}
        aria-label={`Remove media ${index + 1}`}
      >
        <svg className={compact ? "w-4 h-4" : "w-3 h-3"} viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
});

export const ComposerMediaGrid = memo(function ComposerMediaGrid({ mediaUrls, onRemove, compact = false }: ComposerMediaGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl overflow-hidden",
        mediaUrls.length === 1 ? "grid-cols-1" : mediaUrls.length === 2 || mediaUrls.length <= 4 ? "grid-cols-2" : "grid-cols-3",
        compact && "mt-3"
      )}
    >
      {mediaUrls.map((url, index) => (
        <ComposerMediaItem key={`${url}:${index}`} url={url} index={index} onRemove={onRemove} compact={compact} />
      ))}
    </div>
  );
});
