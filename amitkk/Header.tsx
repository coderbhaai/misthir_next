// "use client";

// import Link from "next/link";
// import { AppBar, Toolbar, Typography, Box, Button, IconButton } from "@mui/material";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

// export default function BakeryHeader() {
//   const menuItems = [
//     { label: "Home", href: "/" },
//     { label: "Menu", href: "/menu" },
//     { label: "About", href: "/about" },
//     { label: "Contact", href: "/contact" },
//     { label: "My Order", href: "/cart" }, 
//     { label: "Category", href: "/category" }, 
//   ];

//   return (
//     <AppBar
//       position="static"
//       elevation={0}
//       sx={{
//         backgroundColor: "#fff8f0",
//         color: "#5a3825",
//         borderBottom: "1px solid #f0e0d0",
//         px: { xs: 2, md: 6 },
//       }}
//     >
//       <Toolbar sx={{ justifyContent: "space-between" }}>
//         <Typography
//           variant="h6"
//           sx={{
//             fontWeight: 700,
//             fontFamily: "'Pacifico', cursive",
//             color: "#d2691e",
//           }}
//         >
//           SweetBite
//         </Typography>
//         <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
//           {menuItems.map((item) => (
//             <Link key={item.label} href={item.href} passHref>
//               <Button
//                 sx={{
//                   color: "#5a3825",
//                   textTransform: "none",
//                   fontWeight: 500,
//                   "&:hover": { color: "#d2691e" },
//                 }}
//               >
//                 {item.label}
//               </Button>
//             </Link>
//           ))}
//         </Box>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <IconButton sx={{ color: "#5a3825" }}>
//             <ShoppingCartIcon />
//           </IconButton>
//           <IconButton sx={{ color: "#5a3825" }}>
//             <PersonOutlineIcon />
//           </IconButton>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }













"use client";

import Link from "next/link";
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useState } from "react";
import CartSidebar from "./components/CartSidebar";


export default function BakeryHeader() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "My Order", href: "/cart" },
    { label: "Category", href: "/category" },
  ];

  return (
    <>
      <AppBar position="static" elevation={0}
        sx={{ backgroundColor: "#fff8f0", color: "#5a3825", borderBottom: "1px solid #f0e0d0", px: { xs: 2, md: 6 },}}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{fontWeight: 700, fontFamily: "'Pacifico', cursive", color: "#d2691e",}}
          >
            SweetBite
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} passHref>
                <Button sx={{color: "#5a3825",textTransform: "none",fontWeight: 500,"&:hover": { color: "#d2691e" },}}>
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: "#5a3825" }} onClick={() => setOpen(true)}>
              <ShoppingCartIcon />
            </IconButton>
            <IconButton sx={{ color: "#5a3825" }}>
              <PersonOutlineIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <CartSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
