"use client";
import { useEffect, useState } from "react";
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-400">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-700/50";
      case "error":
        return "bg-red-900/90 border-red-700/50";
      default:
        return "bg-blue-900/90 border-blue-700/50";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300",
        getBgColor(),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: '16px',
        right: '16px',
        backgroundColor: type === 'error' ? 'rgba(239, 68, 68, 0.9)' : type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}
    >
      {getIcon()}
      <span className="text-white text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
