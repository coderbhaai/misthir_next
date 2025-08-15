"use client";

import { Box, Typography, Button, Paper } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff8f0", p: 3,}}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, textAlign: "center", borderRadius: 4, maxWidth: 500, backgroundColor: "#ffffff",}}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#5a3825", mb: 1 }}>
          Thank You for Your Order!
        </Typography>
        <Typography variant="body1" sx={{ color: "#7b5a44", mb: 4 }}>
          Your delicious treats are being prepared and will be delivered to you soon.
        </Typography>
        <Box sx={{  display: "flex",  justifyContent: "space-between",  gap: 2}}>
            <Link href="/" passHref>
                <Button  variant="contained"  sx={{  backgroundColor: "#d2691e",  "&:hover": { backgroundColor: "#b25418" },  borderRadius: 10,  px: 4,  py: 1.5  }}>
                Back to Home
                </Button>
            </Link>
            <Link href="/" passHref>
                <Button  variant="contained"  sx={{  backgroundColor: "#1b5c1fff",  "&:hover": { backgroundColor: "#122b02ad" },  borderRadius: 10,  px: 4,  py: 1.5 }}>
                Go tothe order list
                </Button>
            </Link>
        </Box>

      </Paper>
    </Box>
  );
}
