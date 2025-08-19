"use client";
import { Grid, Card, CardContent,Box, CardMedia, Typography } from "@mui/material";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ProductSlider() {
 const products = [
  { name: "Red Velvet Cake", price: "$17.00", img: "/images/choco-cake.png" },
  { name: "Red Velvet Cake", price: "$17.00", img: "/images/choco-cake.png"  },
  {name: "Red Velvet Cake", price: "$17.00", img: "/images/choco-cake.png"  },
  { name: "Red Velvet Cake", price: "$17.00", img: "/images/choco-cake.png" },
  { name: "Red Velvet Cake", price: "$17.00", img: "/images/choco-cake.png" },
];


  const inspirationSettings = {
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

      {breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: "60px", },},
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1, },},
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, },},
    ],
  };

  return (
    <Box sx={{ }}>

    <Slider {...inspirationSettings} >
      {products.map((p, i) => (
        <div key={i}>
          <Card sx={{  background: "rgba(255,255,255,0.15)", borderRadius: 2, color: "#fff", padding: 2, margin: "0 10px", }}>
            <Grid container rowSpacing={0} columnSpacing={{ md:8 }} sx={{overflow: "visible"}} alignItems="center">
              <Grid size={6}  >
                <CardContent>
                  <Typography variant="subtitle1">{p.name}</Typography>
                  <Typography variant="body2">{p.price}</Typography>
                </CardContent>
              </Grid>
              <Grid size={6} sx={{  }}>
                   <Box sx={{ mt: -6, display: "flex", justifyContent: "center", }}>
                      <Image src={p.img} alt={p.name} width={200} height={200} style={{ objectFit: "contain", }}
                      />
                  </Box>
              </Grid>
            </Grid>
          </Card>
        </div>
      ))}
    </Slider>
    </Box>
  );
}





