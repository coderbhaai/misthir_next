"use client";
import { Grid, Box, Typography, RadioGroup, Paper, Radio, TextField, FormControl, Checkbox, FormControlLabel, MenuItem, Button, Divider } from "@mui/material";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";

export default function CheckoutPage() {

    const [billingOption, setBillingOption] = useState("same");

  return (
    <Grid container spacing={4} sx={{ px: 2, py: 4, width: "85vw", mx: "auto" }}>
     
      <Grid size={7}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Contact</Typography>
        <TextField fullWidth label="Email" sx={{ mb: 2 }} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Email me with news and offers" />

        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>Delivery</Typography>
        <TextField select fullWidth label="Country" defaultValue="India" sx={{ mb: 2 }}>
          <MenuItem value="India">India</MenuItem>
          <MenuItem value="USA">USA</MenuItem>
        </TextField>

        <Grid container spacing={2}>
          <Grid size={6}><TextField fullWidth label="First Name" /></Grid>
          <Grid size={6}><TextField fullWidth label="Last Name" /></Grid>
        </Grid>

        <TextField fullWidth label="Address" sx={{ mt: 2 }} />
        <TextField fullWidth label="Apartment, suite, etc." sx={{ mt: 2 }} />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={4}><TextField fullWidth label="City" /></Grid>
          <Grid size={4}>
            <TextField select fullWidth label="State" defaultValue="Haryana">
              <MenuItem value="Haryana">Haryana</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
            </TextField>
          </Grid>
          <Grid size={4}><TextField fullWidth label="PIN Code" /></Grid>
          <TextField fullWidth label="Contect number" sx={{ mt: 2 }} />
          <FormControlLabel control={<Checkbox />} label="Save this information for next time" />
          <FormControlLabel control={<Checkbox />} label="Text me with news and offers" />

          <Grid size={12}>
            <Paper sx={{ p: 2, bgcolor: "#d6d6d6", border: "1px solid black", borderRadius: "15px 15px 0 0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">PhonePe Secure (UPI, Cards, Wallets, NetBanking)</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FaCcVisa size={25} color="#1a1f71" />
                  <FaCcMastercard size={25} color="#eb001b" />
                  <FaCcMastercard size={25} color="#eb001b" />
                  <FaCcMastercard size={25} color="#eb001b" />
                </Box>
              </Box>
              <Box sx={{ mt: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <Image src="/images/payment.svg" alt="Payment Methods" width={200} height={50} />
                <Typography sx={{ mt: 2 }} variant="body2">
                  After clicking “Pay now”, you will be redirected to PhonePe Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Box>
            <FormControl>
              <RadioGroup value={billingOption} onChange={(e) => setBillingOption(e.target.value)}>
                <FormControlLabel value="same" control={<Radio />} label="Same as shipping address" />
                <FormControlLabel value="different" control={<Radio />} label="Use a different billing address" />
              </RadioGroup>
            </FormControl>

            {billingOption === "different" && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Billing Address</Typography>

                <Grid size={12}>
                  <TextField select fullWidth label="Country" defaultValue="India" sx={{ mb: 2 }}>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                  </TextField>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={6}><TextField fullWidth label="First Name" /></Grid>
                    <Grid size={6}><TextField fullWidth label="Last Name" /></Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={4}><TextField fullWidth label="City" /></Grid>
                    <Grid size={4}><TextField fullWidth label="State / Province" /></Grid>
                    <Grid size={4}><TextField fullWidth label="Postal Code" /></Grid>
                  </Grid>

                  <TextField fullWidth label="Contect" sx={{ mb: 2 }} />
                  <Grid size={12}>
                    <Button variant="contained" fullWidth sx={{ backgroundColor: "black", color: "white" }}>Pay Now</Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider orientation="vertical" flexItem />

      <Grid size={4}>
        <Box sx={{ borderRadius: 2, p: 2, position: "sticky", top: 20 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box component="img" src="/images/cake33.jpg" alt="Product" sx={{ width: 60, height: 60, borderRadius: 1, mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight="bold">special cake</Typography>
              <Typography variant="body2" color="text.secondary">choco cake</Typography>
            </Box>
            <Typography fontWeight="bold">₹599</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Button variant="outlined" size="small">-</Button>
            <Typography sx={{ mx: 2 }}>3</Typography>
            <Button variant="outlined" size="small">+</Button>
            <Box sx={{ flexGrow: 1 }} />
            <Typography fontWeight="bold">₹1797</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Subtotal · 3 Items</Typography>
            <Typography>₹1797.00</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Shipping Charges (Inc)</Typography>
            <Typography>₹150.00</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">₹1947.00</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
