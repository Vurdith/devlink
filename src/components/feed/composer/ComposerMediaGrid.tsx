import { cn } from "@/lib/cn";

interface ComposerMediaGridProps {
  mediaUrls: string[];
  onRemove: (index: number) => void;
  compact?: boolean;
}

export function ComposerMediaGrid({ mediaUrls, onRemove, compact = false }: ComposerMediaGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl overflow-hidden",
        mediaUrls.length === 1 ? "grid-cols-1" : mediaUrls.length === 2 || mediaUrls.length <= 4 ? "grid-cols-2" : "grid-cols-3",
        compact && "mt-3"
      )}
    >
      {mediaUrls.map((url, index) => (
        <div key={`${url}:${index}`} className={cn("relative group animate-pop-in", compact && "aspect-video")} style={{ animationDelay: `${index * 0.05}s` }}>
          <img
            src={url}
            alt={`Media ${index + 1}`}
            className={cn(
              "w-full object-cover rounded-lg border border-white/10 transition-colors",
              compact ? "h-full rounded-xl" : "h-24 group-hover:border-[rgba(var(--color-accent-rgb),0.5)]"
            )}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg" />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className={cn(
              "absolute top-2 right-2 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all",
              compact ? "bg-black/70 hover:bg-[var(--color-accent)]" : "bg-[rgba(var(--color-accent-rgb),0.9)] scale-90 group-hover:scale-100"
            )}
          >
            <svg className={compact ? "w-4 h-4" : "w-3 h-3"} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
