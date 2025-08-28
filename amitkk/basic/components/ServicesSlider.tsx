"use client";

import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import Image from "next/image";

import { Grid, Card, CardContent, Box, Typography, Button, Container } from "@mui/material";

export default function ServicesSlider() {
 
const products = [
  { 
    img: "/images/logo.svg", 
    alt: "Digital Marketing", 
    name: "Digital Marketing", 
    text: "We craft smart, data-driven strategies designed to connect your brand with the right audience at the right time. From social media to paid campaigns, our digital marketing ensures measurable growth and real business impact." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Creative Campaigns", 
    name: "Creative Campaigns", 
    text: "Our creative campaigns are designed to spark curiosity, build trust, and inspire action. With a perfect blend of design, content, and storytelling, we make sure your brand not only gets noticed but remembered." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Brand Building", 
    name: "Brand Building", 
    text: "We help you create a strong, memorable brand identity that resonates with your audience. Through consistent messaging, impactful visuals, and engaging experiences, we turn businesses into brands people love." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "Growth Marketing", 
    name: "Growth Marketing", 
    text: "Our growth marketing approach focuses on scalable strategies, performance-driven campaigns, and continuous optimization. We don’t just drive traffic, we ensure sustainable conversions and long-term growth." 
  },
  { 
    img: "/images/logo.svg", 
    alt: "SEO & Content", 
    name: "SEO & Content", 
    text: "We combine technical SEO with high-quality, engaging content to ensure your brand ranks higher, reaches the right audience, and builds authority. Our strategies bring both visibility and trust to your digital presence." 
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
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: '60px', } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, } }, 
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, } },
    ]
  };

  return (
    <Box sx={{py:6}}>
      <Box sx={{py:6,bgcolor: "#F4EBD0"}}>
        <Box sx={{px:8}}>
          <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ borderBottom: "2px solid", borderColor: "primary.main", display: "inline-block", pb: 1, fontWeight: "semibold", mb: 2,}}>Services We Provide</Typography>
              <Typography variant="body1" sx={{mx: "auto", mb:4}}> At Amitkk.ae, we offer a full spectrum of digital marketing and development services designed to elevate your business. Our expertise spans across SEO, social media marketing, content creation, and paid advertising to drive traffic and increase brand visibility. We also provide web and app development, e-commerce solutions, and CRM integration to optimize your digital presence. With a commitment to delivering tailored solutions, we ensure that every service aligns with your business goals, fostering growth and maximizing ROI.</Typography>
              <Button variant="contained">View More</Button>
            </Box>
            <MUICarousel settings={settings}>
              {products.map((p, i) => (
                  <Box sx={{py:6 }}>
                      <Grid size={4} sx={{p:4, bgcolor: "#ffff", borderRadius: 3,boxShadow: 3,}}>
                      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",}}>
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
    </Box>
    
  );
}
