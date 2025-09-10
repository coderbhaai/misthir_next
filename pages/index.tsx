"use client";

import { Grid, Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ImageSlider from "../amitkk/components/ImageSlider";
import PaymentHomeSection from "../amitkk/components/PaymentHomeSection";
import PromoBanner from "../amitkk/components/PromoBanner";
import Category from "../amitkk/components/Category";
import Slider from "../amitkk/components/Slider";
import InterestingReads from "../amitkk/components/Interesting-Reads";

import Shippingpayment from "../amitkk/components/ShippingPayment";
import Review from "@/amitkk/components/Review";

export default function BannerSection() {
  const heroImages = ["/images/cake44.png", "/images/cake44.png", "/images/cake44.png"];

  return (
    <>
      <Box sx={{ background: "", py: 6 }}>
        <Box sx={{ backgroundColor: "#3B923C" }}>
          <Box sx={{ py: 3 }}>
            <Container className="defaultText" sx={{ p: 3, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 3, boxShadow: "0 4px 30px rgba(15, 3, 3, 0.1)", transition: "all 0.3s ease", position: "relative" }}>
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
                <Grid size={6} sx={{ textAlign: "center", background: "transparent", alignItems: "flex-start", pt: 0 }}>
                  <Swiper modules={[Autoplay]} slidesPerView={1} autoplay={{ delay: 4000 }} loop>
                    {heroImages.map((src, index) => (
                      <SwiperSlide key={index}>
                        <Box sx={{ background: "transparent", display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100%", padding: 0 }}>
                          <Image src={src} alt={`Cake ${index + 1}`} width={200} height={200} style={{ width: "100%", maxWidth: 300, height: "auto", background: "transparent", padding: 0, objectPosition: "top", objectFit: "contain" }} />
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Grid>
              </Grid>
              <Box>
                <Slider />
              </Box>
            </Container>
          </Box>
        </Box>

        <Box sx={{ p: 8 }}>
          <Category />
          <PaymentHomeSection />
          <Typography variant="h4" sx={{ textAlign: "center", color: "" }}>Cakes</Typography>
          <ImageSlider />
          <PromoBanner />
          <Review />
        </Box>

        <Box sx={{ width: "100vw", position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw" }}>
          <InterestingReads />
        </Box>
      </Box>
    </>
  );
}
