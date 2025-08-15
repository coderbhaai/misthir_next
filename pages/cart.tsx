"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Container
} from "@mui/material";
import Addtocart from "../amitkk/components/Aaddtocard";

export default function ShippingPaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <Box sx={{ backgroundColor: "" }}>
      <Addtocart />
      <Container>
        <Box sx={{ py: 8 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={4}>
              {/* CONTACT DETAILS */}
              <Grid xs={12} md={4}>
                <Typography variant="h4" sx={{ fontWeight: 500, mb: 12 }}>Shipping and payment</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>01. CONTACT DETAILS</Typography>
                <TextField label="Your name" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
                <TextField label="Phone number" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
                <TextField label="Email" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
              </Grid>

              {/* DELIVERY ADDRESS */}
              <Grid  xs={12} md={4}>
                <Box sx={{ mb: 12 }}>
                  <RadioGroup row>
                    <FormControlLabel value="Deliver" control={<Radio />} label="Deliver" />
                    <FormControlLabel value="Pickup" control={<Radio />} label="Pickup" />
                  </RadioGroup>
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>02. DELIVERY ADDRESS</Typography>
                <TextField label="Street" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="House" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} /></Grid>
                  <Grid item xs={4}><TextField label="Floor" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} /></Grid>
                  <Grid item xs={4}><TextField label="Flat" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} /></Grid>
                  <Grid item xs={12}><TextField label="Door code" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} /></Grid>
                </Grid>
              </Grid>

              {/* PAYMENT METHOD */}
              <Grid  xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>03. PAYMENT METHOD</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Choose a payment method</Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel value="card" control={<Radio />} label="Pay by card" />
                  <TextField label="Card number" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
                  <FormControlLabel value="courier" control={<Radio />} label="Pay to the courier" />
                </RadioGroup>
              </Grid>

              {/* COMMENT */}
              <Grid  xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>CONTACT DETAILS</Typography>
                  <TextField label="Comment" variant="outlined" fullWidth multiline rows={2} sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "40px" } }} />
                </Box>
              </Grid>

              {/* TOTAL & CHECKOUT */}
              <Grid  xs={12} md={6}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 8, gap: 2 }}>
                  <Typography variant="h5" sx={{ color: "#00AEB4" }}>$ 188.90</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField label="Promo Code" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }} />
                    <Button variant="contained" sx={{ backgroundColor: "#00b4aa", color: "white", borderRadius: 20, px: 6, py: 3.5, height: 40, "&:hover": { backgroundColor: "#009b90" } }}>Checkout</Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
