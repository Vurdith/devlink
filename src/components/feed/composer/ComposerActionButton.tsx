"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface ComposerActionButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  badge?: number;
  delay?: number;
  shortcut?: string;
}

export const ComposerActionButton = memo(function ComposerActionButton({
  onClick,
  title,
  children,
  active,
  badge,
  delay = 0,
  shortcut,
}: ComposerActionButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    }
    setShowTooltip(true);
  }, []);

  const tooltipContent = showTooltip && mounted && createPortal(
    <div
      className={cn("fixed pointer-events-none transition-all duration-300 z-[9999]", showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95")}
      style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
    >
      <div className={surface("panelStrong", "relative px-3 py-1.5")}>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-bold text-white tracking-tight">{title}</span>
          {shortcut ? (
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-md">
              {shortcut}
            </kbd>
          ) : null}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-[var(--color-accent)]/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#0c0e14]" />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "icon-btn p-2.5 rounded-xl transition-all relative",
          active
            ? ui.active.cyan
            : "text-gray-400 hover:text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)]"
        )}
        style={{ animationDelay: `${delay * 0.05}s` }}
      >
        {children}
        {badge !== undefined && badge > 0 ? (
          <span className="badge-animated absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(var(--color-accent-2-rgb),0.32)] bg-[var(--color-accent)] text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </button>
      {tooltipContent}
    </div>
  );
});
