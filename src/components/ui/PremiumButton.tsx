"use client";

import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type PremiumButtonVariant = "primary" | "secondary";
type PremiumButtonSize = "md" | "lg";

type SharedPremiumButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  showArrow?: boolean;
};

type PremiumButtonLinkProps = SharedPremiumButtonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

type PremiumButtonNativeProps = SharedPremiumButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };

export type PremiumButtonProps =
  | PremiumButtonLinkProps
  | PremiumButtonNativeProps;

const sizeStyles: Record<PremiumButtonSize, string> = {
  md: "min-h-12 min-w-[180px] px-6 py-3 text-sm",
  lg: "min-h-[52px] min-w-[210px] px-7 py-4 text-sm sm:px-9",
};

const variantStyles: Record<PremiumButtonVariant, string> = {
  primary:
    "border-white/[0.16] bg-[linear-gradient(135deg,var(--color-accent)_0%,var(--color-accent-2)_55%,#f4d8ff_120%)] !text-white hover:border-white/30 hover:brightness-110",
  secondary:
    "border-white/[0.11] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.026))] text-white/90 backdrop-blur-xl hover:border-[rgba(var(--color-accent-2-rgb),0.34)] hover:bg-white/[0.075] hover:text-white",
};

function PremiumButtonChrome({
  variant,
  showArrow,
  children,
}: {
  variant: PremiumButtonVariant;
  showArrow: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {variant === "primary" ? (
        <>
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.42),transparent_34%),linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
          <span className="absolute inset-x-4 top-0 h-px bg-white/50" />
          <span className="absolute -left-1/3 top-0 h-full w-1/3 skew-x-[-18deg] bg-white/24 opacity-0 transition-all duration-500 group-hover:left-[115%] group-hover:opacity-100" />
        </>
      ) : (
        <>
          <span className="absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--color-accent-2-rgb),0.58),transparent)] opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
          <span className="absolute inset-y-3 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(var(--color-accent-2-rgb),0.5),transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--color-accent-2-rgb),0.14),transparent_44%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </>
      )}

      <span className="relative flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-0.5">
        {children}
        {showArrow && (
          <ArrowUpRight className="h-4 w-4 opacity-60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-95" />
        )}
      </span>
    </>
  );
}

export function PremiumButton(props: PremiumButtonProps) {
  const {
    children,
    className,
    variant = "primary",
    size = "lg",
    showArrow = variant === "secondary",
    ...rest
  } = props;

  const sharedClassName = cn(
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border font-semibold outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.66)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:translate-y-0 active:scale-[0.98]",
    sizeStyles[size],
    variantStyles[variant],
    className,
  );

  const content = (
    <PremiumButtonChrome variant={variant} showArrow={showArrow}>
      {children}
    </PremiumButtonChrome>
  );

  if ("href" in rest && rest.href) {
    return (
      <Link className={sharedClassName} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={sharedClassName}
      {...(rest as PremiumButtonNativeProps)}
    >
      {content}
    </button>
  );
}
