import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/X";
import PinterestIcon from "@mui/icons-material/Pinterest";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Box,Typography,IconButton } from "@mui/material";

export default function ShareMe(){
    return(
      <Box display="flex" gap={4} flexWrap="wrap" alignItems="center">
        <Typography variant="body2">Share on</Typography>
        <IconButton href="https://www.facebook.com/tripsandstay" target="_blank" title="Facebook" sx={{ color: "#1877F2" }}><FacebookIcon /></IconButton>
        <IconButton href="https://twitter.com" target="_blank" title="X / Twitter" sx={{ color: "#000" }}><TwitterIcon /></IconButton>
        <IconButton href="https://pinterest.com" target="_blank" title="Pinterest" sx={{ color: "#E60023" }}><PinterestIcon /></IconButton>
        <IconButton href="https://linkedin.com" target="_blank" title="LinkedIn" sx={{ color: "#0A66C2" }}><LinkedInIcon /></IconButton>
      </Box>
    );
}