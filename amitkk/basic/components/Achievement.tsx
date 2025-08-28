"use client";

import { Box, Grid, Typography } from "@mui/material";
import CountUp from "react-countup";

export default function Achievement() {
  const achievement = [
    { value: 504, plush: "+", name: "Websites" },
    { value: 50, plush: "+", name: "Apps" },
    { value: 120, plush: "+", name: "Brands served" },
    { value: 2040, plush: "+", name: "Leads Generated" },
  ];

  return (
    <Box sx={{ backgroundColor: "#0b1a3c",  color: "white", py: 5, textAlign: "center",}}>
      <Typography sx={{ mb:3}} variant="h3" fontWeight="bold"> Our Achievement</Typography>
      <Typography variant="body1" sx={{ mb: 6, opacity: 0.8 }}>Some figures we achieved
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {achievement.map((item, index) => (
          <Grid size={3} key={index}>
            <Typography variant="h3" fontWeight="bold">
              <CountUp end={item.value} duration={3} /> {item.plush}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{item.name}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
