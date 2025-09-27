import Image from "next/image";
import { Box,Typography, Grid } from "@mui/material";
import { apiRequest  } from "@amitkk/basic/utils/utils";
import ShareMe from "@amitkk/basic/static/ShareMe";
import CommentPanel from "@amitkk/basic/components/comment/CommentPanel";
import AuthorCard from "@amitkk/basic/static/AuthorCard";
import { SidebarBlog } from "@amitkk/blog/static/sidebar-blog";
import { sanitizeHtml } from "@amitkk/basic/static/Content";
import { AuthorProps, SingleBlogPageProps } from "@amitkk/blog/types/blog";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import SuggestProducts from "@amitkk/product/static/suggest-products";

interface DataProps {
  blog: SingleBlogPageProps;
  relatedContent: RelatedContent;
}

export default function SingleBlog({ blog, relatedContent }: DataProps) {
  const imagePath = (blog?.media_id as any)?.path || "/default.jpg";
  const imageAlt = (blog?.media_id as any)?.alt || "Inspiration Image";

  return (
    <Grid container spacing={4} sx={{ px:2, py:4, width:"85vw",mx:"auto"}} gap={4} >
      <Grid size={9}>
        <Typography variant="h2" fontWeight={600}>{blog?.name}</Typography>
        <Box mt={3} mb={1} display="flex" gap={4} flexWrap="wrap" alignItems="center">
          <Typography variant="body2"> Author: {typeof blog?.author_id === "object" && "name" in blog.author_id ? (blog.author_id as AuthorProps).name : ""}</Typography>
          <Typography variant="body2">August 5</Typography>
          <ShareMe/>          
        </Box>
        <Image src={imagePath} alt={imageAlt} width={0} height={0} sizes="100vw" style={{width: "100%", height: "auto",borderRadius: 8, objectFit: "cover" }}/>
        <Grid container spacing={4} mt={6}>
          <AuthorCard row={blog?.author_id}/>
          <CommentPanel module="Blog" module_id={blog?._id} module_name={blog?.name} comments={relatedContent.comments}/>
        </Grid>
      </Grid>
      <SidebarBlog _id={ blog?._id }/>

      <SuggestProducts products={relatedContent.products} />
      <SuggestBlogs blogs={relatedContent.blogs} />
    </Grid>
  );
}

export async function getServerSideProps(context: any) {
  const slug = context.params.slug;
  const res = await apiRequest("get", `blog/blogs?function=get_single_blog_by_url&slug=${slug}`);

  const meta = res?.blog?.meta_id || { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  const blog = res?.data || null;
  const relatedContent = res?.relatedContent || { faq: [], testimonials: [], comments: [], blogs: [], products: [] };

  relatedContent.testimonials = relatedContent.testimonials.map((t: any) => ({ ...t,
    content: typeof t.content === 'string' ? sanitizeHtml(t.content) : '' 
  }));
  return { props: { blog, meta, relatedContent } };
}
