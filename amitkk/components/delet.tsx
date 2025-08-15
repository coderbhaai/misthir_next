"use client";

import { Grid, Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import Slider from "./Slider";

export default function BannerSection() {
  return ( 
    <Box sx={{ background: "white", py: 6 }}>
      <Container sx={{ background: "linear-gradient(to right, #3E7D40, #2E5D2F)", p: 3, border: 1, borderRadius: 2,}}>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid size={6}>
                <Box sx={{ color: "white" }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Every Bite is a Celebration. 🎂</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ py: 2 }}>Exquisite Range of <br /> Confections.</Typography>
                  <Typography variant="h6" sx={{ }}>Crafted Cravings, Just a Click Away.</Typography>
                  <Box sx={{py:3 , display: "flex", gap: 2 }}>
                    <Button variant="outlined" sx={{ borderColor: "#fff", color: "#fff" }}>See Menu</Button>
                    <Button variant="outlined" sx={{ borderColor: "#fff", color: "#fff" }}>Sell Online</Button>
                  </Box>
                </Box>
            </Grid>
            <Grid size={6}>
                <Grid  xs={12} md={6} sx={{ textAlign: "center" }}>
                <Image   src="/images/cake3.jpeg"   alt="Chocolate Cake"   width={300}   height={300} />
              </Grid>
            </Grid>
          </Grid>
        <Box sx={{ mt: 4 }}>
          <Slider />
        </Box>
      </Container>
       <Box sx={{ background: "linear-gradient(to right, #69beb8)", p: 3, border: 1, borderRadius: 2, p: 10 }}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={4}>
            <Box sx={{}}>
              <Typography variant="h2" fontSize={55} sx={{ py: 2 }}>Exquisite Range of  Confections.</Typography>
              <Typography variant="body1" sx={{ color: '#FFFFFF' }}> Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum, officia laboriosam .</Typography>
              <Box sx={{ py: 3, display: "flex", gap: 2 }}>
                <Button variant="outlined" sx={{ bgcolor: "#e7d0ceff", color: "#070101ff", border: "none", borderRadius: "20px", }}>See Menu</Button>
                <Button variant="outlined" sx={{ bgcolor: "#ff6f61", color: "#fff", border: "none", borderRadius: "20px", }}>See Menu</Button>
              </Box>
            </Box>
          </Grid>
          <Grid size={4}>
              <Image   src="/images/cake2.png"   alt="Chocolate Cake"   width={300}   height={300} />
          </Grid>
          <Grid size={4}>
            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
              <Typography variant="body1" sx={{ color: '#FFFFFF', py: 2 }}> Lorem orum, officia laboriosam .</Typography>
              <Typography variant="body1" sx={{ color: '#FFFFFF' }}> Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil commodi itaque distinctio facilis iste facere dolores a ratione pariatur quo!</Typography>
              <Typography variant="body1" sx={{ color: '#cfcacaff', pt: 4 }}>Cake Weight </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', }}>20 KG </Typography>
              <Typography variant="body1" sx={{ color: '#cfcacaff', pt: 4 }}>Cake Weight </Typography>
              <Typography variant="h4" sx={{ color: '	#FFFFFF', }}>70 H</Typography>
              <Typography variant="body1" sx={{ color: '#cfcacaff', pt: 4 }}>Price</Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', }}>$10500</Typography>
            </Grid>
          </Grid>
        </Grid>
       
      </Box>
    </Box>
  );
}
