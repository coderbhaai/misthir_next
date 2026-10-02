import { useState, useMemo } from "react";
import MediaLightbox from "./MediaLightbox";
import MediaThumbList from "./MediaThumbList";
import ProductImageZoom from "./ProductImageZoom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProp, resolvePopulated } from "@amitkk/basic/utils/my-utils/shared-utils";
import { MediaHubProps, MediaProps } from "@amitkk/basic/types/media";

interface Props {
  images?: MediaHubProps[];
  productName: string;
}

export default function ProductImageGallery({ images = [], productName }: Props) {
  const safeImages: MediaProps[] = useMemo(() => {
    const processed = images.map((img) => resolvePopulated(img, "media_id"))
      .filter((media): media is MediaProps => !!media && !!getProp(media, "path"))
      .map((media) => ({ ...media, alt: getProp(media, "alt", productName) }));

      if (!processed.length) {
        return [{ _id: "default", path: "/images/static/default.jpg", alt: productName || "Product", } as MediaProps ];
      }
      return processed;
  }, [images, productName]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);

  return (
    <div className="relative w-full">
      <div className="relative w-full cursor-pointer" onClick={() => openLightbox(currentIndex)}>
        <ProductImageZoom image={safeImages[currentIndex]} />
      </div>

      {safeImages.length > 1 && (
        <>
          <button type="button" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all z-10" aria-label="Previous image" >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all z-10" aria-label="Next image">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <MediaThumbList images={safeImages} activeIndex={currentIndex} onClick={(i) => setCurrentIndex(i)}/>

      <MediaLightbox open={lightboxOpen} images={safeImages} startIndex={currentIndex} onClose={() => setLightboxOpen(false)}/>
    </div>
  );
}