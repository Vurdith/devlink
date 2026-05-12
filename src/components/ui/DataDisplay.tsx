import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { cn } from "@/lib/cn";

export type DataTone =
  | "accent"
  | "muted"
  | "money"
  | "rating"
  | "success"
  | "info"
  | "warning"
  | "danger";

const toneStyles: Record<
  DataTone,
  {
    border: string;
    bg: string;
    text: string;
    hoverText: string;
    line: string;
  }
> = {
  accent: {
    border: "border-[rgba(var(--color-accent-2-rgb),0.24)]",
    bg: "bg-[rgba(var(--color-accent-2-rgb),0.09)]",
    text: "text-[var(--color-accent-2)]",
    hoverText: "group-hover:text-[var(--color-accent-2)]",
    line: "bg-[rgba(var(--color-accent-2-rgb),0.56)]",
  },
  muted: {
    border: "border-white/[0.08]",
    bg: "bg-white/[0.035]",
    text: "text-white/62",
    hoverText: "group-hover:text-white",
    line: "bg-white/[0.16]",
  },
  money: {
    border: "border-emerald-300/24",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    hoverText: "group-hover:text-emerald-200",
    line: "bg-emerald-300/55",
  },
  rating: {
    border: "border-amber-300/24",
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    hoverText: "group-hover:text-amber-200",
    line: "bg-amber-300/55",
  },
  success: {
    border: "border-emerald-300/24",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    hoverText: "group-hover:text-emerald-200",
    line: "bg-emerald-300/55",
  },
  info: {
    border: "border-sky-300/24",
    bg: "bg-sky-400/10",
    text: "text-sky-300",
    hoverText: "group-hover:text-sky-200",
    line: "bg-sky-300/55",
  },
  warning: {
    border: "border-amber-300/24",
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    hoverText: "group-hover:text-amber-200",
    line: "bg-amber-300/55",
  },
  danger: {
    border: "border-rose-300/24",
    bg: "bg-rose-400/10",
    text: "text-rose-300",
    hoverText: "group-hover:text-rose-200",
    line: "bg-rose-300/55",
  },
};

export function dataTone(tone: DataTone = "accent") {
  return toneStyles[tone];
}

export function ToneBadge({
  tone = "accent",
  icon,
  children,
  className,
}: {
  tone?: DataTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const styles = dataTone(tone);

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        styles.border,
        styles.bg,
        styles.text,
        className
      )}
    >
      {icon ? <span className="flex-shrink-0">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function InfoCell({
  label,
  value,
  description,
  icon,
  tone = "accent",
  className,
}: {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: DataTone;
  className?: string;
}) {
  const styles = dataTone(tone);

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-lg border bg-black/[0.12] px-3 py-2",
        styles.border,
        className
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-px", styles.line)} />
      <div className="flex min-w-0 items-start gap-2">
        {icon ? <span className={cn("mt-0.5 flex-shrink-0", styles.text)}>{icon}</span> : null}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">{label}</p>
          <p className={cn("mt-1 truncate text-sm font-semibold", styles.text)}>{value}</p>
          {description ? <p className="mt-0.5 truncate text-xs text-white/40">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

interface MetricBaseProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: DataTone;
  className?: string;
}

const metricClasses =
  "group inline-flex min-h-8 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]";

function MetricInner({ label, value, icon, tone = "accent" }: MetricBaseProps) {
  const styles = dataTone(tone);

  return (
    <>
      {icon ? (
        <span
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025] text-white/48 transition-colors",
            "group-hover:border-white/[0.16]",
            styles.hoverText
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="inline-flex items-baseline gap-1.5">
        <span className={cn("text-sm font-semibold leading-none text-white transition-colors", styles.hoverText)}>
          {value}
        </span>
        <span className="text-sm text-white/48 transition-colors group-hover:text-white/70">
          {label}
        </span>
      </span>
    </>
  );
}

export function MetricLink({
  href,
  label,
  value,
  icon,
  tone = "accent",
  className,
  ...props
}: MetricBaseProps & LinkProps) {
  return (
    <Link href={href} className={cn(metricClasses, dataTone(tone).hoverText, className)} {...props}>
      <MetricInner label={label} value={value} icon={icon} tone={tone} />
    </Link>
  );
}

export function MetricButton({
  label,
  value,
  icon,
  tone = "accent",
  className,
  ...props
}: MetricBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(metricClasses, dataTone(tone).hoverText, className)} {...props}>
      <MetricInner label={label} value={value} icon={icon} tone={tone} />
    </button>
  );
}
