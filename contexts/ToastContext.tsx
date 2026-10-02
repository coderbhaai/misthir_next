"use client";

import { ShowToastFunction, ToastType } from "@amitkk/basic/types/toastr";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastItem = {
  id: number;
  type?: ToastType | null;
  message?: string | null;
};

type ToastContextType = {
  showToast: ShowToastFunction;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) { throw new Error("useToast must be used inside ToastProvider"); }

  return ctx;
};

export const ToastProvider = ({children}: {children: React.ReactNode; }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast: ShowToastFunction =
    useCallback((type = "success", message = null) => {
        if (!type || !message) return;

        const id = Date.now();

        setToasts((prev) => [...prev, {id, type, message}]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
      []
    );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`min-w-[280px] rounded-xl px-4 py-3 text-white shadow-xl animate-in slide-in-from-right duration-300 ${toast.type === "success" ? "bg-green-300" : toast.type === "error" ? "bg-red-600" : "bg-gray-900"}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};