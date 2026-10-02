"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string | number;
  maxHeight?: string | number;
  variant?: "drawer" | "center";
  fullWidth?: boolean;
}

const getWidthClass = (width?: string | null | number) => {
  if (typeof width === "number") { return null; }

  switch (width) {
    case "50": return "md:w-1/2";
    case "70": return "md:w-3/4";
    case "100": return "md:w-3/4";
    case "150": return "md:w-full";
    default: return "md:w-1/3";
  }
};

export default function CustomModal({ open, handleClose, title, children, width, maxHeight = "100vh", variant = "drawer", fullWidth=false }: CustomModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      document.body.style.overflow = "auto";
      
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  if (!shouldRender || !mounted) return null;

  if (fullWidth) { width = "150"; }
  const widthClass = getWidthClass(width);

  const drawerAnimationClass = isVisible ? "translate-y-0 md:translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full";

  const modalContent = (
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <div onClick={handleClose} className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}/>
      <div className={`absolute bg-white shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out 
          ${variant === "drawer" 
            ? `bottom-0 right-0 left-0 h-[85vh] rounded-t-2xl md:top-0 md:left-auto md:h-full md:rounded-none ${widthClass} ${drawerAnimationClass}` 
            : `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl w-full ${widthClass}`
          }`} 
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}>
        <div className="flex items-center justify-between border-b px-5 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 transition" aria-label="Close Modal">
            <Image src="/images/icons/static/close.svg" alt="Close" width={18} height={18}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}