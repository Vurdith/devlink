"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { surface, ui } from "./design-system";

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  hidden?: boolean;
  className?: string;
  activeClassName?: string;
  activeHaloClassName?: string;
}

interface SegmentedTabsProps<T extends string> {
  items: SegmentedTabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: {
    item: "min-h-10 px-3 text-xs",
    icon: "h-5 w-5 [&>svg]:h-3.5 [&>svg]:w-3.5",
  },
  md: {
    item: "min-h-11 px-3 text-xs sm:px-4 sm:text-sm",
    icon: "h-5 w-5 [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4",
  },
};

export function SegmentedTabs<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  className,
  listClassName,
  itemClassName,
  size = "md",
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={surface("toolbar", cn("relative overflow-hidden p-1.5", className))}
      style={{
        background:
          "linear-gradient(180deg, rgba(12,16,23,0.74), rgba(8,11,16,0.60))",
      }}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn("flex max-w-full snap-x gap-1 overflow-x-auto overscroll-x-contain pb-px", listClassName)}
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item) => {
          if (item.hidden) return null;

          const selected = value === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              data-active={selected}
              aria-selected={selected}
              aria-current={selected ? "page" : undefined}
              onClick={() => onValueChange(item.id)}
              className={cn(
                "group relative flex flex-shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-lg border font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]",
                sizeClasses[size].item,
                selected
                  ? cn(ui.active.cyanStrong, "shadow-[0_0_24px_rgba(var(--color-accent-2-rgb),0.10),inset_0_1px_0_rgba(255,255,255,0.08)]")
                  : "border-transparent text-white/52 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/86",
                selected && item.activeHaloClassName,
                item.className,
                selected && item.activeClassName,
                itemClassName
              )}
            >
              {selected ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-px rounded-full bg-current opacity-80"
                />
              ) : null}
              {item.icon ? (
                <span
                  className={cn(
                    "flex items-center justify-center rounded-md transition-colors",
                    sizeClasses[size].icon,
                    selected
                      ? "bg-current/10 text-current"
                      : "text-white/45 group-hover:text-white/72"
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
              {typeof item.count === "number" ? (
                <span className={cn("text-white/40", selected && "text-current/70")}>
                  ({item.count})
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
