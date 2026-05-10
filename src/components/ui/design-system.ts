import { cn } from "@/lib/cn";

export const ui = {
  surface: {
    panel: "rounded-xl border border-white/[0.08] bg-[rgba(12,16,23,0.72)] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl",
    panelMuted: "rounded-xl border border-white/[0.08] bg-[rgba(12,16,23,0.58)] shadow-[0_14px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl",
    panelStrong: "rounded-xl border border-white/[0.08] bg-[rgba(12,16,23,0.96)] shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl",
    toolbar: "rounded-xl border border-white/[0.08] bg-[rgba(8,11,16,0.78)] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl",
    empty: "rounded-xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl",
  },
  menu: {
    panel: "overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(12,16,23,0.96)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
    item: "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-150 hover:border-white/[0.08] hover:bg-white/[0.045] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]",
    dangerItem: "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-150 hover:border-rose-400/20 hover:bg-rose-500/10 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/45",
  },
  icon: {
    cyan: "flex items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]",
    muted: "flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/55",
    amber: "flex items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]",
    danger: "flex items-center justify-center rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-300",
  },
  active: {
    cyan: "accent-halo-cyan border-[rgba(var(--color-accent-2-rgb),0.32)] bg-[rgba(var(--color-accent-2-rgb),0.10)]",
    cyanStrong: "accent-halo-cyan border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[rgba(var(--color-accent-2-rgb),0.14)] text-white",
    purple: "accent-halo-purple border-[rgba(var(--color-accent-rgb),0.34)] bg-[rgba(var(--color-accent-rgb),0.12)]",
  },
  motion: {
    lift: "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    press: "transition-all duration-150 active:scale-[0.98]",
  },
  control: {
    ghost: "border border-transparent transition-all duration-150 hover:border-white/[0.08] hover:bg-white/[0.045] active:scale-[0.985]",
    gradient: "border border-[rgba(var(--color-accent-2-rgb),0.32)] bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all duration-150 hover:brightness-110 active:scale-[0.985]",
    icon: "rounded-lg border border-white/[0.08] bg-white/[0.045] text-white/75 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.075] hover:text-white active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100",
    field: "w-full rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:bg-white/[0.05]",
  },
};

export function surface(kind: keyof typeof ui.surface = "panel", className?: string) {
  return cn(ui.surface[kind], className);
}

export function menuPanel(className?: string) {
  return cn(ui.menu.panel, className);
}

export function menuItem(className?: string) {
  return cn(ui.menu.item, className);
}

export function iconBox(kind: keyof typeof ui.icon = "cyan", className?: string) {
  return cn(ui.icon[kind], className);
}

export function skeleton(className?: string) {
  return cn("skeleton rounded-lg border border-white/[0.06]", className);
}
