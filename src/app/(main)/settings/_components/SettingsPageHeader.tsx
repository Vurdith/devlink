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
  return (
    <div className={surface("panel", cn("noise-overlay relative overflow-hidden p-4 animate-fade-in sm:p-5", className))}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.38)] to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(760px 220px at 18% 0%, rgba(var(--color-accent-rgb),0.12), transparent 58%), radial-gradient(620px 220px at 92% 0%, rgba(var(--color-accent-2-rgb),0.10), transparent 62%)",
        }}
      />
      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className={iconBox("cyan", "h-10 w-10 shrink-0 text-white")}>{icon}</div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">{eyebrow}</div>
          <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold tracking-normal text-white">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
    </div>
  );
}
