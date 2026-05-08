"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "glass" | "destructive" | "gradient" | "outline" | "glow";
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
      "relative inline-flex items-center justify-center font-semibold tracking-[0.01em] transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      "overflow-hidden",
      "active:scale-[0.98]"
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
        "shadow-[0_10px_28px_rgba(var(--color-accent-rgb),0.22)]",
        "hover:shadow-[0_14px_34px_rgba(var(--color-accent-rgb),0.28)]",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent),var(--color-accent)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent),var(--color-accent-hover)]"
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
      glass: cn(
        "bg-[var(--surface-2)] text-white",
        "border border-[var(--line-soft)]",
        "hover:bg-[var(--surface-3)] hover:border-[var(--line-strong)]"
      ),
      destructive: cn(
        "bg-gradient-to-r from-red-500 to-red-600 text-white",
        "hover:from-red-600 hover:to-red-700",
        "shadow-lg shadow-red-500/30",
        "border border-red-400/20"
      ),
      gradient: cn(
        "text-white border border-[rgba(var(--color-accent-rgb),0.36)]",
        "shadow-[0_12px_32px_rgba(var(--color-accent-rgb),0.24)]",
        "hover:shadow-[0_16px_38px_rgba(var(--color-accent-rgb),0.3)]",
        "bg-[linear-gradient(135deg,var(--color-accent),#6d5dfc_58%,rgba(var(--color-accent-2-rgb),0.92))]"
      ),
      outline: cn(
        "bg-transparent text-white",
        "border border-white/30",
        "hover:bg-white/10 hover:border-white/50"
      ),
      glow: cn(
        "text-white border border-[rgba(var(--color-accent-2-rgb),0.36)]",
        "shadow-[0_0_24px_rgba(var(--color-accent-2-rgb),0.22),0_12px_38px_rgba(var(--color-accent-rgb),0.2)]",
        "hover:shadow-[0_0_32px_rgba(var(--color-accent-2-rgb),0.26),0_14px_42px_rgba(var(--color-accent-rgb),0.24)]",
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
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-[inherit] pointer-events-none">
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/16 to-transparent skew-x-12" />
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
