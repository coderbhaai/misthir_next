"use client";

import { Box, Grid, Typography, Divider, Paper } from "@mui/material";
import Image from "next/image";
import ImageSlider from "@/amitkk/components/ImageSlider";      
export default function OrderConfirmation() {
  return (
    <Grid container spacing={4} sx={{ px: 4, py: 6 }} justifyContent="center" alignItems="center" textAlign="center">
      <Grid size={12} sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold">
          Thank you for placing your order
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          You will receive an email confirmation with your order details shortly.
        </Typography>
      </Grid>

      <Grid size={12} display="flex" justifyContent="center">
        <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, width: "90%", justifyContent: "center" }}>
          <Grid size={4} display="flex" justifyContent="center" alignItems="center">
            <Box sx={{ flexShrink: 0 }}>
              <Image src="/images/cake-img.jpg" alt="Product" width={100} height={120} style={{ borderRadius: 8 }} />
            </Box>
          </Grid>

          <Grid size={4} display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="body2">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</Typography>
            <Typography variant="body2"><strong>AMITKK</strong> :Digital Solutions</Typography>
          </Grid>

          <Grid size={4} display="flex" justifyContent="center" alignItems="center">
            <Typography variant="body2" fontWeight="bold">3 @ ₹599 = ₹1797</Typography>
          </Grid>
        </Paper>
      </Grid>

      <Divider sx={{ borderStyle: "dashed", width: "90%" }} />

      <Grid size={12} container spacing={2} justifyContent="center" textAlign="center">
        <Grid size={4}><Typography><strong>Status</strong> Ordered</Typography></Grid>
        <Grid size={4}><Typography><strong>Paymode</strong> Online</Typography></Grid>
        <Grid size={4}><Typography><strong>Total</strong> ₹1797</Typography></Grid>
      </Grid>

      <Divider sx={{ borderStyle: "dashed", width: "90%" }} />

      <Grid size={12} container spacing={2} justifyContent="center" textAlign="center">
        <Grid size={11}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">
              <strong>Billing Address</strong> – Amit Khare, amit@amitkk.com, Phone - 8424003840,
              1172, Sector45, GF, Haryana, India, PIN - 122002
            </Typography>
          </Paper>
        </Grid>
        <Grid size={11}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">
              <strong>Shipping Address</strong> – Amit Khare, amit@amitkk.com, Phone - 8424003840,
              1172, Sector45, GF, Haryana, India, PIN - 122002
            </Typography>
          </Paper>
        </Grid>
      </Grid>

        <Grid size={12} sx={{ mt: 4 }}>
        <Typography variant="h3" fontWeight="bold">
         You Might Also Like
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
         Indulge in expertly curated selections, crafted for true connoisseurs.
        </Typography>
      </Grid>

        <Grid size={12} sx={{ mt: 4 }}>
          <ImageSlider />
        </Grid>

    </Grid>
  );
}
