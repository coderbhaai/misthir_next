import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import { SingleBlogItem } from "@amitkk/blog/static/single-blog-item";
import { Container, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';

export interface BlogFinalProps {
  blogs: BlogProps[];
}
  
export default function SuggestBlogs({ blogs = [] }: BlogFinalProps) {
  
  if (!blogs || blogs.length === 0) return null;
  
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
  
  return (
    <Grid size={12} sx={{ py: 5 }}>
      <Typography variant="h3" gutterBottom>Interesting Reads</Typography>
      {blogs?.length < 4 ? (
        <Grid container spacing={3}>
          {blogs?.map((i) => ( <SingleBlogItem key={i._id.toString()} row={i}/>))}
        </Grid>
      ) : (
        <MUICarousel settings={settings}>
          {blogs?.map((i) => ( <SingleBlogItem key={i._id.toString()} row={i}/>))}
        </MUICarousel>
      )}
    </Grid>
  );
}
