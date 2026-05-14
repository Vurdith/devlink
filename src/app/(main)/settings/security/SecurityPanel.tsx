import type { CSSProperties, ReactNode } from "react";
import { surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface SecurityPanelProps {
  accent: "cyan" | "emerald" | "amber" | "red";
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const accents: Record<SecurityPanelProps["accent"], { glow: string; border: string; iconBg: string }> = {
  cyan: {
    glow: "radial-gradient(900px 260px at 18% 0%, rgba(var(--color-accent-rgb),0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(var(--color-accent-2-rgb),0.10), transparent 60%)",
    border: "border-white/[0.08]",
    iconBg: "border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]",
  },
  emerald: {
    glow: "radial-gradient(900px 260px at 18% 0%, rgba(16,185,129,0.12), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(52,211,153,0.08), transparent 60%)",
    border: "border-emerald-300/12",
    iconBg: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  },
  amber: {
    glow: "radial-gradient(900px 260px at 18% 0%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(251,191,36,0.08), transparent 60%)",
    border: "border-amber-300/12",
    iconBg: "border-amber-300/20 bg-amber-400/10 text-amber-200",
  },
  red: {
    glow: "radial-gradient(900px 260px at 18% 0%, rgba(239,68,68,0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(244,63,94,0.10), transparent 60%)",
    border: "border-red-500/30",
    iconBg: "border-red-300/20 bg-red-400/10 text-red-200",
  },
};

export function SecurityPanel({
  accent,
  title,
  description,
  icon,
  children,
  className,
  style,
}: SecurityPanelProps) {
  const selectedAccent = accents[accent];

  return (
    <div
      className={surface("panel", cn("noise-overlay relative overflow-hidden p-4 sm:p-6", selectedAccent.border, className))}
      style={style}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: selectedAccent.glow }} />
      <div className="relative mb-5 flex items-start gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", selectedAccent.iconBg)}>
          <div>{icon}</div>
        </div>
        <div className="min-w-0">
          <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-normal text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
