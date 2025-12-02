"use client";

import { useEffect, useState, useCallback, ReactNode, memo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

// Tooltip component for action buttons
export const Tooltip = memo(function Tooltip({ 
  children, 
  content,
  side = "top"
}: { 
  children: ReactNode; 
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group">
      {children}
      <span className={cn(
        "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black/90 border border-white/10 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none",
        positionClasses[side]
      )}>
        {content}
      </span>
    </div>
  );
});

// Modal action button with optional tooltip
export const ModalActionButton = memo(function ModalActionButton({ 
  onClick, 
  tooltip, 
  children, 
  active,
  disabled,
  badge,
  className
}: { 
  onClick: () => void; 
  tooltip?: string; 
  children: ReactNode; 
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  className?: string;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-2.5 rounded-xl transition-colors",
        active 
          ? "bg-purple-500/20 text-purple-400" 
          : "hover:bg-white/10 text-[var(--muted-foreground)] hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
});

// Modal sizes
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95vw]",
};

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  headerRight?: ReactNode;
}

export const BaseModal = memo(function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "lg",
  className,
  contentClassName,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  headerRight,
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[5vh] sm:pt-[10vh] px-2 sm:px-4"
      style={{ contain: 'layout style paint' }}
    >
      {/* Backdrop - solid black, no blur for performance */}
      <div 
        className="absolute inset-0 bg-black/90" 
        onClick={handleBackdropClick} 
      />
      
      {/* Modal container */}
      <div 
        className={cn(
          "relative w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden",
          "bg-[#0d0d12] border border-purple-500/20",
          "shadow-2xl shadow-black/50",
          "animate-pop-in",
          sizeClasses[size],
          className
        )}
        style={{ contain: 'content' }}
      >
        {/* Header */}
        {(title || showCloseButton || headerRight) && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
            </div>
            {headerRight}
          </div>
        )}
        
        {/* Content - scrollable */}
        <div className={cn(
          "flex-1 overflow-y-auto min-h-0",
          contentClassName
        )}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-white/10 bg-black/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

// Modal input component for consistent styling
export const ModalInput = memo(function ModalInput({
  label,
  icon,
  ...props
}: {
  label?: string;
  icon?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5 text-white/70">
          {icon && <span className="inline-flex items-center gap-1.5">{icon}{label}</span>}
          {!icon && label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          "w-full h-11 px-4 rounded-xl bg-black/30 border border-white/10 text-white",
          "placeholder:text-white/30 outline-none",
          "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          props.className
        )}
      />
    </div>
  );
});

// Modal textarea component for consistent styling
export const ModalTextarea = memo(function ModalTextarea({
  label,
  ...props
}: {
  label?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5 text-white/70">{label}</label>
      )}
      <textarea
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white",
          "placeholder:text-white/30 outline-none resize-none",
          "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
          "transition-all",
          props.className
        )}
      />
    </div>
  );
});

export default BaseModal;

