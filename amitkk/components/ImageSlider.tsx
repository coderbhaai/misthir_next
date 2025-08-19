"use client";

import { Card, CardMedia, IconButton, Box, Typography,  } from "@mui/material";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function ImageSlider() {
  const products = [
    { img: "/images/cake3.jpeg" },
    { img: "/images/cake3.jpeg" },
    { img: "/images/cake3.jpeg" },
    { img: "/images/cake3.jpeg" },
    { img: "/images/cake3.jpeg" },
    { img: "/images/cake3.jpeg"},
    { img: "/images/cake3.jpeg"},
    { img: "/images/cake3.jpeg"},
  ];

  return (
    <Box sx={{ position: "relative" ,mb:6 }}>
      {/* <Typography variant="h4" sx={{textAlign :"center",  color: "" }}>Cakes</Typography> */}
      <IconButton className="custom-prev"sx={{ position: "absolute", top: "50%", left: 0, zIndex: 10, backgroundColor: "white", "&:hover": { backgroundColor: "grey.200" },}}>
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton className="custom-next"sx={{ position: "absolute", top: "50%", right: 0, zIndex: 10, backgroundColor: "white", "&:hover": { backgroundColor: "grey.200" },}}>
        <ArrowForwardIosIcon />
      </IconButton>

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={6}
        spaceBetween={10}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        navigation={{
        prevEl: ".custom-prev",
        nextEl: ".custom-next",
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {products.map((p, i) => (
          <SwiperSlide key={i}>
            <Card sx={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 2 }}>
              <CardMedia sx={{position: "relative", width: "100%", height: 430 }}>
                <Image src={p.img} alt={`Product ${i + 1}`} fill style={{ objectFit: "cover" }}/>
              </CardMedia>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
