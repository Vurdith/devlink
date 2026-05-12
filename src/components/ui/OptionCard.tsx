import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ui } from "./design-system";

interface OptionCardChromeProps {
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function optionCardClass({ selected, disabled, className }: Omit<OptionCardChromeProps, "children">) {
  return cn(
    "group flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200",
    selected
      ? cn(ui.active.cyan, "text-white")
      : cn(ui.surface.empty, "text-[var(--muted-foreground)] hover:border-white/[0.14] hover:bg-white/[0.045]"),
    disabled && "cursor-not-allowed opacity-60",
    className
  );
}

export function OptionCard({
  selected,
  disabled,
  children,
  className,
  ...props
}: OptionCardChromeProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={optionCardClass({ selected, disabled, className })} {...props}>
      {children}
    </div>
  );
}

export function OptionButton({
  selected,
  disabled,
  children,
  className,
  ...props
}: OptionCardChromeProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      className={optionCardClass({ selected, disabled, className })}
      {...props}
    >
      {children}
    </button>
  );
}
