import { Button } from '@amitkk/components/button/button';
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import { GenericBlock } from "@amitkk/basic/types/blocks";
import { GenericBlockProps } from '@amitkk/blocks/types';
import SwiperJS from "@amitkk/basic/static/Swiper";

export default function BlockOne({ data = [], module_id = "" }: GenericBlockProps) {
  if (!data || data.length === 0) return null;
  const shouldUseCarousel = data.length >= 1;

  const SlideItem = ({ item }: { item: GenericBlock }) => (
    <section className="container mx-auto py-12">
      <div className="grid grid-cols-12 gap-6 md:gap-8 items-center">
        <div className="col-span-12 md:col-span-4 lg:col-span-3 relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
          <ResponsiveImage media={item.media_id} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"/>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col items-start gap-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">{item.heading}</h2>
          {item.content && ( 
            <div className="text-white/90 text-sm md:text-base leading-relaxed [&>p]:m-0" dangerouslySetInnerHTML={{ __html: item.content }}/> 
          )}
          <Button data-modal="lead" />
        </div>
      </div>
    </section>
  );

  return (
    <div className="bg-primary overflow-hidden">
      {!shouldUseCarousel && ( <SlideItem item={data[0]}/> )}

      {shouldUseCarousel && (
        <SwiperJS<GenericBlock>
          items={data}
          getItemKey={(item) => String(item._id)}
          renderItem={(item) => <SlideItem item={item} />}
          darkControls={true}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 1 }, 1024: { slidesPerView: 1, spaceBetween: 24 } }}/>
      )}
    </div>
  );
}