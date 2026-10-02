"use client";
import React, { createContext, useContext, useState } from "react";
import {ToastState, ShowToastFunction} from "@amitkk/basic/types/toastr";

export type ModalType = "contact" | "lead";

type ModalState = {
  type: ModalType | null;
  props?: any;
  sourceUrl?: string;
};

type ContextType = {
  openGlobalModal: (type: ModalType, props?: any) => void;
  closeModal: ShowToastFunction;
  showToast: ShowToastFunction;
  modal: ModalState;
};

const ModalContext = createContext<ContextType | null>(null);

export const useGlobalModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) { throw new Error( "Must be used inside provider" ); }

  return ctx;
};

export const GlobalModalProvider = ({ children }: { children: React.ReactNode; }) => {
  const [modal, setModal] = useState<ModalState>({type: null});
  const [toast, setToast] = useState<ToastState>(null);

  const showToast: ShowToastFunction = (type = "success", message = null) => {
    if (!type || !message) return;

    setToast({type, message});
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const openGlobalModal = (type: ModalType, props?: any) => {
    setModal({
      type,
      props,
      sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    });
  };

  const closeModal: ShowToastFunction = (toastType = "success", toastMessage = null) => {
    document.body.style.overflow = "auto";
    setModal({ type: null });
    if (toastType && toastMessage) { showToast(toastType, toastMessage); }
  };

  return (
    <ModalContext.Provider value={{ openGlobalModal, closeModal, showToast, modal }}>
      {children}

      {toast?.message && (
        <div className={`fixed top-5 right-5 z-[99999] min-w-[280px] rounded-xl px-4 py-3 text-white shadow-2xl animate-in slide-in-from-right duration-300 ${ toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-900" }`}>
          {toast.message}
        </div>
      )}
    </ModalContext.Provider>
  );
};