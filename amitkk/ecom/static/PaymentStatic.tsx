"use client";
import PaymentIcon from '@mui/icons-material/Payment';
import { Grid, Paper, Box, Typography } from "@mui/material";
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function PaymentStatic() {
  return (
    <Grid size={12}>
      <Paper sx={{ p: 2, bgcolor: "#d6d6d6", border: "1px solid black", borderRadius: "15px 15px 0 0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">PhonePe Secure (UPI, Cards, Wallets, NetBanking)</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <CreditCardIcon/>
            <PaymentIcon/>
            <PaymentIcon/>
            <PaymentIcon/>
          </Box>
        </Box>
        <Box sx={{ mt: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {/* <Image src="/images/payment.svg" alt="Payment Methods" width={200} height={50} /> */}
          <Typography sx={{ mt: 2 }} variant="body2">
            After clicking “Pay now”, you will be redirected to PhonePe Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );
}
