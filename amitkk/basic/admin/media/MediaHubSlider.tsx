"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import MediaLightbox from "./MediaLightbox";
import MediaThumb from "./ProductImageZoom";
import type { MediaHubProps, MediaProps } from "@amitkk/basic/types/media";
import type { PageDetailProps } from "@amitkk/basic/types/page";
import HeaderCrumbTwo from "@amitkk/components/ui/HeaderCrumbTwo";
import SwiperJS from "@amitkk/basic/static/Swiper";

interface Props {
  data: MediaHubProps[];
  details?: PageDetailProps;
}

const getMedia = (media_id?: MediaHubProps["media_id"]): MediaProps | null => {
  if (!media_id || typeof media_id === "string") {
    return null;
  }
  
  return media_id as MediaProps;
};

function ThumbItem({ img, onClick }: { img: MediaProps; onClick: () => void; }) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, { scale: 1.03, duration: 0.3, ease: "power2.out" });
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
    <div ref={itemRef} onClick={onClick} className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-50 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <MediaThumb image={img} onClick={onClick} />
    </div>
  );
}

export default function MediaHubSlider({ data = [], details }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const images = useMemo(() => {
    return data?.map((i) => getMedia(i.media_id)).filter((i): i is MediaProps => Boolean(i));
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || !images.length) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".gsap-reveal"),
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      }
    );
  }, [images.length]);

  if (!images.length) return null;

  const heading = details?.mediaHub_title?.trim() || "Check More Images";
  const text = details?.mediaHub_text?.trim() || "Explore Our Products";

  const openLightbox = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <section ref={containerRef} className="container py-6 md:py-12">
      <div className="gsap-reveal mb-8">
        <HeaderCrumbTwo heading={heading} text={text} />
      </div>

      {images.length < 4 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={String(img._id)} className="gsap-reveal">
              <ThumbItem img={img} onClick={() => openLightbox(i)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="gsap-reveal overflow-hidden">
          <SwiperJS<MediaProps>
            items={images}
            getItemKey={(img: MediaProps, idx?: number) => String(img._id || idx)}
            renderItem={(img: MediaProps, i: number) => (
              <ThumbItem img={img} onClick={() => openLightbox(i)} />
            )}
            darkControls={true}
            slidesPerView={4}
            spaceBetween={24}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          />
        </div>
      )}

      <MediaLightbox open={open} images={images} startIndex={index} onClose={() => setOpen(false)}/>
    </section>
  );
}