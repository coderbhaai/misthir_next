import { useState } from "react";
import { Grid, Box, Typography, Button, Stack, } from "@mui/material";

const items = [
  { img: "/images/cake.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250"},
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250"},
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
  { img: "/images/cake3.jpeg", title: "Chocolate Truffle Cake", titleamt: "$250", weight: "1 KG", type: "Rich Chocolate & Ganache", category: "Cake", amt: "$250" },
];


export default function CakeGrid() {
  const [filter, setFilter] = useState("All");

  const filteredItems =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      <Box sx={{py: 3, textAlign: "center"}}>
       <Stack direction="row" spacing={0} justifyContent="center" mb={3}
       sx={{display: "inline-flex",borderRadius: 50,overflow: "hidden",border: "1px solid #3B923C",backgroundColor: "#e6f4e6", 
      }}
     >
    {["All","Cake","Cupcake","Brownie","Biscuit","Pastry","Bread",]
    .map((name, idx, arr) => (
      <Button key={name} onClick={() => setFilter(name)}
        sx={{borderRadius: 0,backgroundColor: filter === name ? "#3B923C" : "transparent",color: filter === name ? "#fff" : "#3B923C",fontWeight: 500,px: 2,minWidth: "auto",display: "flex",alignItems: "center",justifyContent: "center",
        "&:hover": {backgroundColor: "#2f732f", color: "#fff",},"&::after": {content: idx !== arr.length - 1 ? '""' : 'none',position: "absolute",top: 0,right: 0,width: "1px",height: "100%",backgroundColor: "#3B923C",},}}>
      {name}
    </Button>
  ))}
  </Stack>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {filteredItems.map((item, index) => (
            <Grid key={index}>
              <Box
                sx={{position: "relative",overflow: "hidden",borderRadius: 2,boxShadow: "0 6px 20px rgba(0,0,0,0.2)",transform: "perspective(800px) translateZ(0)",transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {transform: "perspective(800px) translateZ(10px) scale(1.02)",boxShadow: "0 12px 30px rgba(0,0,0,0.3)",},
                  "&:hover .hoverContent": {opacity: 1,transform: "translateY(0)",},
                  "&:hover .defaultText": {opacity: 0,transform: "translateY(100%)",},
                  "&:hover .tintOverlay": {opacity: 1,},
                }}
              >
                <Box component="img" src={item.img} alt={item.title} sx={{ width: "100%", height: 350, objectFit: "cover", display: "block",}}/>
                <Box className="tintOverlay" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s ease", pointerEvents: "none", }}/>
                <Box className="defaultText" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, color: "#000",  p: 2, textAlign: "center", transition: "all 0.3s ease", backdropFilter: "blur(6px)",  WebkitBackdropFilter: "blur(2px)",}}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">{item.title}</Typography>
                    <Typography variant="body1">{item.titleamt}</Typography>
                  </Box>
               </Box>
                <Box className="hoverContent"
                  sx={{position: "absolute",inset: 0,bgcolor: "rgba(0,0,0,0.6)",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",opacity: 0,transform: "translateY(20px)",transition: "all 0.3s ease",color: "#fff", }}>
                  <Typography variant="body1">{item.weight}</Typography>
                  <Typography variant="h6" sx={{ py: 2 }}>{item.type}</Typography>
                  <Typography variant="h4" sx={{ mb: 2 }}>{item.amt}</Typography>
                  <Button  variant="contained"  sx={{  backgroundColor: "#028a9cff",  "&:hover": { backgroundColor: "#155b70ad" },  borderRadius: 10,  px: 4,   }}>Buy Now</Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
