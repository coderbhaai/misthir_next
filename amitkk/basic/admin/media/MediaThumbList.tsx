import SimpleMediaThumb from "./SimpleMediaThumb";
import type { MediaProps } from "@amitkk/basic/types/media";
import SwiperJS from "@amitkk/basic/static/Swiper";

interface Props {
  images: MediaProps[];
  onClick: (index: number) => void;
  activeIndex?: number;
}

export default function MediaThumbList({ images = [], onClick, activeIndex }: Props) {
  if (!images.length) return null;

  const renderThumb = (img: MediaProps, index: number) => (
    <SimpleMediaThumb image={img} onClick={() => onClick(index)} active={index === activeIndex}/>
  );

  if (images.length <= 4) {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {images.map((img, i) => (
          <div key={img._id.toString()} className="w-[120px]">{renderThumb(img, i)}</div>
        ))}
      </div>
    );
  }

  return (
    <SwiperJS<MediaProps>
      items={images}
      getItemKey={(item) => String(item._id)}
      renderItem={(item) => {
        const index = images.findIndex((img) => img._id === item._id);
        return renderThumb(item, index);
      }}
      darkControls={true}
      slidesPerView={4}
      spaceBetween={16}
      breakpoints={{
        0: { slidesPerView: 2, spaceBetween: 8 },
        640: { slidesPerView: 3, spaceBetween: 12 },
        1024: { slidesPerView: 4, spaceBetween: 16 },
      }}
    />
  );
}