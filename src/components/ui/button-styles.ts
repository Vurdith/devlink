import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "gradient"
  | "outline"
  | "glow";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export const accentButtonVariants = new Set<ButtonVariant>([
  "primary",
  "gradient",
  "glow",
]);

export const buttonBase = cn(
  "group relative inline-flex items-center justify-center overflow-hidden font-semibold tracking-[0.01em] transition-all duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
);

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 rounded-lg px-4 text-xs",
  md: "h-11 gap-2 rounded-lg px-5 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-7 text-base",
  icon: "h-11 w-11 rounded-lg",
};

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: cn(
    "border border-[rgba(var(--color-accent-rgb),0.32)] text-white",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent),var(--color-accent)]",
    "hover:border-[rgba(var(--color-accent-2-rgb),0.46)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent),var(--color-accent-hover)] hover:brightness-110",
  ),
  secondary: cn(
    "border border-white/12 bg-white/[0.055] text-white",
    "hover:border-white/20 hover:bg-white/[0.09]",
  ),
  ghost: cn(
    "bg-transparent text-[var(--muted-foreground)]",
    "hover:bg-white/[0.045] hover:text-white",
  ),
  destructive: cn(
    "border border-red-400/20 bg-gradient-to-r from-red-500 to-red-600 text-white",
    "hover:from-red-600 hover:to-red-700 hover:brightness-110",
  ),
  gradient: cn(
    "border border-[rgba(var(--color-accent-rgb),0.36)] text-white",
    "bg-[linear-gradient(135deg,var(--color-accent-3),var(--color-accent)_58%,rgba(var(--color-accent-2-rgb),0.92))]",
    "hover:border-[rgba(var(--color-accent-2-rgb),0.48)] hover:brightness-110",
  ),
  outline: cn(
    "border border-white/[0.16] bg-transparent text-white",
    "hover:border-white/[0.24] hover:bg-white/[0.045]",
  ),
  glow: cn(
    "accent-halo-cyan border border-[rgba(var(--color-accent-2-rgb),0.36)] text-white",
    "bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))]",
    "hover:border-[rgba(var(--color-accent-2-rgb),0.56)] hover:brightness-110",
  ),
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}
