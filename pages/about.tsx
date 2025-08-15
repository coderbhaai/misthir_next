"use client";

import { Box, Typography, Container, Grid, Button, Card, CardContent } from "@mui/material";
import Image from "next/image";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function AboutPage() {
  return (
    <Box sx={{ backgroundColor: "#fff8f0" }}>
      {/* Hero About Section */}
      <Box sx={{ py: 10 }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            {/* Image */}
            <Grid size={6}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 6px 30px rgba(0,0,0,0.1)",
                }}
              >
                <Image
                  src="/images/cake3.jpeg"
                  alt="SweetBite Bakery"
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "auto" }}
                />
              </Box>
            </Grid>

            {/* Text */}
            <Grid size={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Pacifico', cursive",
                  color: "#d2691e",
                  mb: 2,
                }}
              >
                Our Story
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#5a3825",
                  lineHeight: 1.8,
                  mb: 3,
                  fontSize: "1.1rem",
                }}
              >
                Welcome to <strong>SweetBite</strong>, where passion for baking
                meets the art of happiness. Founded in 2010, we started as a
                small neighborhood bakery and have grown into a community
                favorite for all things sweet and fresh. Our bakers rise before
                the sun, crafting pastries, cakes, and bread with love and care
                that you can taste in every bite.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#5a3825",
                  lineHeight: 1.8,
                  mb: 3,
                  fontSize: "1.1rem",
                }}
              >
                We believe in quality, sustainability, and the magic of
                gathering around good food. Whether you’re here for your daily
                coffee, a special celebration cake, or just a little treat —
                you’re part of our SweetBite family.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#d2691e",
                  "&:hover": { backgroundColor: "#b25418" },
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                }}
              >
                Explore Our Menu
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Values Section */}
      <Box sx={{ backgroundColor: "#fff1e6", py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              fontFamily: "'Pacifico', cursive",
              color: "#d2691e",
              mb: 6,
            }}
          >
            Why Choose SweetBite?
          </Typography>

          {/* <Grid container spacing={4}>
            {[
              {
                icon: <BakeryDiningIcon sx={{ fontSize: 50, color: "#d2691e" }} />,
                title: "Freshly Baked Everyday",
                desc: "From croissants to cookies, everything is baked fresh daily using only the best ingredients.",
              },
              {
                icon: <LocalDiningIcon sx={{ fontSize: 50, color: "#d2691e" }} />,
                title: "Premium Ingredients",
                desc: "We source high-quality, sustainable ingredients to make our treats extra special.",
              },
              {
                icon: <FavoriteIcon sx={{ fontSize: 50, color: "#d2691e" }} />,
                title: "Made with Love",
                desc: "Every recipe is crafted with care, bringing joy and comfort to every customer.",
              },
            ].map((item, index) => (
              <Grid size  ={4} key={index}>
                <Card
                  sx={{
                    textAlign: "center",
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    p: 3,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    {item.icon}
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#5a3825", mt: 1, lineHeight: 1.6 }}
                    >
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid> */}
        </Container>
      </Box>
    </Box>
  );
}
