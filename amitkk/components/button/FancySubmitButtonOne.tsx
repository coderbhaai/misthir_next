"use client";

import { useEffect, useRef } from "react";

interface FancySubmitButtonOneProps {
  text?: string;
  type?: "submit" | "button" | "reset";
  disabled?: boolean;
}

export default function FancySubmitButtonOne({
  text = "UPDATE",
  type = "submit",
  disabled = false,
}: FancySubmitButtonOneProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const seedRef = useRef<HTMLDivElement>(null);
  const clickRippleRef = useRef<HTMLDivElement>(null);
  const dropRippleRef = useRef<HTMLDivElement>(null);

  const playAnimation = () => {
    const outline = outlineRef.current;
    const label = labelRef.current;
    const seed = seedRef.current;
    const clickRipple = clickRippleRef.current;
    const dropRipple = dropRippleRef.current;

    if (!outline || !label || !seed || !clickRipple || !dropRipple) {
      return;
    }

    const duration = 1200;

    outline.animate(
      [
        { clipPath: "inset(0 0 0 0 round 999px)", offset: 0 },
        { clipPath: "inset(0 0 50% 0 round 999px)", offset: 0.2 },
        { clipPath: "inset(0 50% 100% 50% round 999px)", offset: 0.35 },
        { clipPath: "inset(95% 50% 0 50% round 999px)", offset: 0.8 },
        { clipPath: "inset(0 0 0 0 round 999px)", offset: 1 },
      ],
      { duration, easing: "linear" }
    );

    label.animate(
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 0, offset: 0.3 },
        { opacity: 0, offset: 0.75 },
        { opacity: 1, offset: 1 },
      ],
      { duration, easing: "ease-in-out" }
    );

    seed.animate(
      [
        { width: "2px", height: "2px", opacity: 0, offset: 0 },
        { width: "2px", height: "2px", opacity: 1, offset: 0.35 },
        { width: "2px", height: "34px", opacity: 1, offset: 0.55 },
        { width: "2px", height: "34px", opacity: 1, offset: 0.75 },
        { width: "240px", height: "2px", opacity: 1, offset: 0.92 },
        { width: "240px", height: "2px", opacity: 0, offset: 1 },
      ],
      { duration, easing: "ease-in-out" }
    );

    clickRipple.animate(
      [
        { width: "0px", height: "0px", opacity: 0.35 },
        { width: "140px", height: "140px", opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(0,0,.3,1)" }
    );

    dropRipple.animate(
      [
        { width: "0px", height: "0px", opacity: 0.25 },
        { width: "220px", height: "220px", opacity: 0 },
      ],
      {
        duration: 700,
        delay: 250,
        easing: "cubic-bezier(0,0,.3,1)",
      }
    );
  };

  useEffect(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const handleNativeClick = () => {      
      try {
        playAnimation();
      } catch (error) {
        console.error("ANIMATION ERROR", error);
      }
    };

    button.addEventListener("click", handleNativeClick);

    return () => { button.removeEventListener("click", handleNativeClick); };
  }, []);

  return (
    <button ref={buttonRef} type={type} disabled={disabled} className="relative flex h-14 min-w-[250px] items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium tracking-[0.22em] text-blue-600 my-5">
      <div ref={outlineRef} className="pointer-events-none absolute inset-0 rounded-full border-2 border-blue-600"/>
      <div ref={seedRef} className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 opacity-0"/>
      <div ref={clickRippleRef} className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-600/40"/>
      <div ref={dropRippleRef} className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-600/25"/>
      <span ref={labelRef} className="relative z-10 select-none uppercase">{text}</span>
    </button>
  );
}