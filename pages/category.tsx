"use client";

import { useState } from "react";
import { Grid, Box, Typography, Button, Stack, Menu, MenuItem, Container } from "@mui/material";


const categoryData = [
  { name: "Cake", subs: ["Chocolate Truffle Cake", "Red Velvet Cake", "Vintage Cream Cake", "Black Forest Cake"] },
  { name: "Cupcake", subs: ["Vanilla Cupcakes", "Chocolate Cupcakes", "Red Velvet Cupcakes", "Blueberry Cupcakes"] },
  { name: "Brownie", subs: ["Fudgy Brownies", "Walnut Brownies", "Nutella Brownies", "Cheesecake Brownies"] },
  { name: "Biscuit", subs: ["Butter Cookies", "Choco Chip Cookies", "Oreo Biscuits", "Digestive Biscuits"] },
  { name: "Pastry", subs: ["Strawberry Pastry", "Chocolate Pastry", "Pineapple Pastry", "Mango Pastry"] },
  { name: "Bread", subs: ["Fresh Baked Bread", "Whole Wheat Bread", "Garlic Bread", "Multigrain Bread"] },
];

const items = [
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake" },
  { img: "/images/cake3.jpeg", title: "Red Velvet Cake", titleamt: "$280", weight: "1 KG", type: "Cream Cheese Frosting", category: "Cake" },
  { img: "/images/cake3.jpeg", title: "Vintage Cream Cake", titleamt: "$300", weight: "1.5 KG", type: "Whipped Cream & Berries", category: "Cake" },
  { img: "/images/cake3.jpeg", title: "Black Forest Cake", titleamt: "$270", weight: "1 KG", type: "Cherries & Chocolate", category: "Cake" },

  { img: "/images/cake3.jpeg", title: "Vanilla Cupcakes", titleamt: "$120", weight: "6 pcs", type: "Buttercream Swirl", category: "Cupcake" },
  { img: "/images/cake3.jpeg", title: "Chocolate Cupcakes", titleamt: "$130", weight: "6 pcs", type: "Dark Choco Frosting", category: "Cupcake" },
  { img: "/images/cake3.jpeg", title: "Red Velvet Cupcakes", titleamt: "$140", weight: "6 pcs", type: "Cream Cheese Frosting", category: "Cupcake" },
  { img: "/images/cake3.jpeg", title: "Blueberry Cupcakes", titleamt: "$150", weight: "6 pcs", type: "Fresh Blueberries", category: "Cupcake" },

  { img: "/images/cake3.jpeg", title: "Fudgy Brownies", titleamt: "$180", weight: "6 pcs", type: "Chocolate Chunk", category: "Brownie" },
  { img: "/images/cake3.jpeg", title: "Walnut Brownies", titleamt: "$190", weight: "6 pcs", type: "Walnuts & Chocolate", category: "Brownie" },
  { img: "/images/cake3.jpeg", title: "Nutella Brownies", titleamt: "$200", weight: "6 pcs", type: "Nutella Swirl", category: "Brownie" },
  { img: "/images/cake3.jpeg", title: "Cheesecake Brownies", titleamt: "$210", weight: "6 pcs", type: "Cream Cheese Blend", category: "Brownie" },

  { img: "/images/cake3.jpeg", title: "Butter Cookies", titleamt: "$90", weight: "250 g", type: "Crispy & Buttery", category: "Biscuit" },
  { img: "/images/cake3.jpeg", title: "Choco Chip Cookies", titleamt: "$110", weight: "250 g", type: "Chocolate Chips", category: "Biscuit" },
  { img: "/images/cake3.jpeg", title: "Oreo Biscuits", titleamt: "$95", weight: "200 g", type: "Chocolate & Cream", category: "Biscuit" },
  { img: "/images/cake3.jpeg", title: "Digestive Biscuits", titleamt: "$85", weight: "250 g", type: "Healthy Whole Wheat", category: "Biscuit" },

  { img: "/images/cake3.jpeg", title: "Strawberry Pastry", titleamt: "$150", weight: "2 pcs", type: "Fresh Strawberry Cream", category: "Pastry" },
  { img: "/images/cake3.jpeg", title: "Chocolate Pastry", titleamt: "$160", weight: "2 pcs", type: "Dark Chocolate Layers", category: "Pastry" },
  { img: "/images/cake3.jpeg", titleamt: "$140", weight: "2 pcs", type: "Pineapple Cream", category: "Pastry" },
  { img: "/images/cake3.jpeg", titleamt: "$150", weight: "2 pcs", type: "Fresh Mango Cream", category: "Pastry" },

  { img: "/images/cake3.jpeg", title: "Fresh Baked Bread", titleamt: "$70", weight: "400 g", type: "Soft & Fluffy", category: "Bread" },
  { img: "/images/cake3.jpeg", title: "Whole Wheat Bread", titleamt: "$60", weight: "400 g", type: "Healthy & Soft", category: "Bread" },
  { img: "/images/cake3.jpeg", title: "Garlic Bread", titleamt: "$80", weight: "300 g", type: "Garlic & Herbs", category: "Bread" },
  { img: "/images/cake3.jpeg", title: "Multigrain Bread", titleamt: "$85", weight: "400 g", type: "Seeds & Grains", category: "Bread" },
];

export default function CakeGrid() {
  const [filter, setFilter] = useState("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentSubs, setCurrentSubs] = useState<string[]>([]);

  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>, subs: string[], category: string) => {
    if (subs.length > 0) { setAnchorEl(event.currentTarget); setCurrentSubs(subs); setFilter(category); } 
    else { setFilter(category); }
  };

  const handleSubClick = (sub: string) => { setFilter(sub); setAnchorEl(null); };
  const handleClose = () => { setAnchorEl(null); };

  const filteredItems = filter === "All" ? items : items.filter((item) => item.category === filter || item.title === filter);

  return (
    <Container>
      <Box sx={{ py: 6 }}>
        <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
          <Button variant={filter === "All" ? "contained" : "outlined"} onClick={() => setFilter("All")}>All</Button>
          {categoryData.map((cat) => (
            <Button key={cat.name} variant={filter === cat.name ? "contained" : "outlined"} onClick={(e) => handleCategoryClick(e, cat.subs, cat.name)}>{cat.name}</Button>
          ))}
        </Stack>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {currentSubs.map((sub) => <MenuItem key={sub} onClick={() => handleSubClick(sub)}>{sub}</MenuItem>)}
        </Menu>

        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {filteredItems.map((item, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
              <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 2, boxShadow: "0 6px 20px rgba(0,0,0,0.2)", "&:hover .hoverContent": { opacity: 1, transform: "translateY(0)" }, "&:hover .defaultText": { opacity: 0, transform: "translateY(100%)" } }}>
                <Box component="img" src={item.img} alt={item.title} sx={{ width: "100%", height: 350, objectFit: "cover", display: "block" }} />
                <Box className="defaultText" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, color: "#000", p: 2, textAlign: "center", transition: "all 0.3s ease", backdropFilter: "blur(6px)" }}>
                  <Typography variant="body1">{item.title}</Typography>
                  <Typography variant="body1">{item.titleamt}</Typography>
                </Box>
                <Box className="hoverContent" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 0, transform: "translateY(20px)", transition: "all 0.3s ease", color: "#fff" }}>
                  <Typography variant="body1">{item.weight}</Typography>
                  <Typography variant="h6" sx={{ py: 2 }}>{item.type}</Typography>
                  <Typography variant="h4" sx={{ mb: 2 }}>{item.titleamt}</Typography>
                  <Button variant="contained" sx={{ borderRadius: 10, px: 4 }}>Buy Now</Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
