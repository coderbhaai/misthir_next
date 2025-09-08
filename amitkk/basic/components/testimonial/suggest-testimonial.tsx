import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import SingleTestimonialItem from "./single-testimonial-item";
import { TestimonialProps } from "@amitkk/basic/types/page";
import { MUICarousel } from "../static/MUICarousel";

export interface TestimoniaklProps {
    testimonials: TestimonialProps[];
}

export default function SuggestTestimonial({ testimonials }: TestimoniaklProps) {
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

    if (!testimonials || testimonials.length === 0) { return null; }

    return (
        <Grid size={12} sx={{ py: 5 }}>
            <Typography variant="h3" gutterBottom>Some Testimonials</Typography>
            {testimonials?.length < 4 ? (
                <Grid container spacing={3}>
                    {testimonials?.map((i) => ( <SingleTestimonialItem key={i._id.toString()} row={i}/>))}
                </Grid>
            ) : (
                <MUICarousel settings={settings}>
                    {testimonials?.map((i) => ( <SingleTestimonialItem key={i._id.toString()} row={i}/>))}
                </MUICarousel>
            )}
        </Grid>
    )
}