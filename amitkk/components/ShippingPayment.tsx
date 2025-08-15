"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  InputAdornment,
} from "@mui/material";

export default function ShippingPaymentForm() {
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Shipping and payment</Typography>

      <ToggleButtonGroup value={deliveryType} exclusive onChange={(e, val) => val && setDeliveryType(val)} sx={{ mb: 4 }}>
        <ToggleButton value="delivery">Delivery</ToggleButton>
        <ToggleButton value="pickup">Pickup</ToggleButton>
      </ToggleButtonGroup>
        <Box sx={{flexGrow :1}}>
            <Grid container spacing={4}>
              <Grid size={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>01. CONTACT DETAILS</Typography>
                <TextField label="Your name" variant="outlined" fullWidth sx={{ mb: 2 , "& .MuiOutlinedInput-root": {borderRadius: "30px",}, }}/>
                <TextField label="Phone number" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": {borderRadius: "30px",},  }}/>
                <TextField label="Email" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": {borderRadius: "30px",},  }}/>
              </Grid>
              <Grid size={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>02. DELIVERY ADDRESS</Typography>
                <TextField label="Street" variant="outlined" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": {borderRadius: "30px",},  }} />
                  <Box sx={{flexGrow :1}}>
                      <Grid container spacing={2}>
                        <Grid size={4}><TextField label="House" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": {borderRadius: "30px",}, }}/></Grid>
                        <Grid size={4}><TextField label="Floor" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": {borderRadius: "30px",}, }}/></Grid>
                        <Grid size={4}><TextField label="Flat" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": {borderRadius: "30px",}, }}/></Grid>
                        <TextField label="Door code" variant="outlined" fullWidth sx={{ "& .MuiOutlinedInput-root": {borderRadius: "30px",},  }}/>
                     </Grid>
                  </Box>
             </Grid>
              <Grid size={4}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>03. PAYMENT METHOD</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Choose a payment method</Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel value="card" control={<Radio />} label="Pay by card" />
                <TextField label="Card number" variant="outlined" fullWidth sx={{ mb: 2 ,"& .MuiOutlinedInput-root": {borderRadius: "30px",},  }}/>
                  <FormControlLabel value="courier" control={<Radio />} label="Pay to the courier"/>
                </RadioGroup>
              </Grid>
               <Grid size={6} >
                <Box>
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>CONTACT DETAILS</Typography>
                  <TextField label="Comment" variant="outlined" fullWidth multiline rows={2} sx={{ mb: 2, "& .MuiOutlinedInput-root": {borderRadius: "40px",},  }}/>
                </Box>
              </Grid>
               <Grid size={6} >
                <Box sx={{display: "flex", justifyContent:"center", alignItems: "center",mt: 8,gap: 2,}}>
                  <Typography variant="h3" sx={{ color: "#00AEB4" }}>$ 188.90</Typography>
                  <Button variant="outlined"sx={{ borderRadius: 20, px: 3, textTransform: "none" }}>Promo Code</Button>
                  <Button variant="contained" sx={{ borderRadius: 20, px: 4, textTransform: "none", backgroundColor: "#00AEB4",}}>
                    Checkout
                  </Button>
                </Box>
                
              </Grid>
            </Grid>
        </Box>
    </Box>
  );
}
