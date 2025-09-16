// pages > index.tsx

import HomeSlider from "@amitkk/basic/components/HomeSlider";
import { Box } from "@mui/material";
import Achievement from "@amitkk/basic/components/Achievement";
import ServicesSlider from "@amitkk/basic/components/ServicesSlider";
import Portfolio from "@amitkk/basic/components/Portfolio";
import MobileSecond from "@amitkk/basic/components/MobileSecond";
import Admin from "@amitkk/basic/components/admin";
import { apiRequest } from "@amitkk/basic/utils/utils";
import FaqPanel from "@amitkk/basic/components/faq/FaqPanel";
import CommentPanel from "@amitkk/basic/components/comment/CommentPanel";
import SuggestTestimonial from "@amitkk/basic/components/testimonial/suggest-testimonial";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";

interface HomePageProps {
  page: PageProps;
  relatedContent: RelatedContent;
}

export default function HomePage({ page, relatedContent }: HomePageProps) {
  return (
    <Box>
      <HomeSlider />
      <Achievement />
      <ServicesSlider />
      <MobileSecond />
      <Portfolio />
      <Admin />
      <FaqPanel faq={relatedContent.faq} />
      <SuggestTestimonial testimonials={relatedContent.testimonials} />
      <SuggestProducts products={relatedContent.products} />
      <SuggestBlogs blogs={relatedContent.blogs}/>
      {page && ( <CommentPanel module="Page" module_id={page?._id} module_name={page?.name}/> )}
    </Box>
  );
}

export async function getServerSideProps() {
  const res = await apiRequest("get", `basic/page?function=get_page_data&url=/&module=Page`);
  const meta = res?.data?.meta_id || { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  const page = res?.data || null;
  const relatedContent = res?.relatedContent || { faq: [], testimonials: [], blogs: [], products: [] };
  return { props: { page, relatedContent } };
}