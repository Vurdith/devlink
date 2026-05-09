"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "gradient" | "outline" | "glow";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, leftIcon, rightIcon, ...props }, ref) => {

    const base = cn(
      "group relative inline-flex items-center justify-center font-semibold tracking-[0.01em] transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      "overflow-hidden",
      "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
    );

    const sizes: Record<Size, string> = {
      sm: "h-9 px-4 text-xs rounded-lg gap-2",
      md: "h-11 px-5 text-sm rounded-lg gap-2",
      lg: "h-13 px-7 text-base rounded-xl gap-2.5",
      icon: "h-11 w-11 rounded-lg",
    };

    const isAccentVariant = variant === "primary" || variant === "gradient" || variant === "glow";

    // Theme-aware variants using CSS variables
    const variants: Record<Variant, string> = {
      primary: cn(
        "text-white border border-[rgba(var(--color-accent-rgb),0.32)]",
        "hover:border-[rgba(var(--color-accent-2-rgb),0.46)] hover:brightness-110",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent),var(--color-accent)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent),var(--color-accent-hover)]"
      ),
      secondary: cn(
        "bg-white/[0.055] text-white",
        "border border-white/12",
        "hover:bg-white/[0.09] hover:border-white/20"
      ),
      ghost: cn(
        "bg-transparent text-[var(--muted-foreground)]",
        "hover:bg-white/10 hover:text-white"
      ),
      destructive: cn(
        "bg-gradient-to-r from-red-500 to-red-600 text-white",
        "hover:from-red-600 hover:to-red-700 hover:brightness-110",
        "border border-red-400/20"
      ),
      gradient: cn(
        "text-white border border-[rgba(var(--color-accent-rgb),0.36)]",
        "hover:border-[rgba(var(--color-accent-2-rgb),0.48)] hover:brightness-110",
        "bg-[linear-gradient(135deg,var(--color-accent),#6d5dfc_58%,rgba(var(--color-accent-2-rgb),0.92))]"
      ),
      outline: cn(
        "bg-transparent text-white",
        "border border-white/30",
        "hover:bg-white/10 hover:border-white/50"
      ),
      glow: cn(
        "text-white border border-[rgba(var(--color-accent-2-rgb),0.36)]",
        "accent-halo-cyan hover:border-[rgba(var(--color-accent-2-rgb),0.56)] hover:brightness-110",
        "bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))]"
      ),
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {/* Inner gradient overlay for depth on red buttons */}
        {isAccentVariant && (
          <span className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/10 pointer-events-none rounded-[inherit]" />
        )}
        
        {/* Shimmer effect - CSS only */}
        {isAccentVariant && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/16 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]" />
          </span>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]">
            <span className="w-5 h-5 border-2 border-white/80 border-r-transparent rounded-full animate-spin" />
          </span>
        )}
        
        {/* Content */}
        <span className={cn("relative z-10 flex items-center gap-2", isLoading && "opacity-0")}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
