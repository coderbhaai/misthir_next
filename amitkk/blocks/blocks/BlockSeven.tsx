import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import HeaderCrumbThree from "@amitkk/components/ui/HeaderCrumbThree";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import SwiperJS from "@amitkk/basic/static/Swiper";

interface BlockSevenProps {
  data?: GenericBlock[];
  detail?: BlockDetailProps;
}

function CardItem({ item }: { item: GenericBlock }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const img = imageRef.current;
    if (!card || !img) return;

    const handleMouseEnter = () => {
      gsap.to(img, { scale: 1.08, duration: 0.4, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const content = (
    <div ref={cardRef} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-gray-200 hover:shadow-xl cursor-pointer">
      <div className="relative h-52 w-full overflow-hidden">
        <div ref={imageRef} className="h-full w-full">
          <ResponsiveImage media={item.media_id} className="h-full w-full object-cover"/>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <h4 className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white md:text-base line-clamp-2 transition-transform duration-300 group-hover:translate-x-1">{item?.heading}</h4>
      </div>

      {item?.content && (
        <div className="flex flex-1 flex-col justify-between p-4 md:p-5">
          <div className="line-clamp-3 text-sm leading-relaxed text-gray-600 md:text-base" dangerouslySetInnerHTML={{ __html: item.content }}/>
          {item?.url &&(
            <div className="mt-4 flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
              <span>Read More</span>
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (item?.url) {
    return (
      <Link href={item.url} className="block h-full w-full">{content}</Link>
    );
  }

  return content;
}

export default function BlockSeven({ data = [], detail }: BlockSevenProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".gsap-reveal"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      }
    );
  }, [data.length]);

  if (!data?.length) return null;

  return (
    <section ref={containerRef} className="container bg-white py-6 md:py-12">
      <div className="gsap-reveal">
        <HeaderCrumbThree heading={detail?.heading} text={detail?.content_1} />
      </div>

      <div className="gsap-reveal mt-8 overflow-hidden">
        <SwiperJS<GenericBlock>
          items={data}
          getItemKey={(item: GenericBlock, index?: number) => String(item._id || index)}
          renderItem={(item: GenericBlock) => <CardItem item={item} />}
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
    </section>
  );
}