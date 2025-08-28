"use client";

import Image from "next/image";
import { Grid, Box, Typography, Button, Container, Card } from "@mui/material";

export default function Admin() {

  return (
      <Box sx={{py:6,bgcolor: "#"}}>
        <Box sx={{px:8}}>
          <Grid container spacing={2} sx={{py:6}}>
            <Grid size={5} sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",     }}>
                <Image src="/images/admin/amit.png" alt="amitkk" width={300} height={300}/>
              </Grid>
            <Grid size={7}>
              <Card sx={{width:"fit"}}>
                <Typography  variant="h4"  sx={{textAlign:"center",  fontWeight: "semibold"}}>AMIT KUMAR KHARE</Typography>
              </Card>
              <Box>
                <Typography  variant="body1"sx={{py:2 , textAlign:"center"}}>Amit Kumar Khare, the visionary founder of AmitKK, brings a wealth of experience and a unique perspective to the digital marketing industry. His professional journey has traversed diverse sectors and accumulated a rich blend of skills along the way. Amit’s career began with an 8-year stint in the Indian Air Force, where he developed discipline, resilience, and a strategic mindset. He then transitioned to the corporate world, working for 3 years with Thomas Cook India Ltd., where he honed his expertise in customer service and operations.</Typography>
                <Typography  variant="body1"sx={{py:2, textAlign:"center"}}>Driven by his entrepreneurial spirit, Amit co-founded a digital marketing agency, YoCreativ, and even started his own TV channel. These ventures allowed him to cultivate a deep understanding of the digital landscape, from coding and graphic design to marketing strategies. Today, at AmitKK, he leverages his extensive knowledge and passion for technology to personally oversee the web design and development services, ensuring that each project meets the highest standards of quality and innovation.</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
  );
}
