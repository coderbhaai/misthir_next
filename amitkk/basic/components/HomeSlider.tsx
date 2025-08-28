"use client";

import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import Image from "next/image";

import { Grid, CardContent, Box, Typography, Button, Container } from "@mui/material";

export default function HomeSlider() {
  const products = [
     { 
    name: "Smart strategies. Real results. Digital marketing made simple.", 
    text: "We craft result-driven digital marketing strategies that help your brand stand out, connect with the right audience, and drive measurable growth for your business." 
  },
  { 
    name: "Your growth, our mission.", 
    text: "From SEO to social media, we design tailored campaigns that align with your goals and deliver consistent performance for sustainable business growth." 
  },
  { 
    name: "Creative campaigns that convert.", 
    text: "We blend creativity with data-driven insights to build campaigns that not only capture attention but also inspire action and generate real ROI." 
  },
  { 
    name: "Build connections that last.", 
    text: "Our digital marketing approach focuses on creating meaningful customer relationships, ensuring long-term brand loyalty and measurable engagement." 
  }
 
  ];
 const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
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
    <Box sx={{py:6,bgcolor: "#F4EBD0"}}>
    <Container>
      <Box>
        <MUICarousel settings={settings}>
          {products.map((p, i) => (
              <Box sx={{py:6 }}>
                <Grid container alignItems="center">
                  <Grid size={12}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center",  justifyContent: "center",  textAlign: "center",}}>
                    <Typography variant="h1" sx={{ fontSize: "50px", fontWeight: "bold", py:2 }}>{p.name} </Typography>  
                    <Typography variant="body1" sx={{mb:3}}>{p.text}</Typography>
                    <Button variant="contained">Contained</Button>
                  </CardContent>
                  </Grid>
                </Grid>
              </Box>
          ))}
        </MUICarousel>
      </Box>
      <Grid size={12} sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",     }}>
        <Image src="/images/image.webp" alt="amitkk" width={600} height={600}/>
      </Grid>
    </Container>
    </Box>
    
  );
}
