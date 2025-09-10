"use client";

import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, List, ListItem, ListItemText } from "@mui/material";
import Image from "next/image";

export default function BakeryProducts() {
  const categories = [
    "Cakes",
    "Pastries",
    "Cookies",
    "Breads",
    "Muffins",
    "Specials",
  ];

  const products = [
    {
      title: "Chocolate Cake | Buy Online",
      size: "500 gm",
      img: "/images/cake44.png",
      offer: "Order via App and get Upto 40% OFF with VIP",
      features: ["Rich Chocolate Taste", "100% Pure Ingredients", "Home Style Recipe"],
      description: "Order Chocolate Cake Online - 500g",
    },
    {
      title: "Strawberry Pastry | Fresh Bakes",
      size: "100 gm",
      img: "/images/cake44.png",
      offer: "Order via App and get Upto 40% OFF with VIP",
      features: ["Fresh Strawberries", "Soft & Creamy Texture", "No Preservatives"],
      description: "Order Fresh Strawberry Pastry Online - 100g",
    },
    {
      title: "Butter Cookies | Crunchy Delight",
      size: "250 gm",
      img: "/images/cake44.png",
      offer: "Order via App and get Upto 40% OFF with VIP",
      features: ["Crispy & Crunchy", "Made with Real Butter", "Perfect Tea-time Snack"],
      description: "Order Butter Cookies Online - 250g",
    },
    {
      title: "Garlic Bread | Freshly Baked",
      size: "200 gm",
      img: "/images/cake44.png",
      offer: "Order via App and get Upto 40% OFF with VIP",
      features: ["Made with Fresh Garlic", "Soft Inside, Crispy Outside", "Perfect with Pasta"],
      description: "Order Garlic Bread Online - 200g",
    },
  ];

  return (
    <>
    <Container sx={{ py: 6 }}>
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:2}}>
          <Box sx={{ p: 2, backgroundColor: "#f7fdf7", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Bakery Categories</Typography>
            <List>
              {categories.map((cat, i) => (
                <ListItem key={i} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e8f5e9" }, borderRadius: 1 }}>
                  <ListItemText primary={cat} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid size={{xs:12, md:10}}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>Buy Fresh Bakery Products Online</Typography>
          <Grid container spacing={2}>
            {products.map((product, i) => (
              <Grid size={{xs:12, md:5}} key={i}>
                <Card sx={{ p: 2, borderRadius: 3, border: "1px solid #e0e0e0", "&:hover": { boxShadow: 2 } }}>
                  <CardMedia sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                    <Image src={product.img} alt={product.title} width={100} height={100} />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{product.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{product.size}</Typography>
                    <Box sx={{ p: 1, backgroundColor: "#fff8e1", borderRadius: 1, fontSize: "0.9rem", mb: 2 }}>
                      {product.offer}
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      {product.features.map((feat, idx) => (
                        <Grid size={{xs:5}} key={idx}>
                          <Typography variant="body2">{feat}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>{product.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid> 
        </Grid>
      </Grid>
    </Container>
    </>

  );
}
