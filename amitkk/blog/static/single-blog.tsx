import ShareMe from "@amitkk/basic/static/ShareMe";
import ContentRenderer from "@amitkk/basic/static/ContentRenderer";
import AuthorCard from "@amitkk/basic/static/AuthorCard";
import CommentPanel from "@amitkk/basic/admin/comment/CommentPanel";
import { SidebarBlog } from "@amitkk/blog/static/sidebar-blog";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import Image from "next/image";
import type { RelatedContent } from "@amitkk/basic/types";
import type { BlogMetaProps, SingleBlogProps } from "@amitkk/basic/types/shared";
import DateTimeFormat from "@amitkk/components/admin/date-format";
import SuggestProducts from "@amitkk/product/static/suggest-products";

interface BlogPayloadProps extends Omit<SingleBlogProps, "metas"> {
  blogs?: SingleBlogProps[];
  relatedContent: RelatedContent;
  metas?: Array<{
    blogmeta_id?: {
      _id: string;
      name: string;
      url: string;
      type: string;
    };
  }>;
}

interface DynamicPageBlogProps {
  data?: BlogPayloadProps;
  relatedContent?: RelatedContent;
  [key: string]: any;
}

export default function SingleBlog(props: DynamicPageBlogProps) {
  const blogPayload = props?.data;
  const relatedContent = props?.relatedContent || blogPayload?.relatedContent;
  
  const blogs = blogPayload?.blogs || [];

  const categories: BlogMetaProps[] = [];
  const tags: BlogMetaProps[] = [];

  if (blogPayload?.metas && Array.isArray(blogPayload.metas)) {
    blogPayload.metas.forEach((metaItem) => {
      const blogmeta = metaItem?.blogmeta_id;
      if (!blogmeta) return;

      const metaObject: BlogMetaProps = {
        _id: Number(blogmeta._id) || (blogmeta._id as any),
        type: blogmeta.type,
        name: blogmeta.name,
        url: blogmeta.url,
      };

      if (blogmeta.type?.toLowerCase() === "category") {
        categories.push(metaObject);
      } else if (blogmeta.type?.toLowerCase() === "tag") {
        tags.push(metaObject);
      }
    });
  }

  const imagePath = (blogPayload?.media_id as any)?.path || "/images/static/default.jpg";
  const imageAlt = (blogPayload?.media_id as any)?.alt || "Inspiration Image";

  return (
    <>
      <div className="container row">
        <div className="col-span-12 md:col-span-9">
          <h1 className="heading mt-5">{blogPayload?.name}</h1>
          <div className="mt-5 fijb">
            <DateTimeFormat className="font-medium" value={blogPayload?.createdAt} />
            <ShareMe />
          </div>
          <Image src={imagePath} alt={imageAlt} width={0} height={0} sizes="100vw" style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "cover" }}/>
          <ContentRenderer content={blogPayload?.content || ""}/>

          <div className="mt-5">
            <AuthorCard row={blogPayload?.author_id} />
            <CommentPanel module="Blog" module_id={blogPayload?._id} module_name={blogPayload?.name} comments={relatedContent?.comments || []}/>
          </div>
        </div>

        <SidebarBlog blogs={blogs} categories={categories} tags={tags}/>
      </div>

      <SuggestBlogs data={relatedContent?.blogs || []} />
      <SuggestProducts data={relatedContent?.products || []}/>
    </>
  );
}