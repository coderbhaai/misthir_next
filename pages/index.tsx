"use client";

import { Grid, Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import ImageSlider from "../amitkk/components/ImageSlider";
import PaymentHomeSection from "../amitkk/components/PaymentHomeSection";
import PromoBanner from "../amitkk/components/PromoBanner";
import Category from "../amitkk/components/Category";
import Slider from "../amitkk/components/Slider";

import Shippingpayment from "../amitkk/components/ShippingPayment";
export default function BannerSection() {
  
  return ( 
    <Box sx={{ background: "", py: 6 }}>
      <Box sx={{backgroundColor: "#3B923C",}}>
        <Box sx={{py:3}}>
          <Container className="defaultText" sx={{ p: 3, backdropFilter: "blur(10px) ", backgroundColor: "rgba(255, 255, 255, 0.1)",  borderRadius: 3, boxShadow: "0 4px 30px rgba(15, 3, 3, 0.1)",  transition: "all 0.3s ease",}}>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{}}>
              <Grid size={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>Every Bite is a Celebration. 🎂</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ py: 2, color: "#fff" }}>Exquisite Range of <br /> Confections.</Typography>
                  <Typography variant="h6" sx={{ color: "#fff" }}>Crafted Cravings, Just a Click Away.</Typography>
                  <Box sx={{ py: 3, display: "flex", gap: 2 }}>
                    <Button variant="outlined" sx={{ borderColor: "#fff", color: "#fff" }}>See Menu</Button>
                    <Button variant="outlined" sx={{ borderColor: "#fff", color: "#fff" }}>Sell Online</Button>
                  </Box>
                </Box>
              </Grid>
              <Grid size={6} sx={{ textAlign: "center" }}>
                  <Image src="/images/cake.png" alt="Chocolate Cake" width={300} height={300} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Slider />
            </Box>
          </Container>
        </Box>
      </Box>
      <Box sx={{p:8}}>
      <Category />
       <PaymentHomeSection />
      <ImageSlider />
      <PromoBanner />
      </Box>
    </Box>
  );
}