"use client";

import { useState } from "react";
import type { MediaProps } from "@amitkk/basic/types/media";

interface Props {
  image: MediaProps;
  zoomScale?: number;
  onClick?: () => void;
}

export default function ProductImageZoom({image, zoomScale = 2, onClick}: Props) {
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [lens, setLens] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  const lensWidth = 220;
  const lensHeight = (lensWidth * 9) / 16;

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();

    setRect(r);
    setActive(true);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    setLens({ x, y, width: rect.width, height: rect.height, });
  };

  const handleLeave = () => { setActive(false); };

  const lensX = Math.max(
    lensWidth / 2,
    Math.min(lens.x, lens.width - lensWidth / 2)
  );

  const lensY = Math.max(
    lensHeight / 2,
    Math.min(lens.y, lens.height - lensHeight / 2)
  );

  const bgX = ((lensX - lensWidth / 2) / lens.width) * 100;
  const bgY = ((lensY - lensHeight / 2) / lens.height) * 100;

  return (
    <>
      <div 
        onMouseEnter={handleEnter} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick} className="relative aspect-square w-full overflow-hidden bg-white cursor-crosshair">
        <img src={image.path} alt={image.alt} className="h-full w-full object-cover"/>
        <div className="pointer-events-none absolute border border-black/20 bg-white/30 transition-opacity duration-200" style={{ width: lensWidth, height: lensHeight, left: lensX, top: lensY, opacity: active ? 1 : 0, transform: "translate(-50%, -50%)" }}/>
      </div>

      {rect && (
        <div className="pointer-events-none fixed z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white transition-opacity duration-200" style={{top: rect.top, left: rect.right + 20, width: `calc(100vw - ${rect.right + 40}px)`, height: rect.height, backgroundImage: `url(${image.path})`, backgroundRepeat: "no-repeat", backgroundSize: `${zoomScale * 100}%`, backgroundPosition: `${bgX}% ${bgY}%`, opacity: active ? 1 : 0, }}/>
      )}
    </>
  );
}