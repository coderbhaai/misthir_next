import React from "react";

type StickyFormFooterProps = {
  title: string;
  type?: "submit" | "button";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  formId?: string;
  disabled?: boolean;
};

export default function StickyFormFooter({
  title,
  type = "submit",
  onClick,
  formId,
  disabled=false
}: StickyFormFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t bg-white p-4">
      <button 
        type={type} 
        onClick={onClick}
        className="w-full rounded-md bg-primary px-4 py-2 text-white transition hover:opacity-90"
      >
        {title}
      </button>
    </div>
  );
}