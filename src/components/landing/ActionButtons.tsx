"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function PrimaryButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[linear-gradient(135deg,var(--color-accent-3),var(--color-accent)_56%,rgba(var(--color-accent-2-rgb),0.92))] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(var(--color-accent-2-rgb),0.50)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.68)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:translate-y-0 active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/10" />
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/16 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

export function SecondaryButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.045] px-6 py-3 text-sm font-semibold text-white/82 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.56)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:translate-y-0 active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
