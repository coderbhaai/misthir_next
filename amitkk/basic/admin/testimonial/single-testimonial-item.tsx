"use client";

import { useEffect, useRef } from "react";
import ContentRenderer from "@amitkk/basic/static/ContentRenderer";
import Image from "next/image";
import { Quote } from "lucide-react";
import gsap from "gsap";

export default function SingleTestimonialItem({ row, isActive }: { row: any; isActive: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const leftQuoteRef = useRef<SVGSVGElement>(null);
  const rightQuoteRef = useRef<SVGSVGElement>(null);

  const clientData = typeof row?.client_id === "object" ? row.client_id : row;
  const imagePath = typeof clientData?.media_id === "object" ? clientData?.media_id?.path : typeof row?.media_id === "object" ? row?.media_id?.path : null;
  const clientName = clientData?.name || row?.name || "Valued Client";
  const clientRole = clientData?.role || row?.role;
  const clientBrand = clientData?.brand || row?.brand;
  const initial = clientName.charAt(0) || "C";

  // TRIGGER 180° FLIP EVERY TIME THIS SLIDE BECOMES ACTIVE
  useEffect(() => {
    if (!isActive) {
      // RESET INACTIVE SLIDES OUT OF VIEW
      gsap.set(cardRef.current, { rotationY: 180, opacity: 0, scale: 0.8 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 1. FLIP CARD FROM 180° TO 0°
      tl.fromTo(
        cardRef.current,
        { rotationY: 180, opacity: 0, scale: 0.8 },
        { rotationY: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.2)" }
      )
      // 2. BADGE DROPS IN WITH REBOUND
      .fromTo(
        badgeRef.current,
        { opacity: 0, y: -60, scale: 0.2, rotation: -45 },
        { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" },
        "-=0.3"
      )
      // 3. QUOTES SPIN & SCALE IN
      .fromTo(
        [leftQuoteRef.current, rightQuoteRef.current],
        { opacity: 0, scale: 0, rotation: -180 },
        { opacity: 0.15, scale: 1, rotation: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.5)" },
        "-=0.3"
      )
      // 4. CONTENT & AUTHOR FADE / STAGGER UP
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.3"
      )
      .fromTo(
        authorRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35 },
        "-=0.25"
      );
    }, cardRef);

    return () => ctx.revert();
  }, [isActive]);

  return (
    <div className="[perspective:1200px] my-16 w-full flex justify-center">
      <div ref={cardRef} className="relative w-full max-w-4xl rounded-3xl bg-white/95 px-8 pt-16 pb-10 text-center shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-white/30 [transform-style:preserve-3d]">
        
        {/* BRAND LOGO BADGE */}
        <div ref={badgeRef} className="absolute -top-12 left-1/2 -translate-x-1/2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-2xl">
          <div className="relative flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-slate-50">
            {imagePath ? (
              <Image src={imagePath} alt={clientName} width={80} height={80} className="h-14 w-14 object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-orange-500 to-amber-500 text-2xl font-black text-white">{initial}</div>
            )}
          </div>
        </div>

        {/* QUOTE ICONS */}
        <Quote ref={leftQuoteRef} className="absolute top-6 left-8 h-16 w-16 text-orange-500 rotate-180 pointer-events-none" />
        <Quote ref={rightQuoteRef} className="absolute bottom-6 right-8 h-16 w-16 text-orange-500 pointer-events-none" />

        {/* TESTIMONIAL CONTENT */}
        <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="text-slate-700 text-base sm:text-lg md:text-xl font-medium leading-relaxed italic">
            <ContentRenderer content={row?.content || ""} />
          </div>
        </div>

        {/* AUTHOR & ROLE */}
        <div ref={authorRef} className="mt-8 border-t border-slate-100 pt-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">{clientName}</h3>
          <p className="text-xs sm:text-sm font-semibold text-orange-600">{clientRole ? `${clientRole}${clientBrand ? ` • ${clientBrand}` : ""}` : clientBrand || "Client Partner"}</p>
        </div>

      </div>
    </div>
  );
}