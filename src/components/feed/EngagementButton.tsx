"use client";

import { memo, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const colorClasses = {
  red: { active: "text-red-500", hover: "hover:text-red-500 hover:bg-red-500/10", particle: "bg-red-500" },
  green: { active: "text-green-500", hover: "hover:text-green-500 hover:bg-green-500/10", particle: "bg-green-500" },
  blue: { active: "text-blue-500", hover: "hover:text-blue-500 hover:bg-blue-500/10", particle: "bg-blue-500" },
  yellow: { active: "text-yellow-500", hover: "hover:text-yellow-500 hover:bg-yellow-500/10", particle: "bg-yellow-500" },
  gray: { active: "text-[var(--muted-foreground)]", hover: "hover:text-white hover:bg-white/5", particle: "bg-gray-400" },
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
        "group flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 active:scale-90",
        isActive ? colors.active : "text-[var(--muted-foreground)]",
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
