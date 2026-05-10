"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/config/navigation";

interface NavLinkItemProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const NavLinkItem = memo(function NavLinkItem({
  item,
  isActive,
  onClick,
  compact = false,
}: NavLinkItemProps) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.description}
      onClick={onClick}
      className={cn(
        "group relative flex min-h-11 min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.62)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090d]",
        isActive
          ? "border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.105)] text-white"
          : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.09] hover:bg-white/[0.045] hover:text-white",
        compact && "min-h-10 py-2"
      )}
      title={item.description}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full transition-opacity",
          isActive ? "bg-[var(--color-accent-2)] opacity-100" : "opacity-0"
        )}
      />
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
          isActive
            ? "border-[rgba(var(--color-accent-2-rgb),0.20)] bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)]"
            : "border-transparent bg-transparent text-[var(--muted-foreground)] group-hover:bg-white/[0.04] group-hover:text-[var(--color-accent-2)]"
        )}
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full transition-opacity",
          isActive ? "bg-[var(--color-accent-2)] opacity-100" : "bg-white/35 opacity-0 group-hover:opacity-60"
        )}
      />
    </Link>
  );
});
