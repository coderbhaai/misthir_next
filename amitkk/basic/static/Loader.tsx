// components/Loader.tsx
"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

interface LoaderProps {
  message?: string;
  height?: string | number;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading...", height = "70vh" }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={height}
      width="100%"
    >
      <CircularProgress color="primary" size={60} />
      <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;