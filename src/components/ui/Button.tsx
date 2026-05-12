"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import {
  accentButtonVariants,
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, leftIcon, rightIcon, ...props }, ref) => {

    const isAccentVariant = accentButtonVariants.has(variant);

    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
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
