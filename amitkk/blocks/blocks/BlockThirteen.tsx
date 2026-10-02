"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import HeaderCrumbThree from "@amitkk/components/ui/HeaderCrumbThree";
import SwiperJS from "@amitkk/basic/static/Swiper";
import { MediaProps } from "@amitkk/basic/types/media";

interface BlockThirteenProps {
  data: GenericBlock[];
  detail: BlockDetailProps;
}

function FeatureCard({ item }: { item: GenericBlock }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const icon = iconRef.current;
    if (!card || !icon) return;

    const handleMouseEnter = () => {
      gsap.to(icon, { scale: 1.15, rotate: 5, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);



  // const imageSrc = item?.media_id?.path
  //   ? item.media_id.path.startsWith("http") || item.media_id.path.startsWith("/")
  //     ? item.media_id.path
  //     : `/${item.media_id.path}`
  //   : item?.media_path
  //   ? item.media_path.startsWith("http") || item.media_path.startsWith("/")
  //     ? item.media_path
  //     : `/${item.media_path}`
  //   : null;

  return (
    <div
      ref={cardRef}
      className="
        group relative flex h-full flex-col justify-between rounded-2xl bg-white p-6 md:p-8
        border border-gray-100 shadow-sm transition-all duration-300
        hover:-translate-y-2 hover:border-primary hover:bg-primary hover:shadow-xl
        cursor-pointer
      "
    >
      <div>
        {item.media_id && (
          <div
            ref={iconRef}
            className="
              mb-5 flex h-14 w-14 items-center justify-center
              rounded-2xl bg-primary/10 transition-colors duration-300
              group-hover:bg-white/20
            "
          >
            <Image
              src={(item?.media_id as MediaProps)?.path}
              width={30}
              height={30}
              alt={(item?.media_id as MediaProps)?.alt}
              className="h-7 w-7 object-contain"
              unoptimized
            />
          </div>
        )}

        <h3
          className="
            mb-3 text-xl font-semibold text-gray-900
            transition-colors duration-300
            group-hover:text-white
          "
        >
          {item.heading}
        </h3>

        {item.content && (
          <div
            className="
              text-base leading-relaxed text-gray-600
              transition-colors duration-300
              group-hover:text-white/90
              [&_*]:group-hover:text-white/90
            "
            dangerouslySetInnerHTML={{
              __html: item.content,
            }}
          />
        )}
      </div>

      <div className="mt-6 flex items-center text-sm font-semibold text-primary transition-colors duration-300 group-hover:text-white">
        <span>Explore details</span>
        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}

export default function BlockThirteen({ data, detail }: BlockThirteenProps) {
  const containerRef = useRef<HTMLElement>(null);
  const isCarousel = data?.length > 6;

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".gsap-reveal"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      }
    );
  }, []);

  if (!data?.length) return null;

  return (
    <section ref={containerRef} className="container py-6 md:py-12">
      <div className="gsap-reveal">
        <HeaderCrumbThree heading={detail?.heading} text={detail?.content_1} />
      </div>

      {isCarousel ? (
        <div className="gsap-reveal mt-8 overflow-hidden">
          <SwiperJS<GenericBlock>
            items={data}
            getItemKey={(item: GenericBlock, index?: number) => String(item._id || index)}
            renderItem={(item: GenericBlock) => <FeatureCard item={item} />}
            darkControls={true}
            slidesPerView={3}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.map((item: GenericBlock) => (
            <div key={String(item._id)} className="gsap-reveal h-full">
              <FeatureCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}