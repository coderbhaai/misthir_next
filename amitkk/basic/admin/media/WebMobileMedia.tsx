import React from "react";
import Image, { ImageProps } from "next/image";
import { GenericBlock } from "@amitkk/basic/types/blocks";

interface WebMobileMediaProps
  extends Omit<ImageProps, "src" | "alt"> {
  item: GenericBlock;
}

const WebMobileMedia: React.FC<WebMobileMediaProps> = ({ item, width = 400, height = 400, ...rest }) => {
  const src = item?.media_id?.path;
  const mobileSrc = item?.mobile_media_id?.path;
  const alt = item?.media_id?.alt || item?.mobile_media_id?.alt || "Image";
  if (!src) return null;

  return (
    <picture>
      {mobileSrc && ( <source media="(max-width: 768px)" srcSet={mobileSrc} /> )}
      <Image src={src} alt={alt} width={width} height={height} {...rest} unoptimized/>
    </picture>
  );
};

export default WebMobileMedia;
