import Image from "next/image";
import { IMAGE_PRESETS } from "@amitkk/basic/utils/config";
import type { MediaProps } from "@amitkk/basic/types/media";
import React from "react";

type PresetKey = keyof typeof IMAGE_PRESETS;

type Props = {
  media?: MediaProps | string | null;
  path?: string;
  alt?: string;
  preset?: PresetKey;
  className?: string;
  priority?: boolean;
  maxWidth?: string | number;
  maxHeight?: string | number;
};

export default function ResponsiveImage({ 
  media, 
  path, 
  alt, 
  preset, 
  className = "", 
  priority = false, 
  maxWidth, 
  maxHeight 
}: Props) {
  const resolvedMedia = typeof media === "object" ? media : null;
  const imagePath = resolvedMedia?.path || path || (typeof media === "string" ? media : undefined);
  const imageAlt = alt ?? resolvedMedia?.alt ?? "";

  if (!imagePath) return null;

  const config = preset ? (IMAGE_PRESETS[preset] as any) : undefined;

  const resolvedMaxWidth = config?.maxWidth ?? maxWidth;
  const resolvedMaxHeight = config?.maxHeight ?? maxHeight;

  const style: React.CSSProperties = {
    width: "auto",
    height: "auto",
    maxWidth: resolvedMaxWidth || undefined,
    maxHeight: resolvedMaxHeight || undefined,
  };

  return (
    <Image
      src={imagePath.startsWith("http") || imagePath.startsWith("/") ? imagePath : `/${imagePath}`}
      alt={imageAlt}
      width={500}
      height={500}
      sizes={config?.sizes}
      priority={priority}
      quality={config?.quality}
      className={className}
      style={style}
    />
  );
}