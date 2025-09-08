import { useRouter } from "next/router";
import Image from "next/image";
import { Box,Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { apiRequest, clo, updateBrowsingHistory } from "@amitkk/basic/utils/utils";
import ShareMe from "@amitkk/basic/static/ShareMe";
import CommentPanel from "@amitkk/basic/components/comment/CommentPanel";
import AuthorCard from "@amitkk/basic/static/AuthorCard";
import { SidebarBlog } from "@amitkk/blog/static/sidebar-blog";
import { SingleBlogProps } from "@amitkk/blog/types/blog";

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  const [data, setData] = useState<SingleBlogProps | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchSingleEntry = async () => {
        try {
          const res = await apiRequest("get", `blog/blogs?function=get_single_blog_by_url&slug=${slug}`);
          // if ( !res || !res.data ) { router.replace('/404'); }
          setData(res?.data);
          updateBrowsingHistory("Blog", res?.data?._id);

        } catch (error) { clo( error ); }
      }
      fetchSingleEntry();
    }
  }, [slug]);
  
  const imagePath = (data?.media_id as any)?.path || "/default.jpg";
  const imageAlt = (data?.media_id as any)?.alt || "Inspiration Image";

  return (
    <Grid container spacing={4} sx={{ px:2, py:4, width:"85vw",mx:"auto"}} gap={4} >
      <Grid size={9}>
        <Typography variant="h2" fontWeight={600}>{data?.name}</Typography>
        <Box mt={3} mb={1} display="flex" gap={4} flexWrap="wrap" alignItems="center">
          <Typography variant="body2">Author: {data?.author_id?.name}</Typography>
          <Typography variant="body2">August 5</Typography>
          <ShareMe/>          
        </Box>
        <Image src={imagePath} alt={imageAlt} width={0} height={0} sizes="100vw" style={{width: "100%", height: "auto",borderRadius: 8, objectFit: "cover" }}/>
        <Grid container spacing={4} mt={6}>
          <AuthorCard row={data?.author_id}/>
          <CommentPanel module="Blog" module_id={data?._id} module_name={data?.name}/>
        </Grid>
      </Grid>
      <SidebarBlog _id={ data?._id }/>
    </Grid>
  );
}
