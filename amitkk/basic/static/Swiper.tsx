"use client";

import { ReactNode, useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFlip, EffectCoverflow, EffectFade } from "swiper/modules";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export interface CarouselItem {
  id?: string | number;
  _id?: string | number;
  title?: string;
  image?: string;
  description?: string;
  role?: string;
}

export interface UniversalSwiperProps<T> {
  items?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  getItemKey?: (item: T, index?: number) => string | number;
  effect?: "slide" | "flip" | "coverflow" | "fade";
  slidesPerView?: number;
  spaceBetween?: number;
  loop?: boolean;
  speed?: number;
  autoplayDelay?: number | false;
  breakpoints?: Record<number, { slidesPerView: number; spaceBetween?: number }>;
  className?: string;
  cardClassName?: string;
  darkControls?: boolean;
}

export default function SwiperJS<T = CarouselItem>({
  items = [],
  renderItem,
  getItemKey,
  effect = "slide",
  slidesPerView = 1,
  spaceBetween = 16,
  loop = true,
  speed = 450,
  autoplayDelay = 3500,
  breakpoints,
  className = "",
  cardClassName = "",
  darkControls = false,
}: UniversalSwiperProps<T>) {
  const rawId = useId();
  const instanceId = rawId.replace(/:/g, "");

  const prevClass = `custom-swiper-prev-${instanceId}`;
  const nextClass = `custom-swiper-next-${instanceId}`;
  const paginationClass = `custom-swiper-pagination-${instanceId}`;

  if (!items?.length) return null;

  const isFlip = effect === "flip";

  return (
    <div className={`relative w-full max-w-full overflow-x-clip mx-auto py-4 ${isFlip ? "max-w-3xl" : ""} ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFlip, EffectCoverflow, EffectFade]}
        effect={effect}
        loop={loop && items.length > 1}
        grabCursor={true}
        speed={speed}
        slidesPerView={isFlip ? 1 : slidesPerView}
        spaceBetween={isFlip ? 0 : spaceBetween}
        breakpoints={isFlip ? undefined : breakpoints}
        flipEffect={{
          slideShadows: false,
          limitRotation: true,
        }}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        autoplay={
          autoplayDelay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        navigation={{
          nextEl: `.${nextClass}`,
          prevEl: `.${prevClass}`,
        }}
        pagination={{
          el: `.${paginationClass}`,
          clickable: true,
          bulletActiveClass: "!w-6 !bg-orange-500",
          bulletClass: `inline-block h-2 w-2 rounded-full transition-all cursor-pointer ${
            darkControls ? "bg-slate-300" : "bg-white/30"
          }`,
        }}
        className="w-full !py-8 overflow-y-visible overflow-x-clip"
      >
        {items.map((item, index) => {
          const rawItem = item as CarouselItem;
          const key = getItemKey ? getItemKey(item, index) : rawItem?._id || rawItem?.id || index;

          return (
            <SwiperSlide key={key} className="h-auto">
              {renderItem ? (
                renderItem(item, index)
              ) : isFlip ? (
                <div className={`relative min-h-[320px] sm:min-h-[280px] w-full max-w-full md:max-w-[60%] rounded-3xl bg-white px-3 md:px-8 pt-16 pb-8 text-center shadow-2xl flex flex-col justify-between mx-auto ${cardClassName}`}>
                  {rawItem?.image && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl z-30">
                      <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-50 flex items-center justify-center">
                        <Image src={rawItem.image} alt={rawItem.title || "Client"} width={96} height={96} className="h-14 w-14 object-contain pointer-events-none"/>
                      </div>
                    </div>
                  )}

                  <Quote className="absolute top-4 left-6 h-12 w-12 fill-orange-500 text-orange-500 rotate-180 pointer-events-none" />
                  <Quote className="absolute bottom-4 right-6 h-12 w-12 fill-orange-500 text-orange-500 pointer-events-none" />

                  <div className="relative z-10 mx-auto flex-1 flex items-center justify-center my-3">
                    <div className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed italic line-clamp-8 sm:line-clamp-5 select-none [&>p]:inline [&>p]:m-0" dangerouslySetInnerHTML={{ __html: rawItem?.description || "" }}/>
                  </div>

                  <div className="relative z-10 border-t border-slate-100 pt-4 mt-2 select-none">
                    {rawItem?.title && ( <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide truncate max-w-md mx-auto">{rawItem.title}</h3> )}
                    {rawItem?.role && ( <p className="text-xs sm:text-sm font-semibold text-orange-600 truncate max-w-md mx-auto">{rawItem.role}</p> )}
                  </div>
                </div>
              ) : (
                <div className={`h-full rounded-2xl bg-white p-6 shadow-md border border-slate-100 flex flex-col justify-between ${cardClassName}`}>
                  {rawItem?.image && (
                    <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden bg-slate-100">
                      <Image src={rawItem.image} alt={rawItem.title || ""} fill className="object-cover"/>
                    </div>
                  )}
                  <div className="space-y-2">
                    {rawItem?.title && ( <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{rawItem.title}</h3> )}
                    {rawItem?.description && ( <div className="text-sm text-slate-600 line-clamp-3 [&>p]:m-0" dangerouslySetInnerHTML={{ __html: rawItem.description }}/>)}
                  </div>
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button className={`${prevClass} flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:opacity-30 ${ darkControls ? "bg-slate-100 text-slate-800 hover:bg-orange-500 hover:text-white" : "bg-white/10 text-white border border-white/20 hover:bg-orange-500 hover:border-orange-500"}`} aria-label="Previous Slide">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className={`${paginationClass} flex items-center justify-center gap-2 !w-auto`} />

        <button className={`${nextClass} flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:opacity-30 ${ darkControls ? "bg-slate-100 text-slate-800 hover:bg-orange-500 hover:text-white" : "bg-white/10 text-white border border-white/20 hover:bg-orange-500 hover:border-orange-500"}`} aria-label="Next Slide">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}