import { Box, Typography, Button } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useState } from "react";

const images = [
  "/images/mishtir-cake-img.jpg",
  "/images/mishtir-cake-img-2.jpg",
  "/images/mishtir-cake-img-3.jpg",
  "/images/mishtir-cake-img-4.jpg",
];

const slides = [
  {
    title: "Delicious Cakes",
    text: "Only the best quality used. Freshly baked every day. Crafted with passion. A treat you’ll always remember."
  },
  {
    title: "Premium Ingredients",
    text: "Only the best quality used. Imported flavors with care. Blended to perfection. Natural taste in every bite."
  },
  {
    title: "Made With Love",
    text: "Only the best quality used. From our kitchen to yours. Every slice tells a story. Happiness baked in layers."
  },
  {
    title: "Customer Favorite",
    text: "Only the best quality used. Trusted by thousands daily. Bringing smiles for decades. A cake for every occasion."
  },
];

export default function InterestingReads() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSection, setHoveredSection] = useState<number | null>(null); // NEW

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      style={{ width: "100%" }}
    >
      {slides.map((slide, index) => {
        const sectionOverride =
          hoveredIndex === index && hoveredSection !== null
            ? images[(index + hoveredSection + 1) % images.length]
            : null;

        const displayImage =
          sectionOverride ??
          (hoveredIndex === index
            ? images[(index + 1) % images.length]
            : images[index]);

        return (
          <SwiperSlide key={index}>
            <Box
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => { setHoveredIndex(null); setHoveredSection(null); }}
              sx={{ height: "70vh", width: "100vw", backgroundImage: `url(${displayImage})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", justifyContent: "center", alignItems: "center", transition: "background-image 0.5s ease-in-out", position: "relative", color: "#fff", textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}
            >
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))" }} />

              <Typography variant="h6" sx={{ position: "absolute", top: "35px", left: "50%", transform: "translateX(-50%)", fontWeight: "semi-bold", zIndex: 3, textAlign: "center" }}>
                Interesting Reads
              </Typography>

              <Typography variant="body1" sx={{ position: "absolute", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 3, textAlign: "center", fontWeight: 100 }}>
                Beautiful craft blogs and articles
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", width: "100%", height: "100%", zIndex: 2 }}>
                {slides.map((s, i) => (
                  <Box
                    key={i}
                    onMouseEnter={() => setHoveredSection(i)}   
                    onMouseLeave={() => setHoveredSection(null)}
                    sx={{ position: "relative", overflow: "hidden", borderRight: i < 3 ? "2px solid rgba(255,255,255,0.5)" : "none", px: 3, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", pb: 3, cursor: "pointer", "&:hover .title": { transform: "translateY(-10px)" }, "&:hover .extraContent": { maxHeight: 400, transform: "translateY(0)", opacity: 1 } }}
                  >
                    <Typography className="title" variant="h6" gutterBottom sx={{ fontWeight: "bold", zIndex: 3, transition: "transform 300ms ease", transform: "translateY(0)" }}>
                      {s.title}
                    </Typography>
                    <Box className="extraContent" sx={{ transition: "transform 300ms ease, opacity 300ms ease, max-height 300ms ease", transform: "translateY(24px)", opacity: 0, maxHeight: 0, overflow: "hidden" }}>
                      <Typography variant="body1" sx={{ maxWidth: "28ch", lineHeight: 1.6, mb: 2 }}>
                        {s.text}
                      </Typography>
                      <Button sx={{ color: "white", mt: 2 }}>Discover more</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
