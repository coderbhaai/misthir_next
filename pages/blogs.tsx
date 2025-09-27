import { apiRequest, clo } from '@amitkk/basic/utils/utils';
import { SingleBlogItem } from '@amitkk/blog/static/single-blog-item';
import { SingleBlogProps } from '@amitkk/blog/types/blog';
import { Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from "react";

export default function BlogPage() {
  const [blogsOne, setBlogsOne] = useState<SingleBlogProps[]>([]);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {        
        const res_one = await apiRequest("post", "blog/blogs", { function : 'get_blogs', skip: 0, limit: 5 });
        setBlogsOne(res_one?.data ?? []);
      } catch (err) { clo(err); }
    };

    fetchBlogs();
  }, []); 

  return (
    <>
      <Container>
        {/* <LatestArticles /> */}
        <Grid container spacing={3}>
          {blogsOne?.map?.((i) => ( <SingleBlogItem key={i._id.toString()} row={i} /> ))}
        </Grid>
      </Container>
    </>
  );
}