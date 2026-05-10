"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useToast, ToastOptions } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, dismiss, toasts } = useToast();
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
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



