import Link from "next/link";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import { MediaProps } from "@amitkk/basic/types/media";

interface CardImageProps {
  media?: MediaProps | null;
  url: string;
  badge?: { name: string; url: string; } | null;
  aspectClassName?: string;
  className?: string;
}

export default function CardImage({media, url, badge, aspectClassName = "aspect-[16/10]", className = ""}: CardImageProps) {
  return (
    <div className={`relative ${className}`}>
      {badge && (
        <Link href={`/${badge.url}`} className="web absolute left-4 top-4 z-10 rounded-full bg-black px-4 py-2 text-xs font-medium text-white">{badge.name}</Link>
      )}

      <Link href={`/${url}`}>
        <div className={`relative overflow-hidden rounded-t-2xl shadow-lg ${aspectClassName}`}>
          <ResponsiveImage media={media} className="object-cover transition-transform duration-500 group-hover:scale-105"/>
        </div>
      </Link>
    </div>
  );
}