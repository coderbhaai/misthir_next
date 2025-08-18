"use client";
import { Card, Box, Typography, Avatar, IconButton } from "@mui/material";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

export default function Review() {
  const products = [
    { name: "Red Velvet Cake", price: "$17.00", img: "/images/cake44.png", personName: "Alice", code: "voilet Silk" },
    { name: "Chocolate Cake", price: "$19.00", img: "/images/cake44.png", personName: "John", code: "Advanture Time" },
    { name: "Vanilla Cake", price: "$15.00", img: "/images/cake44.png", personName: "Sophia", code: "Go fishing" },
    { name: "Strawberry Cake", price: "$18.00", img: "/images/cake44.png", personName: "David", code: "cake time" },
    { name: "Blueberry Cake", price: "$20.00", img: "/images/cake44.png", personName: "Emma", code: "let's cake party" }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  let sliderRef;

  const settings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: "0px",
    focusOnSelect: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    beforeChange: (current: number, next: number) => setActiveSlide(next),
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, centerMode: true, centerPadding: "40px" } }]
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 4, color: "black" }}>Reviews</Typography>
      <Slider {...settings}>
        {products.map((p, i) => {
          const isActive = activeSlide === i;
          return (
            <div key={i}>
              <Card sx={{ position: "relative", background: "#e8f5e9", borderRadius: 3, color: "#000", padding: 2, margin: "0 10px", minHeight: 280, minWidth: 410, transform: isActive ? "scale(1.1)" : "scale(0.7)", transition: "transform 0.3s ease" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: isActive ? "flex-start" : "center" }}>
                  <Box sx={{ width: isActive ? "60%" : "90%", textAlign: "left" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar src="/images/user-img.png" alt={p.personName} sx={{ width: 40, height: 40, mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{p.personName}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>{p.code}</Typography>
                    <Typography variant="body2" sx={{ color: "black", mt: 1 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Typography>
                  </Box>
                  {isActive && <Box sx={{ width: "40%", display: "flex", justifyContent: "center", alignItems: "center" }}><Image src={p.img} alt={p.name} width={250} height={250} style={{ objectFit: "contain" }} /></Box>}
                </Box>
              </Card>
            </div>
          );
        })}
      </Slider>
    </Box>
  );
}
