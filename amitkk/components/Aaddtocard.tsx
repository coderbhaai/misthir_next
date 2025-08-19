"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  Button,
  Container,
  useMediaQuery,
} from "@mui/material";
import { Add, Remove, Close } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function Addtocart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, category: "Cake", name: "Vintage", weight: "2.4 KG", count: 1, price: 189,img: "/images/cake3.jpeg"},
  ]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCountChange = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.max(1, item.count + delta) } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.count, 0);

  return (
    <Box sx={{ backgroundColor: "" }}>
      <Container>
        <Box sx={{ mx: "auto", p: { xs: 2, sm: 3 } }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ mb: 2, textAlign: isMobile ? "center" : "left" }}
          >
            Shopping Cart
          </Typography>

          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "white",
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar variant="square" src={item.img} alt={item.name} sx={{ width: 70, height: 70, borderRadius: 2 }}/>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.category}
                      </Typography>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.weight}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Box>
                      <IconButton size="small" onClick={() => handleCountChange(item.id, -1)}>
                        <Remove fontSize="small" />
                      </IconButton>
                      {item.count}
                      <IconButton size="small" onClick={() => handleCountChange(item.id, 1)}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography sx={{ fontWeight: 500 }}>${item.price.toFixed(2)}</Typography>
                    <IconButton onClick={() => handleDelete(item.id)}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "green" }}>Product</TableCell>
                  <TableCell align="center" sx={{ color: "green" }}>
                    Count
                  </TableCell>
                  <TableCell align="center" sx={{ color: "green" }}>
                    Price
                  </TableCell>
                  <TableCell align="center" sx={{ color: "green" }}>
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar variant="square" src={item.img} alt={item.name} sx={{ width: 150, height: 180, borderRadius: 2 }}/>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            {item.category}
                          </Typography>
                          <Typography sx={{py:4}}  variant="h6">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.weight}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 20 }} align="center">
                      <IconButton onClick={() => handleCountChange(item.id, -1)} sx={{ bgcolor: "#ffff",  "&:hover": { bgcolor: "#e0e0e0" },  borderRadius: "50%",  width: 32, height: 32, marginRight: 1, border:1 }}>
                        <Remove fontSize="small" />
                      </IconButton>
                      {item.count}
                      <IconButton onClick={() => handleCountChange(item.id, 1)} sx={{ bgcolor: "#ffff", "&:hover": { bgcolor: "#e0e0e0" }, borderRadius: "50%", width: 32, height: 32, marginLeft: 1, border:1 }}>
                        <Add fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: 20 }} align="center">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleDelete(item.id)}>
                        <Close />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              p: 2,
              mt: 3,
            }}
          >
            <Typography variant="h6">
              Total:{" "}
              <Box component="span" sx={{ color: "green" }}>
                ${totalPrice.toFixed(2)}
              </Box>
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Promo Code"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 20, height: 40 },
                  minWidth: 150,
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#00b4aa",
                  color: "white",
                  borderRadius: 20,
                  px: 3,
                  height: 40,
                  "&:hover": { backgroundColor: "#009b90" },
                }}
              >
                Checkout
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
