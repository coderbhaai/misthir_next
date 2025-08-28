"use client";

import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import Image from "next/image";
import { Grid, CardContent, Box, Typography, Button, Container } from "@mui/material";

export default function Portfolio() {
 
const projects = [
  { 
    img: "/images/logo.svg", 
    alt: "E-commerce Website", 
    name: "E-commerce Website", 
    text: "Designed and developed a full-featured e-commerce platform with secure payment gateway, product catalog, and personalized shopping experience for a retail client." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Brand Identity Design", 
    name: "Brand Identity Design", 
    text: "Created a complete branding package including logo, color palette, typography, and marketing collaterals to establish a strong visual identity for a startup." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Digital Marketing Campaign", 
    name: "Digital Marketing Campaign", 
    text: "Executed a multi-channel campaign across Google Ads and social media, resulting in a 250% increase in traffic and 3x higher conversions for the client." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "SEO Optimization", 
    name: "SEO Optimization", 
    text: "Improved website rankings from page 4 to page 1 on Google for competitive keywords, boosting organic traffic and lead generation significantly." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Mobile App Development", 
    name: "Mobile App Development", 
    text: "Built a scalable and user-friendly mobile app with real-time features, intuitive UI, and API integrations tailored to client business goals." 
  },
];

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
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: '60px' } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } }, 
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } },
    ]
  };

  return (
      <Box sx={{py:6,bgcolor: "#F4EBD0"}}>
        <Box sx={{px:8}}>
          <Box sx={{ textAlign: "center" }}>
              <Typography  variant="h4"  sx={{  borderBottom: "2px solid",  borderColor: "primary.main",  display: "inline-block",  pb: 1,  fontWeight: "semibold",  mb: 2,}}>Portfolio</Typography>
              <Typography variant="body1" sx={{mx: "auto", mb:4,}}>At Amitkk.ae, we bring ideas to life through creative design, marketing excellence, and cutting-edge development. Explore some of our proudest work across industries.</Typography>
              <Button variant="contained">View More</Button>
          </Box>
            <MUICarousel settings={settings}>
              {projects.map((p, i) => (
                  <Box key={i} sx={{py:6 }}>
                      <Grid size={4} sx={{p:4, bgcolor: "#fff", borderRadius: 3,boxShadow: 3}}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                          <Image src={p.img} alt={p.alt} width={150} height={150} style={{ objectFit: "contain" }}/>
                          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>{p.name}</Typography>
                          <Typography variant="body1" sx={{ mt: 1 }}>{p.text}</Typography>
                        </CardContent>
                      </Grid>
                  </Box>
              ))}
            </MUICarousel>
        </Box>
      </Box>
  );
}
