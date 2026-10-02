"use client";

import { useEffect, useState } from "react";
import { useGlobalModal } from "contexts/GlobalModalContext";
import { useMenu } from "contexts/MenuContext";

type DataFormProps = {
  module?: string;
  module_id?: string;
};

export default function LeadButton({ module= '', module_id = "" }: DataFormProps) {
  const { openGlobalModal } = useGlobalModal();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button onClick={() => openGlobalModal("lead", { module, module_id })} className={`fixed bottom-4 right-4 z-[1300] rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-action md:bottom-8 md:right-8 md:px-8 md:py-4 ${isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >Contact Us</button>
  );
}