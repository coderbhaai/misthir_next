"use client";

import { useEffect, useState } from "react";
import type { MediaProps } from "@amitkk/basic/types/media";

interface Props {
  open: boolean;
  images: MediaProps[];
  startIndex: number;
  onClose: () => void;
}

export default function MediaLightbox({
  open,
  images,
  startIndex,
  onClose,
}: Props) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, open]);

  if (!open || !images.length) return null;

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-action shadow-lg transition hover:scale-105">
        <img src="/images/icons/admin/close.svg" alt="Close" className="h-5 w-5" width={20} height={20} loading="lazy" />
      </button>

      <button onClick={prev} aria-label="Previous image" className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-action shadow-lg transition hover:scale-105">
        <img src="/images/icons/admin/slide-left.svg" alt="Previous" className="h-5 w-5" width={20} height={20} loading="lazy" />
      </button>

      <button onClick={next} aria-label="Next image" className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-action shadow-lg transition hover:scale-105">
        <img src="/images/icons/admin/slide-right.svg" alt="Next" className="h-5 w-5" width={20} height={20} loading="lazy" />
      </button>

      <img src={images[index].path} alt={images[index].alt || ""} className="max-h-[90vh] max-w-[90vw] object-contain select-none" draggable={false} loading="eager"/>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}