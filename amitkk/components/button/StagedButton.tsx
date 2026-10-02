"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

interface StagedButtonProps {
  children?: React.ReactNode;
  idleText?: string;
  loadingText?: string;
  successText?: string;
  className?: string;
}

export default function StagedButton({
  children,
  idleText = "Update",
  loadingText = "Updating...",
  successText = "Updated",
  className = "",
}: StagedButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const form = document.querySelector("form");

    if (!form) return;

    const handleSubmit = () => {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        setSuccess(true);

        setTimeout(() => {
          setSuccess(false);
        }, 1000);
      }, 1000);
    };

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-80 ${loading ? "scale-[0.98]" : "scale-100"} ${className}`}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}

      {success && !loading && <Check size={18} />}

      {loading
        ? loadingText
        : success
        ? successText
        : children || idleText}
    </button>
  );
}