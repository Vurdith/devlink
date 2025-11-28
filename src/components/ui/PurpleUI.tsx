"use client";

import { cn } from "@/lib/cn";
import { forwardRef, HTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * Reusable purple-themed UI components for DevLink
 * These provide consistent styling across the app
 */

// ============================================================================
// PurpleCard - Glass card with purple accent
// ============================================================================
interface PurpleCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glow";
  padding?: "sm" | "md" | "lg";
}

export const PurpleCard = forwardRef<HTMLDivElement, PurpleCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const paddingStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const variantStyles = {
      default: "glass border border-purple-500/20 bg-purple-500/5",
      gradient: "glass border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5",
      glow: "glass border border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/10",
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
PurpleCard.displayName = "PurpleCard";

// ============================================================================
// PurpleSection - Section with icon header
// ============================================================================
interface PurpleSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const PurpleSection = forwardRef<HTMLDivElement, PurpleSectionProps>(
  ({ className, title, description, icon, headerAction, children, ...props }, ref) => {
    return (
      <PurpleCard ref={ref} className={className} {...props}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
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
      </PurpleCard>
    );
  }
);
PurpleSection.displayName = "PurpleSection";

// ============================================================================
// PurpleButton - Purple styled button
// ============================================================================
interface PurpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const PurpleButton = forwardRef<HTMLButtonElement, PurpleButtonProps>(
  ({ className, variant = "solid", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
    };

    const variantStyles = {
      solid: "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
      outline: "bg-transparent text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50",
      ghost: "bg-transparent text-purple-400 hover:bg-purple-500/10",
      gradient: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
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
PurpleButton.displayName = "PurpleButton";

// ============================================================================
// PurpleListItem - Interactive list item with purple hover
// ============================================================================
interface PurpleListItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  isActive?: boolean;
  isClickable?: boolean;
}

export const PurpleListItem = forwardRef<HTMLDivElement, PurpleListItemProps>(
  ({ className, icon, title, description, rightElement, isActive, isClickable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
          isClickable && "cursor-pointer",
          isActive
            ? "bg-purple-500/15 border border-purple-500/30"
            : "bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/20",
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isActive
              ? "bg-purple-500/20 text-purple-400"
              : "bg-white/10 text-[var(--muted-foreground)] group-hover:bg-purple-500/10 group-hover:text-purple-400"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium",
            isActive ? "text-purple-300" : "text-white"
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
PurpleListItem.displayName = "PurpleListItem";

// ============================================================================
// PurpleBadge - Purple themed badge
// ============================================================================
interface PurpleBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline" | "subtle";
}

export const PurpleBadge = forwardRef<HTMLSpanElement, PurpleBadgeProps>(
  ({ className, variant = "subtle", children, ...props }, ref) => {
    const variantStyles = {
      solid: "bg-purple-500 text-white",
      outline: "bg-transparent text-purple-400 border border-purple-500/40",
      subtle: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
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
PurpleBadge.displayName = "PurpleBadge";

// ============================================================================
// PurpleInput - Purple themed input
// ============================================================================
interface PurpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const PurpleInput = forwardRef<HTMLInputElement, PurpleInputProps>(
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
            "w-full h-11 rounded-xl bg-purple-500/5 border border-purple-500/20",
            "text-white placeholder:text-[var(--muted-foreground)]",
            "focus:border-purple-500/50 focus:bg-purple-500/10 focus:outline-none focus:ring-1 focus:ring-purple-500/30",
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
PurpleInput.displayName = "PurpleInput";

// ============================================================================
// PurpleToggle - Purple themed toggle switch
// ============================================================================
interface PurpleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const PurpleToggle = ({ checked, onChange, disabled, className }: PurpleToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
        checked
          ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
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
// PurpleDivider - Purple themed divider
// ============================================================================
interface PurpleDividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const PurpleDivider = forwardRef<HTMLDivElement, PurpleDividerProps>(
  ({ className, label, ...props }, ref) => {
    if (label) {
      return (
        <div ref={ref} className={cn("flex items-center gap-3 py-4", className)} {...props}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">{label}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn("h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent", className)}
        {...props}
      />
    );
  }
);
PurpleDivider.displayName = "PurpleDivider";









