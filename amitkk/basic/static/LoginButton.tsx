import Link from "next/link";
import { Button, Box, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

export default function LoginButton() {
  return (
    <Box textAlign="center" sx={{ my: 5, p: 3, border: "1px dashed #ccc", borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Please Login to Submit a Review</Typography>
      <Link href="/login" passHref>
        <Button variant="contained" color="primary" startIcon={<LoginIcon />} sx={{ mt: 2, px: 4, borderRadius: "30px" }}>Login</Button>
      </Link>
    </Box>
  );
}
