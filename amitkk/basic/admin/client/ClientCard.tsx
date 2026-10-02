import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { ClientProps } from "@amitkk/basic/types";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";

interface ClientCardProps {
  client?: ClientProps | string | null;
  className?: string;
  url?: string;
}

export default function ClientCard({ client, className = "", url }: ClientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const clientData = typeof client === "object" && client !== null ? client : null;

  useEffect(() => {
    const card = cardRef.current;
    const avatar = avatarRef.current;
    if (!card || !avatar) return;

    const handleMouseEnter = () => {
      gsap.to(card, { y: -2, duration: 0.2, ease: "power2.out" });
      gsap.to(avatar, { scale: 1.06, rotate: 2, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(card, { y: 0, duration: 0.2, ease: "power2.out" });
      gsap.to(avatar, { scale: 1, rotate: 0, duration: 0.3, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!clientData) return null;

  const { name, brand, role, media_id, status } = clientData;

  const cardContent = (
    <div ref={cardRef} className={`group relative flex items-center gap-4 rounded-2xl bg-white p-4 md:gap-5 md:p-5 ${className}`}>
      <div ref={avatarRef} className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner md:h-20 md:w-20">
        <ResponsiveImage media={media_id} alt={brand || name || "Client Logo"} className="w-full h-auto object-contain"/>
      </div>

      <div className="flex flex-1 flex-col justify-center min-w-0">
        {brand && ( <span className="mb-0.5 inline-flex items-center text-xs font-semibold tracking-wide uppercase text-primary">{brand}</span> )}
        {name && ( <h4 className="truncate text-base font-bold text-gray-900 md:text-lg group-hover:text-primary transition-colors duration-200">{name}</h4> )}
      </div>
    </div>
  );

  if (url) {
    const isExternal = url.startsWith("http");
    return (
      <Link 
        href={url} 
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="block"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}