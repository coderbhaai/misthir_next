// pages > index.tsx

import FaqPanel from "@amitkk/basic/admin/faq/FaqPanel";
import SuggestTestimonial from "@amitkk/basic/admin/testimonial/suggest-testimonial";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import { SinglePageProps } from "@amitkk/basic/types/page";
import { RelatedContent } from "@amitkk/basic/types";
import Achievement from "@amitkk/basic/achievement";
import CommentPanel from "@amitkk/basic/admin/comment/CommentPanel";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { GetServerSideProps } from "next";
import { groupBlockContent, serverApiRequest } from "@amitkk/basic/utils/my-utils/client-utils";

interface HomePageProps {
  page: SinglePageProps;
  relatedContent: RelatedContent;
}

export default function HomePage({ page, relatedContent }: HomePageProps) {
  return (
    <div>
      {/* <HomeSlider /> */}
      {/* <Achievement /> */}
      {/* <MobileSecond /> */}
      {/* <Admin /> */}
      <FaqPanel faq={relatedContent.faq} />
      <SuggestTestimonial testimonials={relatedContent.testimonials} />
      <SuggestProducts data={relatedContent.products}/>
      <SuggestBlogs data={relatedContent.blogs}/>
      {/* {page && ( <CommentPanel module="Page" module_id={page?._id} module_name={page?.name}/> )} */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const apiRes = await serverApiRequest(req, "GET", `basic/page?function=get_page_by_url&url=/&module=Page`);
    if (!apiRes?.data) { return { notFound: true }; }
    
    const meta = {
      ...(apiRes?.seo || {}),
      schema: apiRes?.schema || null,
      path: "/"
    };

    const data = apiRes?.data || null;
    const relatedContent = apiRes?.relatedContent || { faq: [], testimonials: [], blogs: [] };
    const { groupedBlocks, groupedDetails } = await groupBlockContent(apiRes?.blockContent ?? null);

    return { props: { data, meta, relatedContent, groupedBlocks, groupedDetails } };
  } catch (error) {
    console.error("❌ Home page error:", error);
    return { notFound: true };
  }
};