import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { surface } from "@/components/ui/design-system";

type PageFrameSize = "narrow" | "default" | "wide" | "workspace" | "reading" | "full";
type PageFrameGap = "compact" | "default" | "relaxed";

interface PageFrameProps {
  children: ReactNode;
  size?: PageFrameSize;
  gap?: PageFrameGap;
  className?: string;
}

const frameSizes: Record<PageFrameSize, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
  workspace: "max-w-[1360px]",
  reading: "max-w-[820px]",
  full: "max-w-none",
};

const frameGaps: Record<PageFrameGap, string> = {
  compact: "space-y-4",
  default: "space-y-6",
  relaxed: "space-y-8",
};

export function PageFrame({
  children,
  size = "default",
  gap = "default",
  className,
}: PageFrameProps) {
  return (
    <div className={cn("mx-auto w-full min-w-0", frameSizes[size], frameGaps[gap], className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  tabs?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  action,
  tabs,
  className,
}: PageHeaderProps) {
  return (
    <header className={surface("panel", cn("noise-overlay relative overflow-hidden p-5 sm:p-6", className))}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.38)] to-transparent" />
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-[var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-4">{meta}</div> : null}
        </div>
        {action ? <div className="shrink-0 lg:pt-1">{action}</div> : null}
      </div>
      {tabs ? <div className="mt-5 min-w-0">{tabs}</div> : null}
    </header>
  );
}

interface PageSurfaceProps {
  children: ReactNode;
  tone?: "panel" | "muted" | "strong" | "empty" | "toolbar";
  density?: "compact" | "default" | "spacious";
  className?: string;
}

const surfaceTone = {
  panel: "panel",
  muted: "panelMuted",
  strong: "panelStrong",
  empty: "empty",
  toolbar: "toolbar",
} as const;

const surfaceDensity = {
  compact: "p-3 sm:p-4",
  default: "p-4 sm:p-5",
  spacious: "p-5 sm:p-6",
};

export function PageSurface({
  children,
  tone = "panel",
  density = "default",
  className,
}: PageSurfaceProps) {
  return (
    <section className={surface(surfaceTone[tone], cn("relative min-w-0 overflow-hidden", surfaceDensity[density], className))}>
      {children}
    </section>
  );
}

interface PageSplitProps {
  children: ReactNode;
  rail?: ReactNode;
  railSide?: "left" | "right";
  className?: string;
}

export function PageSplit({ children, rail, railSide = "right", className }: PageSplitProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-6",
        railSide === "left" && "lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]",
        className
      )}
    >
      {railSide === "left" && rail ? <aside className="min-w-0">{rail}</aside> : null}
      <div className="min-w-0">{children}</div>
      {railSide === "right" && rail ? <aside className="min-w-0">{rail}</aside> : null}
    </div>
  );
}
