"use client";

import { Box, Typography, Card,Grid, CardContent, CardMedia } from "@mui/material";

const beverages = [
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
  { name: "Cappuccino", price: 5, img: "/images/cake22.png" },
];

export default function BeveragesPage() {
  return (
    <Box sx={{ p: 6 }}> 
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Beverages
      </Typography>
      <Grid container spacing={3}>
        {beverages.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.name}> 
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={item.img}
                alt={item.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {item.name}
                </Typography>
                <Typography variant="body1">${item.price}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
