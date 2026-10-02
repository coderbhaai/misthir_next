import Image from "next/image";
import Link from "next/link";
import { MediaProps } from "../types/media";
import React from "react";

export interface ImageWithFallbackProps {
  img?: string | MediaProps | null;
  width?: number | string;
  height?: number | string;
  url?: string | null;
}

export default function ImageWithFallback({ img, url, width = "100%", height = "auto" }: ImageWithFallbackProps) {
  const fallbackSrc = "/images/static/default.jpg";
  const imageSrc = (img as MediaProps)?.path ?? fallbackSrc;
  const alt = (img as MediaProps)?.alt ?? "Image";

  const Wrapper = url
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={url} className="block w-full h-full cursor-pointer">
          {children}
        </Link>
      )
    : React.Fragment;

  return (
    <div style={{ width, height }} className="relative rounded-md overflow-hidden">
      <Wrapper>
        <div className="relative w-full h-full">
          <Image src={imageSrc} alt={alt} fill style={{ objectFit: "cover", objectPosition: "center" }}/>
        </div>
      </Wrapper>
    </div>
  );
}