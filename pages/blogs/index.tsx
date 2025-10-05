import { apiRequest, clo } from '@amitkk/basic/utils/utils';
import { SingleBlogItem } from '@amitkk/blog/static/single-blog-item';
import { SingleBlogPageProps, SingleBlogProps } from '@amitkk/blog/types/blog';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

interface DataProps {
  blogs: SingleBlogPageProps[];
}

export default function BlogPage({ blogs }: DataProps) {
  return (
    <>
      <Box sx={{ py: 5 }}>
        <Typography variant="h1" sx={{ textAlign: "center"}}>Interesting Reads</Typography>
      </Box>

      <Container sx={{ py:5 }}>
        <Grid container spacing={3}>
          {blogs?.map?.((i) => ( <SingleBlogItem key={i._id.toString()} row={i as any} /> ))}
        </Grid>
      </Container>
    </>
  );
}

export async function getServerSideProps() {
  const res = await apiRequest("post", "blog/blogs", { function: 'get_blogs' });
  
  const meta = res?.blog?.meta_id || {
    title: process.env.NEXT_PUBLIC_DEFAULT_TITLE,
    description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION
  };
  
  const blogs = res?.data || [];

  return { props: { blogs, meta } };
}