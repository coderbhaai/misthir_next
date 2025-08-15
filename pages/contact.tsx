"use client";

import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

export default function ContactUs() {
  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          color: "#d2691e",
          mb: { xs: 3, md: 4 },
          fontFamily: "'Pacifico', cursive",
          fontSize: { xs: "2rem", md: "3rem" },
        }}
      >
        Contact Us
      </Typography>

      {/* Info Cards */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ mb: { xs: 4, md: 6 } }}
      >
        <Grid xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#fff8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <LocationOnIcon sx={{ fontSize: 40, color: "#d2691e", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Our Location
            </Typography>
            <Typography color="text.secondary">
              123 Gurgaon, Haryana
            </Typography>
          </Paper>
        </Grid>

        <Grid  xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#fff8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <PhoneIcon sx={{ fontSize: 40, color: "#d2691e", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Call Us
            </Typography>
            <Typography color="text.secondary">+91 00000000</Typography>
          </Paper>
        </Grid>

        <Grid  xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#fff8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <EmailIcon sx={{ fontSize: 40, color: "#d2691e", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Email Us
            </Typography>
            <Typography color="text.secondary">
              support@sweetbite.com
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Form */}
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          backgroundColor: "#fff8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#5a3825",
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          Send us a Message
        </Typography>

        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField label="Email" variant="outlined" fullWidth sx={{ mb: 3 }} />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Your Message"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#d2691e",
              "&:hover": { backgroundColor: "#b25418" },
              borderRadius: 3,
              py: 1.5,
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            Send Message
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
