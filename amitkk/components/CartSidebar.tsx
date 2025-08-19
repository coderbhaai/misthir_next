"use client";
import { useState } from "react";
import { Drawer, Box, Typography, List, ListItem, Button, Card, CardMedia, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const [counts, setCounts] = useState([1, 1]);

  const handleIncrease = (index: number) => {
    setCounts((prev) => prev.map((c, i) => (i === index ? c + 1 : c)));
  };

  const handleDecrease = (index: number) => {
    setCounts((prev) => prev.map((c, i) => (i === index ? Math.max(1, c - 1) : c)));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2 }}>
           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2,backgroundColor: "#d6d6d6"}}>
            <Typography variant="h6">My Cart</Typography>
            <IconButton onClick={onClose}>
                <CloseIcon />
            </IconButton>
         </Box>
        <List>
          {[0, 1].map((index) => (
            <ListItem key={index} disablePadding sx={{ mb: 2 }}>
              <Card sx={{ display: "flex", width: "100%", p: 1, alignItems: "center" }}>
                <CardMedia
                  component="img"
                  sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                  image="/images/cake33.jpg"
                  alt="choco-image"
                />
                <Box sx={{ flex: 1, ml: 2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDecrease(index)}
                        size="small"
                        sx={{ border: "1px solid #ccc", width: 24, height: 24, p: 0.3 }}
                      >
                        <Remove sx={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography variant="body1">{counts[index]}</Typography>
                      <IconButton
                        onClick={() => handleIncrease(index)}
                        size="small"
                        sx={{ border: "1px solid #ccc", width: 24, height: 24, p: 0.3 }}
                      >
                        <Add sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {counts[index]} @ ₹299 = ₹{counts[index] * 299}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Lorem, ipsum dolor sit amet consectetur
                  </Typography>
                </Box>
              </Card>
            </ListItem>
          ))}
        </List>

      </Box>
    </Drawer>
  );
}
