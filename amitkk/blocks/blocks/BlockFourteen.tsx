"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import HeaderCrumbThree from "@amitkk/components/ui/HeaderCrumbThree";
import SwiperJS from "@amitkk/basic/static/Swiper";
import { MediaProps } from "@amitkk/basic/types/media";

interface BlockFourteenProps {
  data: GenericBlock[];
  detail: BlockDetailProps;
}

function SliderCard({ item }: { item: GenericBlock }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const icon = iconRef.current;
    if (!card || !icon) return;

    const handleMouseEnter = () => {
      gsap.to(icon, { y: -6, scale: 1.1, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(icon, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className="group relative flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:shadow-xl cursor-pointer">
      <div>
        {item.media_id && (
          <div ref={iconRef} className="mb-6 inline-block overflow-hidden rounded-xl bg-gray-50 p-3 group-hover:bg-white/10">
            <Image src={(item?.media_id as MediaProps)?.path} width={40} height={40} alt={(item?.media_id as MediaProps)?.alt} className="h-10 w-10 object-contain" unoptimized/>
          </div>
        )}

        <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-white">{item.heading}</h3>

        {item.content && (
          <div className="text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-white/90 [&_*]:group-hover:text-white/90" dangerouslySetInnerHTML={{ __html: item.content }}/>
        )}
      </div>
    </div>
  );
}

export default function BlockFourteen({ data, detail }: BlockFourteenProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".gsap-reveal"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      }
    );
  }, []);

  if (!data?.length) return null;

  return (
    <section ref={containerRef} className="container py-8 md:py-14">
      {detail?.content_2 && (
        <div className="gsap-reveal mb-8">
          <HeaderCrumbThree heading={detail?.content_2} text={detail?.content_3} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12 items-stretch">
        <div className="gsap-reveal md:col-span-4 flex flex-col">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 shadow-sm">
            <HeaderCrumbThree heading={detail?.heading} text={detail?.content_1} />
          </div>
        </div>

        <div className="gsap-reveal md:col-span-8 overflow-hidden">
          <SwiperJS<GenericBlock>
            items={data}
            getItemKey={(item, index) => String(item._id || index)}
            renderItem={(item) => <SliderCard item={item} />}
            darkControls={true}
            slidesPerView={2}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 1.5, spaceBetween: 16 },
              1024: { slidesPerView: 2, spaceBetween: 24 },
            }}
          />
        </div>
      </div>
    </section>
  );
}