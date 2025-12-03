"use client";

import { cn } from "@/lib/cn";
import { forwardRef, HTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * Reusable red-themed UI components for DevLink
 * These provide consistent styling across the app
 */

// ============================================================================
// RedCard - Glass card with red accent
// ============================================================================
interface RedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glow";
  padding?: "sm" | "md" | "lg";
}

export const RedCard = forwardRef<HTMLDivElement, RedCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const paddingStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const variantStyles = {
      default: "glass border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5",
      gradient: "glass border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-accent)]/5",
      glow: "glass border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 shadow-lg shadow-[var(--color-accent)]/10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          paddingStyles[padding],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
RedCard.displayName = "RedCard";

// ============================================================================
// RedSection - Section with icon header
// ============================================================================
interface RedSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const RedSection = forwardRef<HTMLDivElement, RedSectionProps>(
  ({ className, title, description, icon, headerAction, children, ...props }, ref) => {
    return (
      <RedCard ref={ref} className={className} {...props}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-accent)]/25">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {description && (
                <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
              )}
            </div>
          </div>
          {headerAction}
        </div>
        {children}
      </RedCard>
    );
  }
);
RedSection.displayName = "RedSection";

// ============================================================================
// RedButton - Red styled button
// ============================================================================
interface RedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const RedButton = forwardRef<HTMLButtonElement, RedButtonProps>(
  ({ className, variant = "solid", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
    };

    const variantStyles = {
      solid: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-[var(--color-accent)]/40",
      outline: "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/50",
      ghost: "bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",
      gradient: "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent-hover)] shadow-lg shadow-[var(--color-accent)]/25",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  }
);
RedButton.displayName = "RedButton";

// ============================================================================
// RedListItem - Interactive list item with red hover
// ============================================================================
interface RedListItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  isActive?: boolean;
  isClickable?: boolean;
}

export const RedListItem = forwardRef<HTMLDivElement, RedListItemProps>(
  ({ className, icon, title, description, rightElement, isActive, isClickable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
          isClickable && "cursor-pointer",
          isActive
            ? "bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30"
            : "bg-white/5 border border-white/10 hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/20",
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isActive
              ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
              : "bg-white/10 text-[var(--muted-foreground)] group-hover:bg-[var(--color-accent)]/10 group-hover:text-[var(--color-accent)]"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium",
            isActive ? "text-[var(--color-accent)]" : "text-white"
          )}>
            {title}
          </div>
          {description && (
            <div className="text-sm text-[var(--muted-foreground)]">{description}</div>
          )}
        </div>
        {rightElement}
      </div>
    );
  }
);
RedListItem.displayName = "RedListItem";

// ============================================================================
// RedBadge - Red themed badge
// ============================================================================
interface RedBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline" | "subtle";
}

export const RedBadge = forwardRef<HTMLSpanElement, RedBadgeProps>(
  ({ className, variant = "subtle", children, ...props }, ref) => {
    const variantStyles = {
      solid: "bg-[var(--color-accent)] text-white",
      outline: "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)]/40",
      subtle: "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
RedBadge.displayName = "RedBadge";

// ============================================================================
// RedInput - Red themed input
// ============================================================================
interface RedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const RedInput = forwardRef<HTMLInputElement, RedInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20",
            "text-white placeholder:text-[var(--muted-foreground)]",
            "focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-accent)]/10 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30",
            "transition-all duration-200",
            icon ? "pl-11 pr-4" : "px-4",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
RedInput.displayName = "RedInput";

// ============================================================================
// RedToggle - Red themed toggle switch
// ============================================================================
interface RedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const RedToggle = ({ checked, onChange, disabled, className }: RedToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
        checked
          ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] shadow-lg shadow-[var(--color-accent)]/30"
          : "bg-white/10 border border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
};

// ============================================================================
// RedDivider - Red themed divider
// ============================================================================
interface RedDividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const RedDivider = forwardRef<HTMLDivElement, RedDividerProps>(
  ({ className, label, ...props }, ref) => {
    if (label) {
      return (
        <div ref={ref} className={cn("flex items-center gap-3 py-4", className)} {...props}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">{label}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn("h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent", className)}
        {...props}
      />
    );
  }
);
RedDivider.displayName = "RedDivider";













