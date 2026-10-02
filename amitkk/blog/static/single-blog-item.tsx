import Link from "next/link";
import type { SingleBlogProps } from "@amitkk/basic/types/shared";
import type { MediaProps } from "@amitkk/basic/types/media";
import CardImage from "@amitkk/components/basic/CardImage";

export default function SingleBlogItem({row}: {row: Partial<SingleBlogProps & { media_id?: string | MediaProps }>;}) {
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-2xl mb-3 md: mb-5">
      <CardImage media={(row as any).media_id} url={row.url ?? ""} badge={row.metas?.[0]?.blogmeta_id}/>

      <div className="flex flex-col gap-2  p-2 md:p-6">
        <Link href={`/${row.url}`}>
          <h3 className="line-clamp-2">{row.name}</h3>
        </Link>
        <span className="text-xs">10 min read</span>

        <p className="line-clamp-3 text-sm">{row.excerpt}</p>
      </div>
    </article>
  );
}