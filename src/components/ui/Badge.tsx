import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "accent" | "outline" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "accent", ...props }: BadgeProps) {
  const styles: Record<Variant, string> = {
    accent:
      "bg-[color-mix(in_oklab,var(--accent)_90%,black)] text-[var(--accent-contrast)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)]",
    outline:
      "bg-transparent text-[var(--foreground)] border border-white/15",
    muted:
      "bg-[var(--muted)] text-[var(--muted-foreground)] border border-white/10",
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 h-7 text-xs font-medium", styles[variant], className)}
      {...props}
    />
  );
}


