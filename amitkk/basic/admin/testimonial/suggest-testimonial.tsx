import SwiperJS from "@amitkk/basic/static/Swiper";
import type { SingleTestimonialProps, ClientProps } from "@amitkk/basic/types";
import type { PageDetailProps } from "@amitkk/basic/types/page";
import { UI_STRINGS } from "@amitkk/basic/utils/config";

interface Props {
  testimonials: SingleTestimonialProps[];
  details?: PageDetailProps;
}

export default function SuggestTestimonial({ testimonials, details }: Props) {
  if (!testimonials?.length) return null;

  const heading = details?.testimonial_title?.trim() || UI_STRINGS.testimonial_title;
  const text = details?.testimonial_text?.trim() || UI_STRINGS.testimonial_text;
  
  const formattedItems = testimonials.map((item, index) => {
    const client = typeof item?.client_id === "object" && item.client_id !== null ? (item.client_id as ClientProps) : null;
    const legacyItem = item as SingleTestimonialProps & { name?: string; role?: string; brand?: string };
    
    const imagePath =
      typeof client?.media_id === "object" && client?.media_id !== null
        ? client.media_id?.path
        : typeof item?.media_id === "object" && item?.media_id !== null
        ? item.media_id?.path
        : undefined;

    const name = client?.name || legacyItem?.name || "Valued Client";
    const role = client?.role || legacyItem?.role;
    const brand = client?.brand || legacyItem?.brand;
    const subtitle = role ? `${role}${brand ? ` • ${brand}` : ""}` : brand || "";

    return {
      id: item?._id || index,
      title: `${name}${subtitle ? ` (${subtitle})` : ""}`,
      image: imagePath || undefined,
      description: item?.content,
    };
  });

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 my-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-10 text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest">{heading}</span>
          <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{text}</h2>
        </div>

        <SwiperJS items={formattedItems} effect="flip" speed={500}/>
      </div>
    </section>
  );
}