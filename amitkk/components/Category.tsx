import { useState } from "react";
import { Grid, Box, Button, Stack, IconButton, Tooltip, Drawer, Typography, TextField, MenuItem, Divider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CloseIcon from "@mui/icons-material/Close";

const items = [
   { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake1111111", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
    { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake22222222", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers! chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
    { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake333333333", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
    { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake4444444444444", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
    { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake555555555555", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
    { 
    img: "/images/cake3.jpeg", 
    title: "Chocolate Truffle Cake66666666666666", 
    category: "Cake",
    description: "A rich and moist chocolate truffle cake made with premium cocoa and layered with silky smooth chocolate ganache. Perfect for celebrations and gifting. This cake is crafted with care to bring out the finest flavors of chocolate, ensuring every bite melts in your mouth. A true indulgence for chocolate lovers!" 
  },
];    

export default function CakeGrid() {
  const [filter, setFilter] = useState("All");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [value, setValue] = useState("200");
  const [selectedWeight, setSelectedWeight] = useState(200);
  const pricePerGram = 1;

  const handleChange = (_: any, newValue: string | null) => { if (newValue !== null) setValue(newValue); };
  const filteredItems = filter === "All" ? items : items.filter((item) => item.category === filter);

  const handleWishlist = (item: any) => { setWishlist((prev) => [...prev, item]); setDrawerOpen(true); };
  const handleDetails = (item: any) => { setSelectedItem(item); setDetailDrawerOpen(true); };
  const handleBulkOrder = (item: any) => { setSelectedItem(item); setBulkDrawerOpen(true); };

  const [quantity, setQuantity] = useState(1);
  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleWeightChange = (weight: number) => setSelectedWeight(weight);
  const totalPrice = selectedWeight * pricePerGram * quantity;

  const [tab, setTab] = useState("description");
  const handleTabChange = (event: React.MouseEvent<HTMLElement>, newTab: string) => { if (newTab !== null) setTab(newTab); };

  return (
    <Box sx={{ py: 3, textAlign: "center" }}>
      <Stack direction="row" spacing={0} justifyContent="center" mb={3} sx={{ display: "inline-flex", borderRadius: 50, overflow: "hidden", border: "1px solid #3B923C", backgroundColor: "#e6f4e6" }}>
        {["All", "Cake", "Cupcake", "Brownie", "Biscuit", "Pastry", "Bread"].map((name, idx, arr) => (
          <Button key={name} onClick={() => setFilter(name)} sx={{ position: "relative", borderRadius: 0, backgroundColor: filter === name ? "#3B923C" : "transparent", color: filter === name ? "#fff" : "#3B923C", fontWeight: 500, px: 2, minWidth: "auto", "&:hover": { backgroundColor: "#2f732f", color: "#fff" }, "&::after": { content: idx !== arr.length - 1 ? '""' : "none", position: "absolute", top: 0, right: 0, width: "1px", height: "100%", backgroundColor: "#3B923C" } }}>
            {name}
          </Button>
        ))}
      </Stack>

      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        {filteredItems.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 2, boxShadow: "0 6px 20px rgba(0,0,0,0.1)", height: 350 }}>
              <Box component="img" src={item.img} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-between", gap: 2, p: 1, background: "rgba(0,0,0,0.4)" }}>
                <Tooltip title="Add to wishlist"><IconButton onClick={() => handleWishlist(item)} sx={{ color: "#fff" }}><FavoriteBorderOutlinedIcon /></IconButton></Tooltip>
                <Tooltip title="View details"><IconButton onClick={() => handleDetails(item)} sx={{ color: "#fff" }}><InfoOutlinedIcon /></IconButton></Tooltip>
                <Tooltip title="Bulk order"><IconButton onClick={() => handleBulkOrder(item)} sx={{ color: "#fff" }}><Inventory2OutlinedIcon /></IconButton></Tooltip>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 450, p: 2 }}>
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", mb: 2, backgroundColor: "#d6d6d6" }}>
            <Typography variant="h6" sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>Add Wishlist Here</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <form>
            <TextField label="Name" fullWidth size="small" margin="normal" variant="outlined" required />
            <TextField label="Email" type="email" size="small" fullWidth margin="normal" variant="outlined" required />
            <TextField label="Phone" type="tel" size="small" fullWidth margin="normal" variant="outlined" required />
            <TextField label="Product Details" size="small" value="Product Name - $100" fullWidth margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
            <TextField label="Remarks" multiline rows={3} fullWidth margin="normal" variant="outlined" />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, borderRadius: 2, bgcolor: "black" }} fullWidth>Submit</Button>
          </form>
        </Box>
      </Drawer>
      <Drawer anchor="right" open={bulkDrawerOpen} onClose={() => setBulkDrawerOpen(false)}>
        <Box sx={{ width: 500, p: 1 }}>
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", mb: 1, backgroundColor: "#d6d6d6" }}>
            <Typography variant="h6" sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>Add Bulk orde</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <form>
            <TextField label="Name" fullWidth size="small" margin="normal" variant="outlined" required />
            <TextField label="Email" type="email" size="small" fullWidth margin="normal" variant="outlined" required />
            <TextField label="Phone" type="tel" size="small" fullWidth margin="normal" variant="outlined" required />
            <TextField label="Product Details" size="small" value="Product Name - $100" fullWidth margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
            <TextField select label="SKU" fullWidth size="small" margin="normal" required defaultValue="">
              <MenuItem value="" disabled>Select SKU</MenuItem>
              <MenuItem value="SKU001">500Mg</MenuItem>
              <MenuItem value="SKU001">1 Kg</MenuItem>
            </TextField>
            <TextField label="Quantity" type="number" fullWidth size="small" margin="normal" required defaultValue={1} inputProps={{ min: 1 }} />
            <TextField label="Massage" multiline rows={3} fullWidth margin="normal" variant="outlined" />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, borderRadius: 2, bgcolor: "black" }} fullWidth>Submit</Button>
          </form>
        </Box>
      </Drawer>
      <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)}>
        {selectedItem && (
          <Box sx={{ width: "75vw", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, backgroundColor: "#d6d6d6", p: 1 }}>
              <Typography variant="h6">{selectedItem.title}</Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box component="img" src={selectedItem.img} alt={selectedItem.title} sx={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="h5" gutterBottom>{selectedItem.title}</Typography>
                <Typography variant="body1" sx={{ textAlign: "justify" }}>{selectedItem.description}</Typography>
                <Typography sx={{ mt: 2 }}> select SKU</Typography>

                <Box>
                  <Box display="flex" gap={2} mt={2}>
                    {[200, 400, 600].map(weight => (
                      <Button key={weight} variant={selectedWeight === weight ? "contained" : "outlined"} sx={{ borderRadius: "50px", px: 3, textTransform: "none", bgcolor: selectedWeight === weight ? "#ff69b4" : "white", color: selectedWeight === weight ? "white" : "#ff69b4", "&:hover": { bgcolor: "#ff85c1", color: "white" } }} onClick={() => handleWeightChange(weight)}>{weight} gram</Button>
                    ))}
                  </Box>

                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", border: "1px solid #ff69b4", borderRadius: "50px", overflow: "hidden", width: "fit-content" }}>
                    <Button variant="text" sx={{ minWidth: 40, borderRadius: 0, px: 2, color: "#ff69b4", "&:hover": { backgroundColor: "#ffe0f0" } }} onClick={handleDecrease}>-</Button>
                    <Typography sx={{ minWidth: 40, textAlign: "center", fontWeight: "bold", color: "#ff69b4" }}>{quantity}</Typography>
                    <Button variant="text" sx={{ minWidth: 40, borderRadius: 0, px: 2, color: "#ff69b4", "&:hover": { backgroundColor: "#ffe0f0" } }} onClick={handleIncrease}>+</Button>
                  </Box>

                  <Typography sx={{ mt: 2, fontWeight: "bold", fontSize: "1.2rem" }}>₹{totalPrice}</Typography>
                  <Divider sx={{ my: 2, height: "2px", backgroundColor: "#ff69b4", border: "none" }} />

                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>SKU: <span style={{ fontWeight: "normal" }}>XYZXYZXYZZ-1425360062</span></Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Availability: <span style={{ fontWeight: "normal" }}>Pan India</span></Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Category: <span style={{ fontWeight: "normal" }}>Fresh Meals For Pets</span></Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
             <Grid container spacing={2} sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}>
              <Grid size={12}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb:3  }}>
                  <ToggleButtonGroup
                    value={tab}
                    exclusive
                    onChange={handleTabChange}
                    sx={{
                      gap: 2,
                      "& .MuiToggleButton-root": {
                        borderRadius: "50px",
                        px: 3,
                        fontSize: "0.9rem",
                        textTransform: "none",
                        border: "1px solid pink",
                        "&.Mui-selected": {
                          backgroundColor: "#ff69b4",
                          color: "#fff",
                          border: "1px solid #ff69b4",
                        },
                        "&:hover": { backgroundColor: "#ff85c1" },
                      },
                    }}
                  >
                    <ToggleButton value="description">Description</ToggleButton>
                    <ToggleButton value="review">Review</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              {tab === "description" && (
                <Grid size={12}>
                  <Typography variant="body1" sx={{ textAlign: "justify" }}>
                    {selectedItem.description}
                  </Typography>
                </Grid>
              )}

              {tab !== "description" && (

              <Grid size={12}  sx={{ mt: 2 }}>
              <Box sx={{ display: "flex",flexDirection: "column",  justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
                <Typography variant="body1" sx={{mt:2,fontWeight: "bold"}}>Please Login to submit a review</Typography>
                <Button variant="contained"
                  sx={{ borderRadius: 2, bgcolor: "#ff69b4", "&:hover": { bgcolor: "#d81b60" } }}>
                  Login
                </Button>
              </Box>
              </Grid>

              )}
              </Grid>

             </Grid>

                  {tab === "description" && (
                    <Grid size={12}>
                      <Typography variant="body1" sx={{ textAlign: "justify" }}>
                        {selectedItem.description}
                      </Typography>
                    </Grid>
                  )}
            
          </Box>
        )}
      </Drawer>
    </Box>
  );
}