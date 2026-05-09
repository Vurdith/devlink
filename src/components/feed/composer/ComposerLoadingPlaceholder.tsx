import { cn } from "@/lib/cn";

export function ComposerLoadingPlaceholder({ height = "h-32" }: { height?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]", height)}>
      <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2">
        <div className="typing-dot h-2 w-2 rounded-full bg-[var(--color-accent-2)]" />
        <div className="typing-dot h-2 w-2 rounded-full bg-[var(--color-accent-2)]" />
        <div className="typing-dot h-2 w-2 rounded-full bg-[var(--color-accent-2)]" />
      </div>
    </div>
  );
}
