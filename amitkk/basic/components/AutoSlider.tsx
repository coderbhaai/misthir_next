"use client";

import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import Image from "next/image";

import { Grid, Card, CardContent, Box, Typography, Button, Container } from "@mui/material";

export default function AutoSlider() {
 
 const products = [
     { img: "/images/js.png", alt: "logo" },
    { img: "/images/wordpress.png", alt: "logo" },
    { img: "/images/andriod.png", alt: "logo" },
    { img: "/images/wordpress.png", alt: "logo" },
    { img: "/images/andriod.png", alt: "logo" },
  ];
 
 const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
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
      <Box sx={{py:4 , px:12}}>
      <Box sx={{  textAlign: "center", maxWidth: 800,  mx: "auto", }}>
          <Typography variant="h4" sx={{ borderBottom: "2px solid", borderColor: "primary.main", display: "inline-block", pb: 1, fontWeight: "semibold", mb: 2,}}>Our Favourite Tech Stack</Typography>
          <Typography variant="body1" sx={{mx: "auto",}}> Below are some of the languages and frameworks we love and use extensively.  The choice of technology for a project depends on its scale and scope.  Based on an extensive discussion and understanding of your requirement,  we choose the tech stack that best suits you.</Typography>
        </Box>

        <MUICarousel settings={settings}>
          {products.map((p, i) => (
            <div key={i}>
              <Box sx={{py:6 }}>
                <Grid container alignItems="center">
                  <Grid size={3}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center",  justifyContent: "center",  textAlign: "center",}}>
                    <Image src={p.img} alt={p.alt} width={350} height={350} />                 
                  </CardContent>
                  </Grid>
                </Grid>
              </Box>
            </div>
          ))}
        </MUICarousel>
      </Box>
   
    
  );
}
