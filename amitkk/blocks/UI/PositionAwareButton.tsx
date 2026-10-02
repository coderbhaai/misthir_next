"use client";

import { useRef } from "react";
import { cn } from "@amitkk/lib/utils";

interface PositionAwareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export default function PositionAwareButton({label, className, ...props}: PositionAwareButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty("--x", `${x}px`);
    btn.style.setProperty("--y", `${y}px`);
  };

  return (
    <button ref={btnRef} onMouseMove={handleMouseMove} className={cn(`relative overflow-hidden rounded-xl border border-white/20 bg-black px-6 py-3 text-white transition-all duration-300 before:absolute before:left-[var(--x)] before:top-[var(--y)] before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white/20 before:transition-all before:duration-500  :before:h-[300px] hover:before:w-[300px] `, className)} {...props}>
      <span className="relative z-10">{label}</span>
    </button>
  );
}