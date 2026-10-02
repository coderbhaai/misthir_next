import Link from "next/link";
import type { BlogMetaProps, SingleBlogProps } from "@amitkk/basic/types/shared";
import { GenericListItem } from "@amitkk/components/ui/GenericListItem";

interface SidebarApiResponse {
  blogs?: SingleBlogProps[];
  categories?: BlogMetaProps[];
  tags?: BlogMetaProps[];
}

export function SidebarBlog({ blogs, categories, tags }: SidebarApiResponse) {
  return (
    <div className="col-span-12 md:col-span-3 web">
      {blogs && blogs?.length > 0 && (
        <>
          <h2 className="mt-5 font-bold">Related Blogs</h2>
          <div className="border-b-2 mb-2"/>
          {blogs?.map((i) => ( <GenericListItem name={i.name} url={`/${i.url}`} media_id={i.media_id}/> ))}
        </>
      )}

      {categories && categories?.length > 0 && (
        <>
          <h2 className="mt-5 font-bold">Categories</h2>
          <div className="border-b-2 mb-2"/>
          {categories?.map((i) => ( <Link href={`/blogs/category/${i.url}`} passHref key={i._id} className="inline-block p-1 mr-3 mb-2 text-sm">{i.name}</Link> ))}
        </>
      )}

      {tags && tags?.length > 0 && (
        <>
          <h2 className="mt-5 font-bold">Tags</h2>
          <div className="border-b-2 mb-2"/>
          {tags?.map((j) => ( <Link href={`/blogs/tag/${j.url}`} passHref key={j._id} className="inline-block p-1 mr-3 mb-2 text-sm">{j.name}</Link> ))}
        </>
      )}
    </div>
  );
}