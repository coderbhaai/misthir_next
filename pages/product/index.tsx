"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageSlider from "../../amitkk/components/ImageSlider";

import {Stack,Typography,RadioGroup,FormControlLabel,Radio,Button,Grid,Card,CardMedia,IconButton,Collapse,} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export default function ProductPage() {
  const weightOptions = [
    { weight: "500g", price: 19.0 },
    { weight: "1kg", price: 34.0 },
  ];

  const [selectedFlavour, setSelectedFlavour] = useState("");
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0]);
  const [showOrdinary, setShowOrdinary] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [aboutOpen, setAboutOpen] = useState(true);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  
  return (
    <Grid container spacing={4} sx={{ px: 2, py: 4, width: "85vw", mx: "auto" }} gap={4}>
      <Grid size={{ xs: 12, sm: 5 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardMedia sx={{ position: "relative", height: 570, width: 460 }}>
            <Image src="/images/cake-img.jpg" alt="Chocolate Cake" fill style={{ objectFit: "cover", borderRadius: "8px", objectPosition: "bottom" }} />
          </CardMedia>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 7 }} mt={4}>
        <Stack spacing={3} alignItems="flex-start">
          <Button variant="text" sx={{ alignSelf: "flex-end", textTransform: "none", px: 0, minWidth: 0 }} onClick={() => setShowOrdinary(!showOrdinary)} endIcon={<span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", border: "1px solid" }}><KeyboardArrowRightIcon fontSize="small" /></span>}>{showOrdinary ? "custome" : "Ordinary"}</Button>     
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>Cake</Typography>
          <Typography variant="h4" fontWeight="medium" color="text.primary" gutterBottom sx={{ lineHeight: 1.2 }}>Chocolate Fudge Cake</Typography>

          {!showOrdinary ? (
            <>
              <Typography variant="body1" color="text.secondary">
                <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom sx={{ lineHeight: 1.2 }}>About cake</Typography>
                Rich and moist chocolate cake topped with creamy fudge frosting. Our chocolate cake is layered with a white chocolate ganache, covered in cookies and cream buttercream, and garnished with mini Oreos and more white chocolate ganache.
              </Typography>

              <RadioGroup row value={selectedWeight.weight} onChange={(e) => { const option = weightOptions.find((opt) => opt.weight === e.target.value); if (option) setSelectedWeight(option); }}>
                {weightOptions.map((option) => (
                  <FormControlLabel key={option.weight} value={option.weight} control={<Radio sx={{ color: "#ec407a", "&.Mui-checked": { color: "#ec407a" } }} />} label={option.weight} sx={{ border: "1px solid", mb: 3, borderColor: selectedWeight.weight === option.weight ? "#ec407a" : "grey.400", backgroundColor: selectedWeight.weight === option.weight ? "#f8bbd0" : "transparent", borderRadius: "8px", px: 2, mx: 1, "&:hover": { backgroundColor: "#fce4ec" } }} />
                ))}
              </RadioGroup>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h5" fontWeight="bold">${selectedWeight.price.toFixed(2)}</Typography>
                <Button variant="contained" sx={{ background: "linear-gradient(45deg, #f48fb1, #ec407a)", borderRadius: 2, px: 2, py: 1, fontSize: "1rem", "&:hover": { background: "linear-gradient(45deg, #ec407a, #f06292)" } }}>Add to Cart</Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold">Select Tier</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                {["1 Serving", "2 Serving", "3 Serving"].map((tier) => (
                  <Button key={tier} variant={selectedTier === tier ? "contained" : "outlined"} onClick={() => setSelectedTier(tier)}
                   sx={{"&:hover": {backgroundColor: selectedFlavour === tier ? "#f06292" : "#f8bbd0",},}}
                     >{tier}</Button>
                ))}
              </Stack>

              <Typography variant="h5" fontWeight="bold">Select Flavour</Typography>
              <Stack direction="row" spacing={2}>
                {["Cappuccino", "Chocolate", "Vanilla", "Strawberry", "Red Velvet"].map((flavour) => (
                  <Button key={flavour} variant={selectedFlavour === flavour ? "contained" : "outlined"} onClick={() => setSelectedFlavour(flavour)}
                    sx={{"&:hover": {backgroundColor: selectedFlavour === flavour ? "#f06292" : "#f8bbd0",},}}
                   >{flavour}
                  </Button>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Grid>

      <Grid size={12}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight="medium" color="text.primary">About cake</Typography>
          <IconButton size="small" onClick={() => setAboutOpen(!aboutOpen)} sx={{ borderRadius: "50%", border: "1px solid", borderColor: "#ec407a", width: 32, height: 32 }}>{aboutOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
        </Stack>
        <Collapse in={aboutOpen}>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Rich and moist chocolate cake topped with creamy fudge frosting. Our chocolate cake is layered with a white chocolate ganache, covered in cookies and cream buttercream, and garnished with mini Oreos and more white chocolate ganache.
          </Typography>
        </Collapse>
      </Grid>

      <Grid size={12}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
             With this look
          </Typography>
        <ImageSlider />
      </Grid>
    </Grid>
  );
}




















 