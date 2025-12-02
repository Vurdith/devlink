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
      "relative inline-flex items-center justify-center font-semibold transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      "overflow-hidden",
      "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
    );

    const sizes: Record<Size, string> = {
      sm: "h-9 px-4 text-xs rounded-xl gap-2",
      md: "h-11 px-6 text-sm rounded-xl gap-2",
      lg: "h-13 px-8 text-base rounded-2xl gap-2.5",
      icon: "h-11 w-11 rounded-xl",
    };

    const isPurpleVariant = variant === "primary" || variant === "gradient" || variant === "glow";

    const variants: Record<Variant, string> = {
      primary: cn(
        "bg-gradient-to-r from-red-700 via-red-600 to-indigo-500 text-white",
        "hover:from-red-800 hover:via-red-700 hover:to-indigo-600",
        "shadow-[0_4px_20px_rgba(168,85,247,0.35)]",
        "hover:shadow-[0_6px_30px_rgba(168,85,247,0.5)]",
        "border border-red-500/30"
      ),
      secondary: cn(
        "bg-white/5 text-white",
        "border border-white/20",
        "hover:bg-white/10 hover:border-white/30",
        "backdrop-blur-sm"
      ),
      ghost: cn(
        "bg-transparent text-[var(--muted-foreground)]",
        "hover:bg-white/10 hover:text-white"
      ),
      glass: cn(
        "backdrop-blur-md bg-white/5 text-white",
        "border border-white/15",
        "hover:bg-white/10 hover:border-white/25"
      ),
      destructive: cn(
        "bg-gradient-to-r from-red-500 to-red-600 text-white",
        "hover:from-red-600 hover:to-red-700",
        "shadow-lg shadow-red-500/30",
        "border border-red-400/20"
      ),
      gradient: cn(
        "bg-gradient-to-r from-red-700 via-red-600 to-indigo-500 text-white",
        "hover:from-red-800 hover:via-red-700 hover:to-indigo-600",
        "shadow-[0_4px_25px_rgba(168,85,247,0.4)]",
        "hover:shadow-[0_8px_40px_rgba(168,85,247,0.55)]",
        "border border-red-500/40"
      ),
      outline: cn(
        "bg-transparent text-white",
        "border border-white/30",
        "hover:bg-white/10 hover:border-white/50"
      ),
      glow: cn(
        "bg-gradient-to-r from-red-700 via-red-600 to-indigo-500 text-white",
        "hover:from-red-800 hover:via-red-700 hover:to-indigo-600",
        "shadow-[0_0_25px_rgba(168,85,247,0.5),0_0_50px_rgba(168,85,247,0.3)]",
        "hover:shadow-[0_0_35px_rgba(168,85,247,0.6),0_0_70px_rgba(168,85,247,0.4)]",
        "border border-red-500/50"
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
        {isPurpleVariant && (
          <span className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10 pointer-events-none rounded-xl" />
        )}
        
        {/* Shimmer effect - CSS only */}
        {isPurpleVariant && (
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-xl pointer-events-none">
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </span>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
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
