import { useRef, useEffect } from "react";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import SwiperJS from "@amitkk/basic/static/Swiper";

interface BlockFourProps {
  data: GenericBlock[];
  detail: BlockDetailProps;
}

function ProcessCard({ item, index }: { item: GenericBlock; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const badge = badgeRef.current;
    if (!card || !badge) return;

    const handleMouseEnter = () => {
      gsap.to(badge, { scale: 1.15, rotate: 6, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(badge, { scale: 1, rotate: 0, duration: 0.3, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className="group relative flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-xl cursor-pointer">
      <div ref={badgeRef} className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md transition-colors duration-300 group-hover:bg-gray-900">{String(index + 1).padStart(2, "0</div>

      <div>
        {item.media_id && (
          <div className="mb-4 relative h-10 w-10 overflow-hidden">
            <ResponsiveImage media={item.media_id} className="object-contain"/>
          </div>
        )}

        <h4 className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-primary md:text-xl">{item.heading}</h4>

        {item.content && (
          <div className="text-sm leading-relaxed text-gray-600 md:text-base [&_*]:text-gray-600" dangerouslySetInnerHTML={{ __html: item.content }}/>
        )}
      </div>

      <div className="mt-6 flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
        <span>Step {index + 1}</span>
        <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}

export default function BlockFour({ data, detail }: BlockFourProps) {
  const containerRef = useRef<HTMLElement>(null);
  const isCarousel = data?.length > 6;

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

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
  }, [data?.length]);

  if (!data || data.length === 0) return null;

  return (
    <section ref={containerRef} className="relative bg-white py-8 md:py-16">
      <div className="container mx-auto">
        {detail && (
          <div className="gsap-reveal  mb-8 md:mb-12">
            {detail.heading && (
              <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">{detail.heading}</h2>
            )}
            {detail.content_1 && (
              <div className="text-base leading-relaxed text-gray-600 md:text-lg" dangerouslySetInnerHTML={{ __html: detail.content_1 }}/>
            )}
          </div>
        )}

        {isCarousel ? (
          <div className="gsap-reveal overflow-hidden">
            <SwiperJS<GenericBlock>
              items={data}
              getItemKey={(item: GenericBlock, index?: number) => String(item._id || index)}
              renderItem={(item: GenericBlock, index: number) => (
                <ProcessCard item={item} index={index} />
              )}
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => (
              <div key={String(item._id || index)} className="gsap-reveal h-full">
                <ProcessCard item={item} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}