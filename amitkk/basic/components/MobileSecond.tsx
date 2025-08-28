"use client";

import Image from "next/image";
import { Grid, Box, Typography, Button, Container } from "@mui/material";

export default function MobileSecond() {
 



  return (
      <Box sx={{py:6,bgcolor: "#"}}>
        <Box sx={{px:8}}>
          <Box sx={{ textAlign: "center" }}>
              <Typography  variant="h5"  sx={{  borderBottom: "2px solid",  borderColor: "primary.main",  display: "inline-block",  pb: 1,  fontWeight: "semibold",  mb: 2,}}>Why Work With Us</Typography>
              <Typography variant="body1" sx={{mx: "auto", mb:4,}}>We at AmitKK believe that success in digital marketing goes beyond mere strategies and tactics. Whether you are a startup looking to build an online presence or an established brand aiming to expand your reach, we are here to provide the expertise, tools, and personalized attention you need to thrive in today's competitive market.</Typography>
              <Button variant="contained">Learn More</Button>
          </Box>
          <Grid container spacing={2} sx={{py:6}}>
            <Grid size={4}>
              <Box sx={{ mb:8}}>
                <Typography  variant="h6"  sx={{  fontWeight: "semibold"}}>1. Experience</Typography>
                <Typography  variant="body1"sx={{py:2}}>Our digital marketing process gives a a beautiful experience in all together right from UI design to development to getting it ranked on keywords.</Typography>
              </Box>
              <Box sx={{ mb:8}}>
                <Typography  variant="h6"  sx={{  fontWeight: "semibold"}}>2. Result Oriented</Typography>
                <Typography  variant="body1"sx={{py:2}}>All our works are aligned towards one goal, delivering results for clients. We understand what it is to run a business and the importance of achieving the results for its sustenance.</Typography>
              </Box>
            </Grid>
            <Grid size={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",     }}>
                <Image src="/images/image.png" alt="Description of image" width={300} height={300}/>
              </Grid>
            <Grid size={4}>
              <Box sx={{pt:8 }}>
                <Typography  variant="h6"  sx={{  fontWeight: "semibold"}}>5 .Commitment</Typography>
                <Typography  variant="body1"sx={{py:2}}>A good agencies commitment towards is clients is what says about its characters and work culture. We stand with our clients strongly and ensure that they make the most out of this relationship.</Typography>
              </Box>
              <Box sx={{ pt:8}}>
                <Typography  variant="h6"  sx={{  fontWeight: "semibold"}}>4. Creativity</Typography>
                <Typography  variant="body1"sx={{py:2}}>Creativity is always the core essence of any work especially when it comes to social media marketing and branding. Our expert team goes all out in bringing the creative works for you.</Typography>
              </Box>
            </Grid>
            <Grid size={12}>
                <Box sx={{ maxWidth: 800,   mx: "auto",      textAlign: "center",}}>
                  <Typography variant="h6" sx={{ fontWeight: "semibold", }}>3. Technical Strength
                  </Typography>
                  <Typography variant="body1" sx={{ py: 2 }}>In digital scope, a strong technological understanding is a must as this is what powers everything else. From a good website or mobile app to its digital marketing, deep knowledge of technology is required for steady results.</Typography>
                </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
  );
}
