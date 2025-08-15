import { Box, Typography, TextField, InputAdornment, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";

export default function PromoBanner() {
  return (
    <Box sx={{ p:10 ,background: "linear-gradient(to bottom, #4c5517ff, #d4db81ff)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", }}>
      <Typography variant="h6" sx={{ mb: 1,width: "100%", textAlign: "center", }}>DO NOT MISS</Typography>
      <Typography variant="h3">OUR SIGNATURE NOVELTIES AND PROMOTIONS</Typography>
      <TextField placeholder="Your Email" variant="outlined" sx={{ mt: 3, width: "100%", maxWidth: 320, borderRadius: "30px","& .MuiOutlinedInput-root": { borderRadius: "30px", paddingRight: 0},"& input": { padding: "10px 20px" }}}
        InputProps={{
           endAdornment: (
            <InputAdornment position="end">
              <IconButton sx={{ borderRadius: "50%", border: "1px solid #000" }}>
                <ArrowForwardIcon />
              </IconButton>
            </InputAdornment>
          )}}/>
    </Box>
  );
}
