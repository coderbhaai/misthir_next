import { Box, Container, Grid, Typography, IconButton, TextField, InputAdornment } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function BakeryFooter() {
  return (
    <Box
      sx={{
        background: " #29B2C5",
        backdropFilter: "blur(10px)",
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "semibold", mb: 2 }}>
              🍰 Sweet Treats Bakery
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Bringing joy one bite at a time. Freshly baked cakes, cookies, and brownies made with love and the finest ingredients.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit">
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "semibold", mb: 2 }}>
              Quick Links
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>🎂 Cakes</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>🍪 Cookies</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>🍫 Brownies</Typography>
            <Typography variant="body2">🥧 Pies</Typography>
          </Grid>

          {/* Newsletter */}
          <Grid  xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "semibold", mb: 2 }}>
              Subscribe to Our Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Get the latest promotions and new arrivals directly to your inbox.
            </Typography>
            <TextField
              placeholder="Your Email"
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "30px",
                "& .MuiOutlinedInput-root": { borderRadius: "30px" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{
                        backgroundColor: "#ff6f91",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#ff4f75" },
                        borderRadius: "50%",
                        p: 1,
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box sx={{ mt: 4, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.3)", pt: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            © {new Date().getFullYear()} xxxxxxxxxxxxxxxxxxxx
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
