"use client";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function PromoBanner() {
  return (
    <Box sx={{ py: 8, textAlign: "center", background: "#3B923C", overflow: "hidden",}}>
      <Box sx={{ mx: "auto" }}>
        <Typography variant="h4" sx={{letterSpacing: 2, color: "#ffff", py: 2,}}>DO NOT MISS</Typography>
        <Typography variant="h3"sx={{ fontWeight: "bold",color: "#ffff"}}>OUR  <span style={{ color: "black" }}>SIGNATURE </span></Typography>
        <Typography variant="h3"sx={{ fontWeight: "bold", mb: 3,}}>NOVELTIES & PROMOTIONS</Typography>

        <TextField
          placeholder="Enter your email"
          variant="outlined"
          sx={{
            py:2,
            width: "100%",
            maxWidth: 360,
            borderRadius: "50px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
              backgroundColor: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.85)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            },
            "& input": {
              fontSize: "1rem",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  sx={{
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #ff512f, #dd2476)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #dd2476, #ff512f)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
