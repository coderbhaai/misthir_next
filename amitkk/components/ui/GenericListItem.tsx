import Link from "next/link";
import ResponsiveImage from "./ResponsiveImage";
import { MediaProps } from "@amitkk/basic/types/media";

interface ListItemProps {
  name: string;
  url: string;
  media_id?: string | MediaProps;
}

export function GenericListItem({name, url, media_id}: ListItemProps) {
  return (
    <Link href={url} aria-label={name} className="group flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white py-2 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
      {media_id && (
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
          <ResponsiveImage media={media_id} preset="card" className="object-cover transition-transform duration-500 group-hover:scale-105"/>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-800 transition-colors duration-300 group-hover:text-primary dark:text-zinc-100">{name}</h3>
      </div>
    </Link>
  );
}