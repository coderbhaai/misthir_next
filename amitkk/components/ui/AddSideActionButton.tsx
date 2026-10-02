"use client";

import React from "react";
import { Plus } from "lucide-react";

interface AddActionButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  size?: number | string;
  variant?: "icon" | "menuItem";
}

export default function AddActionButton({
  onClick,
  title = "Add New Item",
  disabled = false,
  size = "56px",
  variant = "icon",
}: AddActionButtonProps) {
  if (disabled) return null;
  const isMenu = variant === "menuItem";

  const wrapperClass = isMenu 
    ? "col-span-12 md:col-span-2 flex items-center justify-center cursor-pointer p-3 text-sm font-medium text-blue-600 bg-gray-50 hover:bg-gray-100 transition-colors select-none gap-1.5"
    : "col-span-12 md:col-span-3 flex items-center justify-center";

  if (isMenu) {
    return (
      <div className={wrapperClass} onClick={onClick}>
        <Plus className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <button type="button" onClick={onClick} title={title} style={{ height: size, width: size }} className="rounded-xl border border-gray-300 bg-white flex items-center justify-center cursor-pointer transition-all box-sizing-border-box flex-shrink-0 hover:border-blue-500">
        <Plus className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}