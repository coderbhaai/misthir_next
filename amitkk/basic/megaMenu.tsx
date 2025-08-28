// megaMenu.tsx
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function MegaMenu() {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        bgcolor: "white",
        borderRadius: 1,
        p: 3,
        zIndex: 60,
        boxShadow: 3,
      }}
    >
      <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
        {/* LEFT SIDE - IMAGE */}
        <Box sx={{ flex: "0 0 250px" }}>
          <Image
            src="/images/logo.svg"
            alt="Popular Cities"
            width={250}
            height={160}
            style={{ borderRadius: "8px", objectFit: "cover" }}
          />
        </Box>

        {/* RIGHT SIDE - CONTENT */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Popular Cities
          </Typography>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["New York", "London", "Paris", "Tokyo"].map((city, i) => (
              <Typography
                key={i}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                  minWidth: 120,
                }}
              >
                {city}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
