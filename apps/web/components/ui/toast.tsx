'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (title: string, options?: { description?: string; type?: ToastType }) => void;
  toastSuccess: (title: string, description?: string) => void;
  toastError: (title: string, description?: string) => void;
  toastInfo: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, options?: { description?: string; type?: ToastType }) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastMessage = {
        id,
        title,
        description: options?.description,
        type: options?.type || 'info',
      };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toastSuccess = useCallback((title: string, description?: string) => toast(title, { description, type: 'success' }), [toast]);
  const toastError = useCallback((title: string, description?: string) => toast(title, { description, type: 'error' }), [toast]);
  const toastInfo = useCallback((title: string, description?: string) => toast(title, { description, type: 'info' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError, toastInfo }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-lg text-xs transition-all duration-200 bg-white ${
                isSuccess
                  ? 'border-emerald-200 text-emerald-800'
                  : isError
                  ? 'border-rose-200 text-rose-800'
                  : 'border-amber-200 text-amber-800'
              }`}
            >
              {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />}
              {isError && <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />}

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{t.title}</div>
                {t.description && <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.description}</div>}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (title: string) => console.log('[Toast]', title),
      toastSuccess: (title: string) => console.log('[Toast Success]', title),
      toastError: (title: string) => console.log('[Toast Error]', title),
      toastInfo: (title: string) => console.log('[Toast Info]', title),
    };
  }
  return context;
}
