"use client";

import { useEffect, useState, useCallback, ReactNode, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

// Focus trap hook for modal accessibility
function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Find all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    // Focus the first focusable element or the container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      container.focus();
    }

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  return containerRef;
}

// Portal-based Tooltip component - won't clip at container boundaries
export const Tooltip = memo(function Tooltip({ 
  children, 
  content,
  side = "top"
}: { 
  children: ReactNode; 
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top;
      
      // Adjust position based on side
      switch (side) {
        case "bottom":
          y = rect.bottom + 8;
          break;
        case "left":
          x = rect.left - 8;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + 8;
          y = rect.top + rect.height / 2;
          break;
        default: // top
          y = rect.top - 8;
      }
      
      setPosition({ x, y });
    }
    setShowTooltip(true);
  };

  const getTransform = () => {
    switch (side) {
      case "bottom": return 'translate(-50%, 0)';
      case "left": return 'translate(-100%, -50%)';
      case "right": return 'translate(0, -50%)';
      default: return 'translate(-50%, -100%)'; // top
    }
  };

  const tooltipContent = showTooltip && mounted && createPortal(
    <div 
      className={cn(
        "fixed pointer-events-none transition-all duration-200 z-[99999]",
        showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: getTransform()
      }}
    >
      <div className="px-2.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[var(--color-accent)]/90 to-[var(--color-accent-hover)]/90 border border-[var(--color-accent)]/30 rounded-lg shadow-xl shadow-[var(--color-accent)]/20 whitespace-nowrap">
        {content}
      </div>
    </div>,
    document.body
  );

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      className="inline-block"
    >
      {children}
      {tooltipContent}
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
          ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]" 
          : "hover:bg-white/10 text-[var(--muted-foreground)] hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
  const focusTrapRef = useFocusTrap(isOpen);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current;

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
      role="presentation"
    >
      {/* Backdrop - solid black, no blur for performance */}
      <div 
        className="absolute inset-0 bg-black/90" 
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal container with focus trap */}
      <div 
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden",
          "glass-soft border border-white/10",
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
                  aria-label="Close modal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-white">{title}</h2>
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
          "focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20",
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
          "focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20",
          "transition-all",
          props.className
        )}
      />
    </div>
  );
});

// Confirmation modal for destructive actions (accessible alternative to native confirm())
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal = memo(function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
              isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {confirmText}
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <div className="px-5 py-4">
        <p className="text-white/70">{message}</p>
      </div>
    </BaseModal>
  );
});

export default BaseModal;

