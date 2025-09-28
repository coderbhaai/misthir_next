import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import { Container, Typography } from "@mui/material";
import { useState } from "react";
import Grid from '@mui/material/Grid';
import { SingleProductItem } from "./single-product-item";
import { ProductRawDocument } from "lib/models/types";

export interface ProductFinalProps {
  products: ProductRawDocument[];
}

export default function SuggestProducts({ products = [] }: ProductFinalProps) {
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

  if (!products || products.length === 0) return null;

  return (
    <Grid size={12} sx={{ py: 5 }}>
      <Typography variant="h3" gutterBottom>Our Products</Typography>
      {products.length < 4 ? (
        <Grid container spacing={3}>
          {products.map((i) => ( <SingleProductItem key={i._id.toString()} row={i}/>))}
        </Grid>
      ) : (
        <MUICarousel settings={settings}>
          {products.map((i) => ( <SingleProductItem key={i._id.toString()} row={i}/>))}
        </MUICarousel>
      )}
    </Grid>
  );
}