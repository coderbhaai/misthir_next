import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { SingleBlogItem } from "@amitkk/blog/static/single-blog-item";
import { SingleBlogProps } from "@amitkk/blog/types/blog";
import { Container, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';

export default function SuggestBlogs() {
  const [blogs, setBlogs] = useState<SingleBlogProps[]>([]);
    
  useEffect(() => {
    const fetchBlogs = async () => {
      try {        
        const res_one = await apiRequest("post", "blog/blogs", { function : 'get_blogs', skip: 0, limit: 5 });
        setBlogs(res_one?.data ?? []);
      } catch (err) { clo(err); }
    };

    fetchBlogs();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: '60px', } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, } }, 
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, } },
    ]
  };

  if (!blogs || blogs.length === 0) return null;

  return (
    <Container>
      <Typography variant="h3" gutterBottom>Interesting Reads</Typography>
      {blogs.length < 4 ? (
        <Grid container spacing={3}>
          {blogs.map((i) => ( <SingleBlogItem key={i._id.toString()} row={i}/>))}
        </Grid>
      ) : (
        <MUICarousel settings={settings}>
          {blogs.map((i) => ( <SingleBlogItem key={i._id.toString()} row={i}/>))}
        </MUICarousel>
      )}
    </Container>
  );
}
