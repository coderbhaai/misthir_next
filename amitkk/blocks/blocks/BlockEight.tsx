"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import SwiperJS from "@amitkk/basic/static/Swiper";

export interface BlockEightItem {
  title?: string;
  image?: any;
  url?: string;
}

export interface BlockEightProps {
  items?: BlockEightItem[];
  data?: GenericBlock[];
  detail?: BlockDetailProps;
}

function RenderItem({ item }: { item: BlockEightItem }) {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, { scale: 1.08, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Link
      href={item.url || "#"}
      className="group flex flex-col items-center justify-center gap-3 py-3 text-center no-underline"
    >
      <div
        ref={circleRef}
        className="
          relative flex h-20 w-20 items-center justify-center overflow-hidden
          rounded-full border border-gray-200 bg-white p-2 shadow-sm
          transition-colors duration-300 group-hover:border-primary group-hover:shadow-md
          md:h-24 md:w-24
        "
      >
        <ResponsiveImage
          media={item.image}
          alt={item.title}
          className="h-full w-full object-cover rounded-full"
        />
      </div>

      <p className="break-words px-2 text-sm font-semibold text-gray-800 transition-colors duration-300 group-hover:text-primary md:text-base">
        {item.title}
      </p>
    </Link>
  );
}

export default function BlockEight({ items, data, detail }: BlockEightProps) {
  const containerRef = useRef<HTMLElement>(null);

  const normalized: BlockEightItem[] =
    Array.isArray(items) && items.length > 0
      ? items
      : Array.isArray(data) && data.length > 0
      ? data.map((d) => ({
          title: d.heading,
          image: d.media_id || "/images/static/default.jpg",
          url: d.url,
        }))
      : [];

  useEffect(() => {
    if (!containerRef.current || !normalized.length) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".gsap-reveal"),
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      }
    );
  }, [normalized.length]);

  if (!normalized.length) {
    return (
      <div className="py-6 text-center text-gray-500 md:py-12">
        No items to display
      </div>
    );
  }

  const isCarousel = normalized.length > 4;

  return (
    <section ref={containerRef} className="bg-white py-6 md:py-12">
      <div className="container mx-auto px-4">
        {detail?.heading && (
          <div className="gsap-reveal mb-8 text-center">
            <h2 className="mb-4 text-xl font-bold leading-snug text-gray-900 md:text-2xl xl:text-3xl">
              {detail.heading}
            </h2>

            {detail?.content_1 && (
              <div
                className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base"
                dangerouslySetInnerHTML={{
                  __html: detail.content_1,
                }}
              />
            )}
          </div>
        )}

        {isCarousel ? (
          <div className="gsap-reveal overflow-hidden">
            <SwiperJS<BlockEightItem>
              items={normalized}
              getItemKey={(item: BlockEightItem, idx?: number) => String(idx)}
              renderItem={(item: BlockEightItem) => (
                <div className="mx-auto w-[120px] md:w-[140px]">
                  <RenderItem item={item} />
                </div>
              )}
              darkControls={true}
              slidesPerView={5}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 12 },
                480: { slidesPerView: 3, spaceBetween: 16 },
                768: { slidesPerView: 4, spaceBetween: 20 },
                1024: { slidesPerView: 5, spaceBetween: 24 },
              }}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {normalized.map((item, idx) => (
              <div key={idx} className="gsap-reveal w-[120px] md:w-[140px]">
                <RenderItem item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}