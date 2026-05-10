import type { ReactNode } from "react";
import { iconBox, surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface SettingsPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

export function SettingsPageHeader({
  eyebrow,
  title,
  description,
  icon,
  className,
}: SettingsPageHeaderProps) {
  const showEyebrow = eyebrow.trim().toLowerCase() !== title.trim().toLowerCase();

  return (
    <div className={surface("panel", cn("relative overflow-hidden p-4 animate-fade-in sm:p-5", className))}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className={iconBox("cyan", "h-10 w-10 shrink-0 text-white")}>{icon}</div>
        <div className="min-w-0">
          {showEyebrow ? (
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">{eyebrow}</div>
          ) : null}
          <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold leading-tight text-white">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}
