import React from "react";
import { MediaProps } from "@amitkk/basic/types/page";

interface MediaImageProps {
  media?: MediaProps | null;
  className?: string;
  style?: React.CSSProperties;
}

const MediaImage: React.FC<MediaImageProps> = ({ media, className = "", style = {} }) => {
  if (!media || !media.path) return null;
  const defaultStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    objectFit: "cover" as const,
  };

  return (
    <img src={media.path} alt={media.alt || "No Image"} className={className} style={{ ...defaultStyle, ...style }}/>
  );
};

export default MediaImage;