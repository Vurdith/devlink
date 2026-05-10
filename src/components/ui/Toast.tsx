"use client";
import { useEffect, useState } from "react";
import { surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-400">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "error":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent-2)]">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-[rgba(var(--color-accent-2-rgb),0.12)] border-[rgba(var(--color-accent-2-rgb),0.30)]";
      case "error":
        return "bg-rose-500/12 border-rose-400/30";
      default:
        return "bg-[rgba(var(--color-accent-2-rgb),0.12)] border-[rgba(var(--color-accent-2-rgb),0.30)]";
    }
  };

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        surface("panelStrong", "fixed right-4 top-4 z-[999999] flex items-center gap-3 px-4 py-3 transition-all duration-300"),
        getBgColor(),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <span aria-hidden="true">{getIcon()}</span>
      <span className="text-white text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Dismiss notification"
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
