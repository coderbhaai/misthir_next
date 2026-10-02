import React from "react";
import type { MediaProps } from "@amitkk/basic/types/media";

interface MediaImageProps {
  media?: MediaProps | null;
  url?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

const MediaImage: React.FC<MediaImageProps> = ({ media, url, className = "", style = {} }) => {
  if (!media || !media.path) return null;

  const defaultStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    objectFit: "cover" as const,
  };

  const imageElement = (
    <>
      <img src={media.path} alt={media.alt} className={className} style={{ ...defaultStyle, ...style }}/>
    </>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"style={{ display: "inline-block" }}>{imageElement}</a>
    );
  }

  return imageElement;
};

export default MediaImage;