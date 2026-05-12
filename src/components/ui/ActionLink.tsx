import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import {
  accentButtonVariants,
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

export interface ActionLinkProps
  extends Omit<ComponentProps<typeof Link>, "className" | "children"> {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function ActionLink({
  children,
  className,
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  ...props
}: ActionLinkProps) {
  const isAccentVariant = accentButtonVariants.has(variant);

  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {isAccentVariant && (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/18 via-transparent to-white/10" />
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/16 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]" />
          </span>
        </>
      )}
      <span className="relative z-10 flex items-center gap-2">
        {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
        {children}
        {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
      </span>
    </Link>
  );
}
