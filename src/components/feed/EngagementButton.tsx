"use client";

import { memo, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const colorClasses = {
  red: { active: "border-rose-400/22 bg-rose-500/10 text-rose-300", hover: "hover:border-rose-400/22 hover:bg-rose-500/10 hover:text-rose-300", particle: "bg-rose-400" },
  green: { active: "border-emerald-400/22 bg-emerald-500/10 text-emerald-300", hover: "hover:border-emerald-400/22 hover:bg-emerald-500/10 hover:text-emerald-300", particle: "bg-emerald-400" },
  blue: { active: "border-[rgba(var(--color-accent-2-rgb),0.26)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]", hover: "hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-[rgba(var(--color-accent-2-rgb),0.09)] hover:text-[var(--color-accent-2)]", particle: "bg-[var(--color-accent-2)]" },
  yellow: { active: "border-amber-300/24 bg-amber-400/10 text-amber-200", hover: "hover:border-amber-300/22 hover:bg-amber-400/10 hover:text-amber-200", particle: "bg-amber-300" },
  gray: { active: "border-white/[0.08] bg-white/[0.035] text-[var(--muted-foreground)]", hover: "hover:border-white/[0.12] hover:bg-white/[0.055] hover:text-white", particle: "bg-gray-400" },
};

interface EngagementButtonProps {
  onClick?: () => void;
  isActive: boolean;
  activeColor: keyof typeof colorClasses;
  count?: number;
  label?: string;
  ariaLabel?: string;
  children: ReactNode;
  showExplosion?: boolean;
  disabled?: boolean;
}

export const EngagementButton = memo(function EngagementButton({
  onClick,
  isActive,
  activeColor,
  count,
  label,
  ariaLabel,
  children,
  showExplosion,
  disabled,
}: EngagementButtonProps) {
  const [particles, setParticles] = useState<number[]>([]);
  const colors = colorClasses[activeColor];

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (showExplosion) {
      const now = Date.now();
      setParticles(Array.from({ length: 6 }, (_, i) => now + i));
      setTimeout(() => setParticles([]), 500);
    }

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      aria-pressed={isActive}
      className={cn(
        "group flex min-h-11 items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-[var(--muted-foreground)] transition-all duration-200 active:scale-[0.96]",
        isActive && colors.active,
        colors.hover,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex items-center justify-center">
        {children}

        {particles.map((particle, index) => (
          <div
            key={particle}
            className={cn(
              "absolute w-1 h-1 rounded-full pointer-events-none",
              colors.particle
            )}
            style={{
              animation: `particle-${index % 6} 0.5s ease-out forwards`,
            }}
          />
        ))}
      </div>

      {count !== undefined && count > 0 && (
        <span className="text-xs font-medium tabular-nums">
          {count}
        </span>
      )}

      {label && (
        <span className="text-xs font-medium hidden sm:inline">
          {label}
        </span>
      )}
    </button>
  );
});
