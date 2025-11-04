import { ButtonHTMLAttributes, forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "glass" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const base =
      "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

    const sizes: Record<Size, string> = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const variants: Record<Variant, string> = {
      primary:
        "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[color-mix(in_oklab,var(--accent)_86%,black)] glow",
      secondary:
        "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_90%,white)] border border-white/10",
      ghost:
        "bg-transparent hover:bg-white/5 text-[var(--foreground)] border border-transparent",
      glass: "glass text-[var(--foreground)] hover:border-white/25",
      destructive:
        "bg-[#ef4444] text-white hover:bg-[#dc2626]",
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!isMounted) {
      return (
        <button
          ref={ref}
          className={cn(base, sizes[size], variants[variant], className)}
          disabled={disabled || isLoading}
          suppressHydrationWarning={true}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        disabled={disabled || isLoading}
        suppressHydrationWarning={true}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-2)] border-r-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";


