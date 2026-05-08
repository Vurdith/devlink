import { cn } from "@/lib/cn";

export function ComposerLoadingPlaceholder({ height = "h-32" }: { height?: string }) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <div className="flex items-center gap-2">
        <div className="typing-dot w-2 h-2 bg-[var(--color-accent)] rounded-full" />
        <div className="typing-dot w-2 h-2 bg-[var(--color-accent)] rounded-full" />
        <div className="typing-dot w-2 h-2 bg-[var(--color-accent)] rounded-full" />
      </div>
    </div>
  );
}
