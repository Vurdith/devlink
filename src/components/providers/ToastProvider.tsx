"use client";

import { createContext, useContext, ReactNode } from "react";
import { useToast, ToastOptions, ToastState } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, dismiss, toasts } = useToast();

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Render all toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={`${toast.title}${toast.description ? ` - ${toast.description}` : ''}`}
          type={toast.variant === "destructive" ? "error" : toast.variant === "success" ? "success" : "info"}
          duration={toast.duration}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}



